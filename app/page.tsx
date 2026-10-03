import { Hero } from "@/components/home/hero";
import { LatestSummaries } from "@/components/home/latest-summaries";
import { FounderMessage } from "@/components/home/founder-note";
import { KnowledgeJourney } from "@/components/home/knowledge-journey";
import { createClient } from "@/lib/supabase/server";
import { HOME_HERO_KEY, publicHomeHero } from "@/lib/site/home-hero";
import { HOME_BANNER_KEY, publicHomeBanner } from "@/lib/site/home-banner";
import { HomeBanner } from "@/components/home/home-banner";

export const dynamic = "force-dynamic";

/* الرئيسية: وعد واضح ← المنتج ← المؤسس ← المنهج. الاشتراك في الفوتر العام */
export default async function HomePage() {
  // المنشور فقط (المسودات لا تصل إلى العموم أبداً). أي خطأ أو قيمة غير صالحة = الـHero الافتراضي وبلا بانر.
  const supabase = await createClient();
  const { data } = await supabase
    .from("bh_site_content")
    .select("key, value")
    .in("key", [HOME_HERO_KEY, HOME_BANNER_KEY])
    .eq("state", "published");
  const rows = (data || []) as { key: string; value: unknown }[];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const hero = publicHomeHero(rows.find((r) => r.key === HOME_HERO_KEY)?.value, url);
  // البانر: لا شيء يُرسم ما لم يكن منشوراً ومفعّلاً
  const banner = publicHomeBanner(rows.find((r) => r.key === HOME_BANNER_KEY)?.value, url);

  return (
    <>
      <Hero content={hero} />
      <HomeBanner banner={banner} />
      <LatestSummaries />
      <FounderMessage />
      <KnowledgeJourney />
    </>
  );
}
