import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import { LIST_COLUMNS, type Category, type SummaryListItem } from "@/lib/types";
import { HOME_FEATURED_KEY, publicFeaturedIds } from "@/lib/site/home-featured";
import { FeaturedEditor, type FeaturedVersionItem } from "./featured-editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "مختارات الرئيسية", robots: { index: false, follow: false } };

const dateFormat = new Intl.DateTimeFormat("ar-u-nu-arab", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bahrain" });

export default async function HomeFeaturedAdminPage({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  const email = await getAdminEmail();
  if (!email) notFound();
  const { done } = await searchParams;
  const supabase = await createClient();

  const [{ data: rows }, { data: versionRows }, { data: pool }, { data: cats }] = await Promise.all([
    supabase.from("bh_site_content").select("state, value, updated_at").eq("key", HOME_FEATURED_KEY),
    supabase.from("bh_site_content_versions").select("id, created_at, created_by, value").eq("key", HOME_FEATURED_KEY)
      .order("id", { ascending: false }).limit(50),
    // منشور وغير مؤرشف (المؤرشف دائماً غير منشور)، من الأحدث — الترتيب نفسه الذي تعتمده الصفحة العامة
    supabase.from("bh_summaries").select(LIST_COLUMNS).eq("status", "published").is("archived_at", null)
      .order("published_at", { ascending: false }),
    supabase.from("bh_categories").select("*").order("sort_order"),
  ]);
  const list = (rows || []) as { state: "draft" | "published"; value: unknown; updated_at: string }[];
  const draft = list.find((r) => r.state === "draft") ?? null;
  const published = list.find((r) => r.state === "published") ?? null;
  const initial = draft ? publicFeaturedIds(draft.value) : published ? publicFeaturedIds(published.value) : [];
  const versions: FeaturedVersionItem[] = ((versionRows || []) as { id: number; created_at: string; created_by: string | null; value: unknown }[]).map((v) => ({
    id: v.id, when: dateFormat.format(new Date(v.created_at)),
    by: v.created_by && v.created_by.includes("@") ? v.created_by : "النظام",
    count: publicFeaturedIds(v.value).length,
  }));

  return (
    <FeaturedEditor
      initialIds={initial}
      initialDraftUpdatedAt={draft?.updated_at ?? null}
      publishedCount={published ? publicFeaturedIds(published.value).length : null}
      publishedWhen={published ? dateFormat.format(new Date(published.updated_at)) : null}
      pool={(pool || []) as SummaryListItem[]}
      categories={(cats || []) as Category[]}
      versions={versions}
      done={done ?? null}
    />
  );
}
