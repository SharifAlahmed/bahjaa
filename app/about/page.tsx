import type { Metadata } from "next";
import { AboutHero } from "@/components/about/about-hero";
import { OriginStory } from "@/components/about/origin-story";
import { AboutVision } from "@/components/about/vision";
import { AboutValues } from "@/components/about/values";
import { FounderLetter } from "@/components/about/founder-letter";
import { AboutPromise } from "@/components/about/about-promise";
import { AboutCTA } from "@/components/about/about-cta";

export const metadata: Metadata = {
  title: "عن بهجة",
  description:
    "تعرّف إلى بهجة: منصة عربية للمعرفة التطبيقية تساعد القادة ورواد الأعمال على تحويل المعرفة إلى فهم أوضح، وقرارات أفضل، وخطوات قابلة للتطبيق.",
};

/* عن بهجة: لماذا وُجدت، ما الذي تسعى إليه، ما الذي تؤمن به، ومن يقف وراءها. */
export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <OriginStory />
      <AboutVision />
      <AboutValues />
      <FounderLetter />
      <AboutPromise />
      <AboutCTA />
    </>
  );
}
