"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import { HOME_FEATURED_KEY, validateFeaturedShape, type FeaturedIssue, type HomeFeatured } from "@/lib/site/home-featured";

async function admin(): Promise<SupabaseClient | null> {
  const email = await getAdminEmail();
  return email ? createClient() : null;
}

/** الشكل + أن كل ملخص مختار موجود ومنشور وغير مؤرشف الآن */
async function checkValue(supabase: SupabaseClient, input: unknown): Promise<{ ok: true; value: HomeFeatured } | { ok: false; issues: FeaturedIssue[] }> {
  const shape = validateFeaturedShape(input);
  if (!shape.ok) return shape;
  const ids = shape.value.summary_ids;
  if (!ids.length) return shape;
  const { data, error } = await supabase.from("bh_summaries").select("id, book_title_ar, status, archived_at").in("id", ids);
  if (error) return { ok: false, issues: [{ message: `تعذّر التحقق من الملخصات: ${error.message}` }] };
  const rows = new Map(((data || []) as { id: string; book_title_ar: string; status: string; archived_at: string | null }[]).map((r) => [r.id, r]));
  const issues: FeaturedIssue[] = [];
  for (const id of ids) {
    const r = rows.get(id);
    if (!r) issues.push({ id, message: "ملخص غير موجود." });
    else if (r.archived_at) issues.push({ id, message: `«${r.book_title_ar}» مؤرشف ولا يمكن اختياره.` });
    else if (r.status !== "published") issues.push({ id, message: `«${r.book_title_ar}» غير منشور ولا يمكن اختياره.` });
  }
  return issues.length ? { ok: false, issues } : shape;
}

async function draftRow(supabase: SupabaseClient) {
  const { data } = await supabase.from("bh_site_content").select("value, updated_at")
    .eq("key", HOME_FEATURED_KEY).eq("state", "draft").maybeSingle();
  return data as { value: unknown; updated_at: string } | null;
}

export type FeaturedSaveResult =
  | { ok: true; draftUpdatedAt: string; value: HomeFeatured }
  | { ok: false; kind: "validation"; issues: FeaturedIssue[] }
  | { ok: false; kind: "conflict" | "error"; message: string };

/** حفظ المسودة فقط — لا يصل شيء إلى الصفحة العامة قبل «نشر» */
export async function saveHomeFeaturedDraft(input: unknown, expectedDraftUpdatedAt: string | null): Promise<FeaturedSaveResult> {
  const supabase = await admin();
  if (!supabase) return { ok: false, kind: "error", message: "غير مصرّح." };
  const current = await draftRow(supabase);
  if ((current?.updated_at ?? null) !== expectedDraftUpdatedAt)
    return { ok: false, kind: "conflict", message: "تغيّرت المسودة في مكان آخر بعد فتح المحرّر. أعد تحميل الصفحة قبل الحفظ." };
  const checked = await checkValue(supabase, input);
  if (!checked.ok) return { ok: false, kind: "validation", issues: checked.issues };

  const q = current
    ? supabase.from("bh_site_content").update({ value: checked.value })
        .eq("key", HOME_FEATURED_KEY).eq("state", "draft").eq("updated_at", current.updated_at)
    : supabase.from("bh_site_content").insert({ key: HOME_FEATURED_KEY, state: "draft", value: checked.value });
  const { data, error } = await q.select("updated_at").maybeSingle();
  if (error) return { ok: false, kind: "error", message: `تعذّر حفظ المسودة: ${error.message}` };
  if (!data) return { ok: false, kind: "conflict", message: "تغيّرت المسودة أثناء الحفظ. أعد تحميل الصفحة." };
  revalidatePath("/admin/site/home-featured");
  return { ok: true, draftUpdatedAt: (data as { updated_at: string }).updated_at, value: checked.value };
}

export type FeaturedActionResult = { ok: true } | { ok: false; kind?: "validation" | "draft_exists"; message: string; issues?: FeaturedIssue[] };

/** نشر المسودة المحفوظة بعد تحقق جديد (قد يكون ملخص مختار أُلغي نشره بين الحفظ والنشر) */
export async function publishHomeFeatured(expectedDraftUpdatedAt: string): Promise<FeaturedActionResult> {
  const supabase = await admin();
  if (!supabase) return { ok: false, message: "غير مصرّح." };
  const current = await draftRow(supabase);
  if (!current) return { ok: false, message: "لا توجد مسودة لنشرها. أعد تحميل الصفحة." };
  if (current.updated_at !== expectedDraftUpdatedAt) return { ok: false, message: "تغيّرت المسودة في مكان آخر. أعد تحميل الصفحة قبل النشر." };
  const checked = await checkValue(supabase, current.value);
  if (!checked.ok) return { ok: false, kind: "validation", message: "لم يُنشر: في المسودة المحفوظة ملخص لم يعد صالحاً للاختيار.", issues: checked.issues };
  const { error } = await supabase.rpc("bh_publish_site_content", { p_key: HOME_FEATURED_KEY });
  if (error) return { ok: false, message: `تعذّر النشر: ${error.message}` };
  revalidatePath("/");
  revalidatePath("/admin/site/home-featured");
  return { ok: true };
}

export async function discardHomeFeaturedDraft(): Promise<FeaturedActionResult> {
  const supabase = await admin();
  if (!supabase) return { ok: false, message: "غير مصرّح." };
  const { error } = await supabase.from("bh_site_content").delete().eq("key", HOME_FEATURED_KEY).eq("state", "draft");
  if (error) return { ok: false, message: `تعذّر التراجع: ${error.message}` };
  revalidatePath("/admin/site/home-featured");
  return { ok: true };
}

/** استرجاع نسخة سابقة إلى المسودة — لا ينشر شيئاً */
export async function restoreHomeFeaturedVersion(versionId: number, replaceExistingDraft: boolean): Promise<FeaturedActionResult> {
  const supabase = await admin();
  if (!supabase) return { ok: false, message: "غير مصرّح." };
  const { data: v } = await supabase.from("bh_site_content_versions").select("id, key").eq("id", versionId).maybeSingle();
  if (!v || (v as { key: string }).key !== HOME_FEATURED_KEY) return { ok: false, message: "النسخة غير موجودة لهذا القسم." };
  const { error } = await supabase.rpc("bh_restore_site_content_version", { p_version_id: versionId, p_replace_existing_draft: replaceExistingDraft });
  if (error) {
    if (error.code === "23514" && error.message.includes("unpublished draft")) return { ok: false, kind: "draft_exists", message: "توجد مسودة غير منشورة." };
    return { ok: false, message: `تعذّر الاسترجاع: ${error.message}` };
  }
  revalidatePath("/admin/site/home-featured");
  return { ok: true };
}
