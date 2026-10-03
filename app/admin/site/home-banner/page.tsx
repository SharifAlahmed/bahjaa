import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import { EMPTY_HOME_BANNER, HOME_BANNER_KEY, editorHomeBanner } from "@/lib/site/home-banner";
import { BannerEditor, type BannerVersionItem } from "./banner-editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "بانر الرئيسية", robots: { index: false, follow: false } };

const dateFormat = new Intl.DateTimeFormat("ar-u-nu-arab", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bahrain" });

export default async function HomeBannerAdminPage({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  const email = await getAdminEmail();
  if (!email) notFound();
  const { done } = await searchParams;
  const supabase = await createClient();

  const [{ data: rows }, { data: versionRows }] = await Promise.all([
    supabase.from("bh_site_content").select("state, value, updated_at").eq("key", HOME_BANNER_KEY),
    supabase.from("bh_site_content_versions").select("id, created_at, created_by").eq("key", HOME_BANNER_KEY)
      .order("id", { ascending: false }).limit(50),
  ]);
  const list = (rows || []) as { state: "draft" | "published"; value: unknown; updated_at: string }[];
  const draft = list.find((r) => r.state === "draft") ?? null;
  const published = list.find((r) => r.state === "published") ?? null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // المحرّر يحمّل المسودة، وإلا المنشور (حتى لو معطّلاً — التعطيل لا يمسح المحتوى)، وإلا بانر فارغ معطّل
  const publishedValue = published ? editorHomeBanner(published.value, url) : null;
  const initial = draft ? editorHomeBanner(draft.value, url) : publishedValue ?? EMPTY_HOME_BANNER;
  const versions: BannerVersionItem[] = ((versionRows || []) as { id: number; created_at: string; created_by: string | null }[]).map((v) => ({
    id: v.id, when: dateFormat.format(new Date(v.created_at)), by: v.created_by && v.created_by.includes("@") ? v.created_by : "النظام",
  }));

  return (
    <BannerEditor
      initialValues={initial}
      initialDraftUpdatedAt={draft?.updated_at ?? null}
      published={publishedValue ? { enabled: publishedValue.enabled, title: publishedValue.title, when: dateFormat.format(new Date(published!.updated_at)) } : null}
      versions={versions}
      done={done ?? null}
    />
  );
}
