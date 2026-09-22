"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminEmail } from "@/lib/supabase/admin";

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

export async function deleteSummary(id: string, slug?: string) {
  const supabase = await guard();
  const { error } = await supabase.from("bh_summaries").delete().eq("id", id);
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

/** رفع غلاف كتاب إلى بكت bh-covers وتحديث cover_url */
export async function uploadCoverAction(
  id: string,
  slug: string | undefined,
  formData: FormData,
) {
  await guard(); // التحقق من صلاحية الأدمن أولاً
  const file = formData.get("cover") as File | null;
  if (!file || file.size === 0) return;
  if (file.size > 2 * 1024 * 1024) throw new Error("الملف أكبر من ٢ ميغابايت");

  const svc = createServiceClient();
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${id}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await svc.storage
    .from("bh-covers")
    .upload(path, bytes, { upsert: true, contentType: file.type });
  if (upErr) throw new Error(`فشل رفع الغلاف: ${upErr.message}`);

  const {
    data: { publicUrl },
  } = svc.storage.from("bh-covers").getPublicUrl(path);

  const supabase = await createClient();
  const { error } = await supabase
    .from("bh_summaries")
    .update({ cover_url: publicUrl })
    .eq("id", id);
  assertMutationSucceeded(error);
  refresh(slug);
}
