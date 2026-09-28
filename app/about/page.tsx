import type { Metadata } from "next";
import { AboutHero } from "@/components/about/about-hero";
import { OriginStory } from "@/components/about/origin-story";
import { AboutVision } from "@/components/about/vision";
import { Mission } from "@/components/about/mission";
import { AboutValues } from "@/components/about/values";
import { FounderLetter } from "@/components/about/founder-letter";
import { AboutPromise } from "@/components/about/about-promise";
import { AboutCTA } from "@/components/about/about-cta";

export const metadata: Metadata = {
  title: "عن بهجة",
  description:
    "بهجة مساحة عربية للمعرفة التي تستحق وقتك؛ نختارها بوعي، ونقدّمها بوضوح وعمق، ونساعدك على تحويلها إلى شيء يمكنك استخدامه.",
};

/* الفلسفة لا المنتج: لماذا توجد بهجة، بماذا تؤمن، إلى أين تتجه، ومن وراءها.
   رحلة «افهم ← استخرج ← طبّق ← قِس» في الرئيسية فقط */
export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <OriginStory />
      <AboutVision />
      <Mission />
      <AboutValues />
      <FounderLetter />
      <AboutPromise />
      <AboutCTA />
    </>
  );
}
