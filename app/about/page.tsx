import type { Metadata } from "next";
import Link from "next/link";
import { FounderNote } from "@/components/home/founder-note";
import { WhyBahjaa } from "@/components/home/why-bahjaa";
import { HowItWorks } from "@/components/home/how-it-works";
import { Vision } from "@/components/home/vision";

export const metadata: Metadata = {
  title: "عن بهجة",
  description: "بهجة محرّكٌ يحوّل المعرفة إلى خُطّة، والخُطّة إلى أثر.",
};

export default function AboutPage() {
  return (
    <>
      <section className="about-intro" aria-labelledby="about-title">
        <div className="wrap">
          <div className="home-col">
            <h1 className="about-title" id="about-title">عن بهجة</h1>
            <p className="about-lead">بهجة: من المعرفة إلى الأثر</p>
            <div className="home-prose">
              <p className="home-prose-strong">
                بهجة محرّكٌ يحوّل المعرفة إلى خُطّة، والخُطّة إلى أثر.
              </p>
              <p>
                نقدّم تجربة معرفية عربية تساعد القادة وروّاد الأعمال وأصحاب الطموح
                على الوصول إلى الأفكار الأكثر قيمة، وفهمها بوضوح، وتحويلها إلى
                قرارات وخطوات عملية قابلة للتنفيذ.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FounderNote />
      <WhyBahjaa />
      <HowItWorks />
      <Vision />

      <section className="about-cta">
        <div className="wrap">
          <Link href="/#latest" className="btn btn-brand">استكشف الملخصات</Link>
        </div>
      </section>
    </>
  );
}
