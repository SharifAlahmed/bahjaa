import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import { Hero } from "@/components/home/hero";
import { HomeBanner } from "@/components/home/home-banner";
import { LatestSummaries } from "@/components/home/latest-summaries";
import { FounderMessage } from "@/components/home/founder-note";
import { KnowledgeJourney } from "@/components/home/knowledge-journey";
import { HOME_HERO_KEY, publicHomeHero } from "@/lib/site/home-hero";
import { HOME_BANNER_KEY, publicHomeBanner } from "@/lib/site/home-banner";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "معاينة الصفحة الرئيسية", robots: { index: false, follow: false } };

/* معاينة الأدمن للصفحة الرئيسية كاملة بالمكوّنات الحقيقية، وقسم الافتتاح المنشور كما هو.
   — الافتراضي: مسودة البانر المحفوظة إن وُجدت، وإلا المنشور.
   — ?v=live: المنشور كما يراه العموم.  — ?version=<id>: نسخة سابقة من سجل home_banner فقط.
   البانر المعطّل لا يُرسم هنا أيضاً — المعاينة مطابقة لما سيظهر فعلاً. */
export default async function HomeBannerPreview({ searchParams }: { searchParams: Promise<{ v?: string; version?: string }> }) {
  const email = await getAdminEmail();
  if (!email) notFound();
  const { v, version } = await searchParams;
  const supabase = await createClient();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const { data } = await supabase.from("bh_site_content").select("key, state, value").in("key", [HOME_HERO_KEY, HOME_BANNER_KEY]);
  const rows = (data || []) as { key: string; state: string; value: unknown }[];
  const hero = publicHomeHero(rows.find((r) => r.key === HOME_HERO_KEY && r.state === "published")?.value, url);

  let source: unknown = null;
  let label: string;
  if (version !== undefined) {
    if (!/^\d+$/.test(version)) notFound();
    const { data: vData } = await supabase.from("bh_site_content_versions").select("key, value").eq("id", Number(version)).maybeSingle();
    const row = vData as { key: string; value: unknown } | null;
    if (!row || row.key !== HOME_BANNER_KEY) notFound();
    source = row.value;
    label = "نسخة سابقة · غير منشورة";
  } else {
    const draft = rows.find((r) => r.key === HOME_BANNER_KEY && r.state === "draft");
    const published = rows.find((r) => r.key === HOME_BANNER_KEY && r.state === "published");
    if (draft && v !== "live") { source = draft.value; label = "مسودة غير منشورة · الصفحة الرئيسية لم تتغيّر"; }
    else if (published) { source = published.value; label = "المنشور الحالي"; }
    else label = "المنشور الحالي: لا بانر";
  }
  const banner = publicHomeBanner(source, url);
  if (source !== null && !banner) label += " · البانر معطّل فلا يظهر";

  return (
    <>
      <div className="sr-admin-bar">
        <div className="sr-wrap sr-admin-bar-in">
          <p>معاينة الأدمن · {label}</p>
          <p className="sr-admin-links">
            <Link href="/admin/site/home-banner/preview?v=live" className="textlink">عرض المنشور</Link>
            <Link href="/admin/site/home-banner" className="textlink">المحرّر</Link>
            <Link href="/admin" className="textlink">اللوحة</Link>
          </p>
        </div>
      </div>
      <Hero content={hero} />
      <HomeBanner banner={banner} />
      <LatestSummaries />
      <FounderMessage />
      <KnowledgeJourney />
    </>
  );
}
