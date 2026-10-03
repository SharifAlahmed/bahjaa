import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import { DEFAULT_HOME_HERO, HOME_HERO_KEY, publicHomeHero } from "@/lib/site/home-hero";
import { HeroEditor, type HeroVersionItem } from "./hero-editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "قسم الافتتاح", robots: { index: false, follow: false } };

const dateFormat = new Intl.DateTimeFormat("ar-u-nu-arab", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bahrain" });

export default async function HomeHeroAdminPage({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  const email = await getAdminEmail();
  if (!email) notFound();
  const { done } = await searchParams;
  const supabase = await createClient();

  const [{ data: rows }, { data: versionRows }] = await Promise.all([
    supabase.from("bh_site_content").select("state, value, updated_at").eq("key", HOME_HERO_KEY),
    supabase.from("bh_site_content_versions").select("id, created_at, created_by").eq("key", HOME_HERO_KEY)
      .order("id", { ascending: false }).limit(50),
  ]);
  const list = (rows || []) as { state: "draft" | "published"; value: unknown; updated_at: string }[];
  const draft = list.find((r) => r.state === "draft") ?? null;
  const published = list.find((r) => r.state === "published") ?? null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // أول فتح: المحرّر معبّأ بقسم الافتتاح الحالي كما يُعرض (المنشور، وإلا قيم الكود)
  const initial = draft ? publicHomeHero(draft.value, url) : published ? publicHomeHero(published.value, url) : DEFAULT_HOME_HERO;
  const versions: HeroVersionItem[] = ((versionRows || []) as { id: number; created_at: string; created_by: string | null }[]).map((v) => ({
    id: v.id, when: dateFormat.format(new Date(v.created_at)), by: v.created_by && v.created_by.includes("@") ? v.created_by : "النظام",
  }));

  return (
    <HeroEditor
      initialValues={initial}
      initialDraftUpdatedAt={draft?.updated_at ?? null}
      publishedSource={published ? "custom" : "default"}
      publishedWhen={published ? dateFormat.format(new Date(published.updated_at)) : null}
      versions={versions}
      done={done ?? null}
    />
  );
}
