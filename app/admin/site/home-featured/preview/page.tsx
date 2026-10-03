import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import { Hero } from "@/components/home/hero";
import { LatestSummaries } from "@/components/home/latest-summaries";
import { FounderMessage } from "@/components/home/founder-note";
import { KnowledgeJourney } from "@/components/home/knowledge-journey";
import { HOME_HERO_KEY, publicHomeHero } from "@/lib/site/home-hero";
import { HOME_FEATURED_KEY, publicFeaturedIds } from "@/lib/site/home-featured";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "معاينة المختارات", robots: { index: false, follow: false } };

/* معاينة الأدمن للصفحة الرئيسية كاملة بالمكوّنات الحقيقية، مع مختارات:
   — الافتراضي: المسودة المحفوظة إن وُجدت، وإلا المنشور، وإلا الأحدث تلقائياً.
   — ?v=live: المنشور.  — ?version=<id>: نسخة سابقة من سجل home_featured فقط. قسم الافتتاح دائماً المنشور. */
export default async function HomeFeaturedPreview({ searchParams }: { searchParams: Promise<{ v?: string; version?: string }> }) {
  const email = await getAdminEmail();
  if (!email) notFound();
  const { v, version } = await searchParams;
  const supabase = await createClient();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const { data: heroRow } = await supabase.from("bh_site_content").select("value")
    .eq("key", HOME_HERO_KEY).eq("state", "published").maybeSingle();
  const hero = publicHomeHero((heroRow as { value: unknown } | null)?.value, url);

  let selection: string[] = [];
  let label: string;
  if (version !== undefined) {
    if (!/^\d+$/.test(version)) notFound();
    const { data } = await supabase.from("bh_site_content_versions").select("key, value").eq("id", Number(version)).maybeSingle();
    const row = data as { key: string; value: unknown } | null;
    if (!row || row.key !== HOME_FEATURED_KEY) notFound();
    selection = publicFeaturedIds(row.value);
    label = "نسخة سابقة من المختارات · غير منشورة";
  } else {
    const { data } = await supabase.from("bh_site_content").select("state, value").eq("key", HOME_FEATURED_KEY);
    const rows = (data || []) as { state: string; value: unknown }[];
    const draft = rows.find((r) => r.state === "draft");
    const published = rows.find((r) => r.state === "published");
    if (draft && v !== "live") { selection = publicFeaturedIds(draft.value); label = "مسودة مختارات غير منشورة · الصفحة الرئيسية لم تتغيّر"; }
    else if (published) { selection = publicFeaturedIds(published.value); label = "المختارات المنشورة"; }
    else label = "المنشور: الأحدث تلقائياً";
  }

  return (
    <>
      <div className="sr-admin-bar">
        <div className="sr-wrap sr-admin-bar-in">
          <p>معاينة الأدمن · {label}</p>
          <p className="sr-admin-links">
            <Link href="/admin/site/home-featured/preview?v=live" className="textlink">عرض المنشور</Link>
            <Link href="/admin/site/home-featured" className="textlink">المحرّر</Link>
            <Link href="/admin" className="textlink">اللوحة</Link>
          </p>
        </div>
      </div>
      <Hero content={hero} />
      <LatestSummaries selection={selection} />
      <FounderMessage />
      <KnowledgeJourney />
    </>
  );
}
