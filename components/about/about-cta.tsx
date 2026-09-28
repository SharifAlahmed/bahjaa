import Link from "next/link";

/* الخطوة التالية: الأقسام، ورابط نصي للعودة إلى الرئيسية */
export function AboutCTA() {
  return (
    <section className="ab-cta" aria-labelledby="about-cta-title">
      <div className="wrap">
        <h2 className="ab-cta-title" id="about-cta-title">ابدأ بالمعرفة التي تستحق وقتك.</h2>
        <p className="ab-cta-body">
          اختر السؤال الأقرب إليك، واكتشف المعرفة التي تساعدك على فهمه والتعامل معه بصورة أفضل.
        </p>
        <div className="ab-cta-actions">
          <Link href="/categories" className="btn btn-brand">استكشف الأقسام</Link>
          <Link href="/" className="hm-link">
            العودة إلى الرئيسية
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 6 8 12l6 6" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
