"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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
