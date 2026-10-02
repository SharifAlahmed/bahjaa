"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import { validateStored, type StoredSummary } from "@/lib/admin/summary-content";

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
    .select("slug, book_title_ar, book_title_en, author, category_id, reading_minutes, content_free, content_full")
    .eq("id", id)
    .maybeSingle();
  if (!row) throw new Error("الملخص غير موجود");
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

export async function unpublishSummary(id: string, slug?: string) {
  const supabase = await guard();
  const { error } = await supabase.from("bh_summaries").update({ status: "draft" }).eq("id", id);
  assertMutationSucceeded(error);
  refresh(slug);
}

/** تمييز ملخص كأبرز ملخص في الصفحة الرئيسية — ملخص واحد فقط في أي وقت */
export async function setFeatured(id: string, slug?: string) {
  const supabase = await guard();
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
  const { error } = await supabase
    .from("bh_summaries")
    .update({ is_featured: false })
    .eq("id", id);
  assertMutationSucceeded(error);
  refresh(slug);
}
