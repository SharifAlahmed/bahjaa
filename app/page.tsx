import { Hero } from "@/components/home/hero";
import { LatestSummaries } from "@/components/home/latest-summaries";
import { FounderMessage } from "@/components/home/founder-note";
import { KnowledgeJourney } from "@/components/home/knowledge-journey";
import { createClient } from "@/lib/supabase/server";
import { HOME_HERO_KEY, publicHomeHero } from "@/lib/site/home-hero";

export const dynamic = "force-dynamic";

/* الرئيسية: وعد واضح ← المنتج ← المؤسس ← المنهج. الاشتراك في الفوتر العام */
export default async function HomePage() {
  // الـHero المنشور فقط (المسودة لا تصل إلى العموم أبداً). أي خطأ أو قيمة غير صالحة = الـHero الافتراضي.
  const supabase = await createClient();
  const { data } = await supabase
    .from("bh_site_content")
    .select("value")
    .eq("key", HOME_HERO_KEY)
    .eq("state", "published")
    .maybeSingle();
  const hero = publicHomeHero((data as { value: unknown } | null)?.value, process.env.NEXT_PUBLIC_SUPABASE_URL!);

  return (
    <>
      <Hero content={hero} />
      <LatestSummaries />
      <FounderMessage />
      <KnowledgeJourney />
    </>
  );
}
