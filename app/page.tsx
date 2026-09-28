import { Hero } from "@/components/home/hero";
import { FounderMessage } from "@/components/home/founder-note";
import { WhyHome } from "@/components/home/why-home";
import { BahjaaValues } from "@/components/home/bahjaa-values";
import { BrandPromise } from "@/components/home/brand-promise";
import { KnowledgeJourney } from "@/components/home/knowledge-journey";
import { LatestSummaries } from "@/components/home/latest-summaries";
import { FinalCTA } from "@/components/home/final-cta";

export const dynamic = "force-dynamic";

/* قصة واحدة: الهيرو ← رسالة المؤسس ← لماذا بهجة ← القيم ← الوعد ← كيف تعمل ← الملخصات ← الخاتمة */
export default function HomePage() {
  return (
    <>
      <Hero />
      <FounderMessage />
      <WhyHome />
      <BahjaaValues />
      <BrandPromise />
      <KnowledgeJourney />
      <LatestSummaries />
      <FinalCTA />
    </>
  );
}
