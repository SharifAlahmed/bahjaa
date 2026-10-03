"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import { COVER_BUCKET } from "@/lib/admin/cover";
import { HOME_HERO_KEY, ownHeroImagePath, validateHomeHero, type HeroIssue, type HomeHero } from "@/lib/site/home-hero";

async function admin(): Promise<SupabaseClient | null> {
  const email = await getAdminEmail();
  return email ? createClient() : null;
}

const SUPABASE_URL = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;

/** التحقق من القيمة + أن صورة الـHero (إن وُجدت) ملف موجود فعلاً في مجلد الـHero */
async function checkValue(supabase: SupabaseClient, input: unknown): Promise<{ ok: true; value: HomeHero } | { ok: false; issues: HeroIssue[] }> {
  const res = validateHomeHero(input, SUPABASE_URL());
  if (!res.ok) return res;
  if (res.value.image_url) {
    const path = ownHeroImagePath(res.value.image_url, SUPABASE_URL())!;
    const slash = path.lastIndexOf("/");
    const { data, error } = await supabase.storage.from(COVER_BUCKET).list(path.slice(0, slash), { search: path.slice(slash + 1), limit: 100 });
    if (error || !(data || []).some((f) => f.name === path.slice(slash + 1)))
      return { ok: false, issues: [{ field: "image_url", message: "ملف الصورة غير موجود في التخزين." }] };
  }
  return res;
}

async function draftRow(supabase: SupabaseClient) {
  const { data } = await supabase.from("bh_site_content").select("value, updated_at")
    .eq("key", HOME_HERO_KEY).eq("state", "draft").maybeSingle();
  return data as { value: unknown; updated_at: string } | null;
}

export type HeroSaveResult =
  | { ok: true; draftUpdatedAt: string; value: HomeHero }
  | { ok: false; kind: "validation"; issues: HeroIssue[] }
  | { ok: false; kind: "conflict" | "error"; message: string };

/** حفظ المسودة فقط — لا يصل شيء إلى الصفحة العامة قبل «نشر». حماية من تبويبين عبر updated_at للمسودة. */
export async function saveHomeHeroDraft(input: unknown, expectedDraftUpdatedAt: string | null): Promise<HeroSaveResult> {
  const supabase = await admin();
  if (!supabase) return { ok: false, kind: "error", message: "غير مصرّح." };
  const current = await draftRow(supabase);
  if ((current?.updated_at ?? null) !== expectedDraftUpdatedAt)
    return { ok: false, kind: "conflict", message: "تغيّرت المسودة في مكان آخر بعد فتح المحرّر. أعد تحميل الصفحة قبل الحفظ." };

  const checked = await checkValue(supabase, input);
  if (!checked.ok) return { ok: false, kind: "validation", issues: checked.issues };

  const q = current
    ? supabase.from("bh_site_content").update({ value: checked.value })
        .eq("key", HOME_HERO_KEY).eq("state", "draft").eq("updated_at", current.updated_at)
    : supabase.from("bh_site_content").insert({ key: HOME_HERO_KEY, state: "draft", value: checked.value });
  const { data, error } = await q.select("updated_at").maybeSingle();
  if (error) return { ok: false, kind: "error", message: `تعذّر حفظ المسودة: ${error.message}` };
  if (!data) return { ok: false, kind: "conflict", message: "تغيّرت المسودة أثناء الحفظ. أعد تحميل الصفحة." };
  revalidatePath("/admin/site/home-hero");
  return { ok: true, draftUpdatedAt: (data as { updated_at: string }).updated_at, value: checked.value };
}

export type HeroActionResult = { ok: true } | { ok: false; kind?: "validation" | "draft_exists"; message: string; issues?: HeroIssue[] };

/** نشر المسودة المحفوظة كما هي (بعد تحقق جديد على الخادم) */
export async function publishHomeHero(expectedDraftUpdatedAt: string): Promise<HeroActionResult> {
  const supabase = await admin();
  if (!supabase) return { ok: false, message: "غير مصرّح." };
  const current = await draftRow(supabase);
  if (!current) return { ok: false, message: "لا توجد مسودة لنشرها. أعد تحميل الصفحة." };
  if (current.updated_at !== expectedDraftUpdatedAt) return { ok: false, message: "تغيّرت المسودة في مكان آخر. أعد تحميل الصفحة قبل النشر." };
  const checked = await checkValue(supabase, current.value);
  if (!checked.ok) return { ok: false, kind: "validation", message: "لم يُنشر: المسودة المحفوظة فيها أخطاء.", issues: checked.issues };

  const { error } = await supabase.rpc("bh_publish_site_content", { p_key: HOME_HERO_KEY });
  if (error) return { ok: false, message: `تعذّر النشر: ${error.message}` };
  revalidatePath("/");
  revalidatePath("/admin/site/home-hero");
  return { ok: true };
}

/** حذف المسودة فقط — المنشور لا يُمس */
export async function discardHomeHeroDraft(): Promise<HeroActionResult> {
  const supabase = await admin();
  if (!supabase) return { ok: false, message: "غير مصرّح." };
  const { error } = await supabase.from("bh_site_content").delete().eq("key", HOME_HERO_KEY).eq("state", "draft");
  if (error) return { ok: false, message: `تعذّر التراجع: ${error.message}` };
  revalidatePath("/admin/site/home-hero");
  return { ok: true };
}

/** استرجاع نسخة سابقة إلى المسودة — لا ينشر شيئاً */
export async function restoreHomeHeroVersion(versionId: number, replaceExistingDraft: boolean): Promise<HeroActionResult> {
  const supabase = await admin();
  if (!supabase) return { ok: false, message: "غير مصرّح." };
  const { data: v } = await supabase.from("bh_site_content_versions").select("id, key").eq("id", versionId).maybeSingle();
  if (!v || (v as { key: string }).key !== HOME_HERO_KEY) return { ok: false, message: "النسخة غير موجودة لهذا القسم." };
  const { error } = await supabase.rpc("bh_restore_site_content_version", {
    p_version_id: versionId, p_replace_existing_draft: replaceExistingDraft,
  });
  if (error) {
    if (error.code === "23514" && error.message.includes("unpublished draft")) return { ok: false, kind: "draft_exists", message: "توجد مسودة غير منشورة." };
    return { ok: false, message: `تعذّر الاسترجاع: ${error.message}` };
  }
  revalidatePath("/admin/site/home-hero");
  return { ok: true };
}
