import Link from "next/link";

/* خطوة واحدة واضحة بعد التعريف بالمنصة. */
export function AboutCTA() {
  return (
    <section className="ab-cta ab-cta-v2" aria-labelledby="about-cta-title">
      <div className="wrap">
        <h2 className="ab-cta-title" id="about-cta-title">ابدأ بما يستحق وقتك</h2>
        <p className="ab-cta-body">
          استكشف المعرفة التي تساعدك على فهم أفضل واتخاذ قرار أوضح.
        </p>
        <div className="ab-cta-actions">
          <Link href="/categories" className="btn btn-brand">استكشف الأقسام</Link>
        </div>
      </div>
    </section>
  );
}
