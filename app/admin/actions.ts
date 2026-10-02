"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import { validateStored, type StoredSummary } from "@/lib/admin/summary-content";
import { ARCHIVED_MESSAGE } from "@/lib/admin/list";

/** طبقة حماية أولى — والثانية في سياسات Postgres نفسها */
async function guard() {
  const email = await getAdminEmail();
  if (!email) throw new Error("غير مصرّح");
  return createClient();
}

function refresh(slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/categories");
  if (slug) revalidatePath(`/s/${slug}`);
}

function assertMutationSucceeded(error: { message: string } | null) {
  if (error) throw new Error(`تعذّر تحديث الملخص: ${error.message}`);
}

export async function publishSummary(id: string, slug?: string) {
  const supabase = await guard();

  // النشر لا يتجاوز تحقق المحرّر: نفحص الصف المخزَّن كما هو قبل النشر مباشرة
  const { data: row } = await supabase
    .from("bh_summaries")
    .select("slug, book_title_ar, book_title_en, author, category_id, reading_minutes, content_free, content_full, archived_at")
    .eq("id", id)
    .maybeSingle();
  if (!row) throw new Error("الملخص غير موجود");
  if ((row as { archived_at: string | null }).archived_at) throw new Error(ARCHIVED_MESSAGE);
  const { data: cats } = await supabase.from("bh_categories").select("id");
  const categoryIds = ((cats || []) as { id: string }[]).map((c) => c.id);
  if (validateStored(row as unknown as StoredSummary, categoryIds).length > 0) {
    redirect(`/admin/summaries/${id}?publish=blocked`);
  }

  const { error } = await supabase
    .from("bh_summaries")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id);
  assertMutationSucceeded(error);
  refresh(slug);
}

export type ListActionResult = { ok: true } | { ok: false; message: string };

async function adminClient() {
  const email = await getAdminEmail();
  return email ? createClient() : null;
}

/** إلغاء النشر: الصفحة العامة تتوقف فوراً. لا يمسّ المحتوى ولا is_featured ولا الإشارات المرجعية. */
export async function unpublishSummary(id: string): Promise<ListActionResult> {
  const supabase = await adminClient();
  if (!supabase) return { ok: false, message: "غير مصرّح." };
  const { data, error } = await supabase
    .from("bh_summaries").update({ status: "draft" }).eq("id", id).select("slug").maybeSingle();
  if (error || !data) return { ok: false, message: `تعذّر إلغاء النشر: ${error?.message ?? "الملخص غير موجود"}` };
  refresh((data as { slug: string }).slug);
  return { ok: true };
}

/**
 * الأرشفة: المسار الآمن للإزالة. المنشور يُلغى نشره ويؤرشف في تحديث واحد.
 * لا يُحذف شيء: النص والغلاف وسجل النسخ والمسودة غير المنشورة والإشارات المرجعية و is_featured تبقى.
 */
export async function archiveSummary(id: string): Promise<ListActionResult> {
  const supabase = await adminClient();
  if (!supabase) return { ok: false, message: "غير مصرّح." };
  const { data, error } = await supabase
    .from("bh_summaries")
    .update({ status: "draft", archived_at: new Date().toISOString() })
    .eq("id", id).is("archived_at", null).select("slug").maybeSingle();
  if (error) return { ok: false, message: `تعذّرت الأرشفة: ${error.message}` };
  if (!data) return { ok: false, message: "الملخص غير موجود أو مؤرشف من قبل." };
  refresh((data as { slug: string }).slug);
  return { ok: true };
}

/** إلغاء الأرشفة: يعود ملخصاً غير منشور. إعادة النشر إجراء منفصل صريح. */
export async function unarchiveSummary(id: string): Promise<ListActionResult> {
  const supabase = await adminClient();
  if (!supabase) return { ok: false, message: "غير مصرّح." };
  const { data, error } = await supabase
    .from("bh_summaries").update({ archived_at: null }).eq("id", id).not("archived_at", "is", null).select("slug").maybeSingle();
  if (error) return { ok: false, message: `تعذّر إلغاء الأرشفة: ${error.message}` };
  if (!data) return { ok: false, message: "الملخص غير موجود أو غير مؤرشف." };
  refresh((data as { slug: string }).slug);
  return { ok: true };
}

/** تمييز ملخص كأبرز ملخص في الصفحة الرئيسية — ملخص واحد فقط في أي وقت */
export async function setFeatured(id: string, slug?: string) {
  const supabase = await guard();
  // التمييز للمنشور غير المؤرشف فقط
  const { data: target } = await supabase.from("bh_summaries").select("status, archived_at").eq("id", id).maybeSingle();
  const t = target as { status: string; archived_at: string | null } | null;
  if (!t) throw new Error("الملخص غير موجود");
  if (t.archived_at) throw new Error(ARCHIVED_MESSAGE);
  if (t.status !== "published") throw new Error("التمييز للملخصات المنشورة فقط.");
  // إلغاء التمييز عن أي ملخص سابق
  await supabase
    .from("bh_summaries")
    .update({ is_featured: false })
    .eq("is_featured", true)
    .neq("id", id);
  const { error } = await supabase
    .from("bh_summaries")
    .update({ is_featured: true })
    .eq("id", id);
  assertMutationSucceeded(error);
  refresh(slug);
}

/** إلغاء تمييز ملخص */
export async function unsetFeatured(id: string, slug?: string) {
  const supabase = await guard();
  const { data: target } = await supabase.from("bh_summaries").select("archived_at").eq("id", id).maybeSingle();
  if ((target as { archived_at: string | null } | null)?.archived_at) throw new Error(ARCHIVED_MESSAGE);
  const { error } = await supabase
    .from("bh_summaries")
    .update({ is_featured: false })
    .eq("id", id);
  assertMutationSucceeded(error);
  refresh(slug);
}
