import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import { Hero } from "@/components/home/hero";
import { LatestSummaries } from "@/components/home/latest-summaries";
import { FounderMessage } from "@/components/home/founder-note";
import { KnowledgeJourney } from "@/components/home/knowledge-journey";
import { DEFAULT_HOME_HERO, HOME_HERO_KEY, publicHomeHero } from "@/lib/site/home-hero";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "معاينة الصفحة الرئيسية", robots: { index: false, follow: false } };

/* معاينة الأدمن للصفحة الرئيسية كاملة بالمكوّنات الحقيقية نفسها.
   — الافتراضي: المسودة المحفوظة إن وُجدت، وإلا المنشور، وإلا قسم الافتتاح الأصلي.
   — ?v=live: المنشور كما يراه العموم.  — ?version=<id>: نسخة سابقة من سجل home_hero فقط. */
export default async function HomeHeroPreview({ searchParams }: { searchParams: Promise<{ v?: string; version?: string }> }) {
  const email = await getAdminEmail();
  if (!email) notFound();
  const { v, version } = await searchParams;
  const supabase = await createClient();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  let hero = DEFAULT_HOME_HERO;
  let label: string;
  if (version !== undefined) {
    if (!/^\d+$/.test(version)) notFound();
    const { data } = await supabase.from("bh_site_content_versions").select("key, value").eq("id", Number(version)).maybeSingle();
    const row = data as { key: string; value: unknown } | null;
    if (!row || row.key !== HOME_HERO_KEY) notFound();
    hero = publicHomeHero(row.value, url);
    label = "نسخة سابقة · غير منشورة";
  } else {
    const { data } = await supabase.from("bh_site_content").select("state, value").eq("key", HOME_HERO_KEY);
    const rows = (data || []) as { state: string; value: unknown }[];
    const draft = rows.find((r) => r.state === "draft");
    const published = rows.find((r) => r.state === "published");
    if (draft && v !== "live") { hero = publicHomeHero(draft.value, url); label = "مسودة غير منشورة · الصفحة الرئيسية لم تتغيّر"; }
    else if (published) { hero = publicHomeHero(published.value, url); label = "المنشور الحالي"; }
    else label = "المنشور الحالي: قسم الافتتاح الأصلي (من الكود)";
  }

  return (
    <>
      <div className="sr-admin-bar">
        <div className="sr-wrap sr-admin-bar-in">
          <p>معاينة الأدمن · {label}</p>
          <p className="sr-admin-links">
            <Link href="/admin/site/home-hero/preview?v=live" className="textlink">عرض المنشور</Link>
            <Link href="/admin/site/home-hero" className="textlink">المحرّر</Link>
            <Link href="/admin" className="textlink">اللوحة</Link>
          </p>
        </div>
      </div>
      <Hero content={hero} />
      <LatestSummaries />
      <FounderMessage />
      <KnowledgeJourney />
    </>
  );
}
