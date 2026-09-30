import { Hero } from "@/components/home/hero";
import { LatestSummaries } from "@/components/home/latest-summaries";
import { FounderMessage } from "@/components/home/founder-note";
import { KnowledgeJourney } from "@/components/home/knowledge-journey";
import { FinalCTA } from "@/components/home/final-cta";

export const dynamic = "force-dynamic";

/* الرئيسية: وعد واضح ← المنتج ← المؤسس ← المنهج ← الاشتراك */
export default function HomePage() {
  return (
    <>
      <Hero />
      <LatestSummaries />
      <FounderMessage />
      <KnowledgeJourney />
      <FinalCTA />
    </>
  );
}
