import Link from "next/link";

/* الخاتمة. الزر إلى /categories لأنها ما تعرضه المكتبة فعلاً (لا صفحة تجمع كل الملخصات) */
export function FinalCTA() {
  return (
    <section className="hm-final" aria-labelledby="final-title">
      <div className="wrap hm-center">
        <h2 className="hm-final-title" id="final-title">
          لا تجمع معرفة أكثر.
          <br />
          ابدأ باستخدام ما تتعلمه.
        </h2>
        <p className="hm-final-body">
          اختر الفكرة التي تحتاجها اليوم، وافهمها بعمق، ثم حوّلها إلى خطوة.
        </p>
        <div className="hm-final-actions">
          <Link href="/categories" className="btn btn-brand">استكشف محتوى بهجة</Link>
          <Link href="/about" className="hm-link">
            تعرّف أكثر على بهجة
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 6 8 12l6 6" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
