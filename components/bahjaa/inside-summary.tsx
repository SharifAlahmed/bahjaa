// components/bahjaa/inside-summary.tsx — «ماذا ستجد داخل كل ملخص؟»
const ITEMS = [
  ['٠١', 'ملخص الـ٣٠ ثانية', 'الفكرة الكبرى في قراءة خاطفة.'],
  ['٠٢', 'لحظة التعرّف', 'موقف أو سؤال يجعلك تعرف لماذا هذا الكتاب مهم الآن.'],
  ['٠٣', 'الفكرة المحورية', 'الجملة التي ينبغي أن تبقى معك بعد القراءة.'],
  ['٠٤', '٧ محاور عملية', 'إعادة بناء أفكار الكتاب دون حشو.'],
  ['٠٥', 'اقتباسات مفسّرة', 'نصوص مهمة مع تفسير فريق بهجة وسياقها.'],
  ['٠٦', 'خطوة اليوم', 'تصرّف عملي واحد تبدأ به بعد القراءة.'],
] as const

export function InsideSummary() {
  return (
    <section className="wrap section-block" id="inside-summary" aria-labelledby="inside-title">
      <p className="eyebrow">كيف تعمل بهجة</p>
      <h2 className="h-sec" id="inside-title" style={{ marginTop: 14 }}>ماذا ستجد داخل كل ملخص؟</h2>
      <p className="read col" style={{ marginTop: 18, marginBottom: 40 }}>
        بهجة لا تكتفي بإخبارك بما قاله الكتاب؛ بل تنظّم أفكاره لتفهمها، وتربطها بموقفك، وتنتهي بخطوة قابلة للتنفيذ.
      </p>
      <div className="inside-grid">
        {ITEMS.map(([num, title, body]) => (
          <article className="inside-item" key={num}>
            <div className="inside-num">{num}</div>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
