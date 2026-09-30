/* قيم بهجة: ثلاث مبادئ قصيرة، لكل منها وظيفة واضحة. */
const values = [
  {
    n: "١",
    title: "انتقاء بوعي",
    body: "نختار المعرفة التي تستحق وقتك وانتباهك، لا المزيد من المحتوى لمجرد الكثرة.",
  },
  {
    n: "٢",
    title: "وضوح بعمق",
    body: "نصل إلى جوهر الفكرة ونحافظ على سياقها، ثم نقدّمها بوضوح من دون تسطيح أو تعقيد.",
  },
  {
    n: "٣",
    title: "معرفة للتطبيق",
    body: "نحوّل ما تتعلمه إلى أسئلة وقرارات وخطوات تساعدك على استخدام المعرفة في عملك وحياتك.",
  },
];

export function AboutValues() {
  return (
    <section className="ab-values ab-values-v2" aria-labelledby="values-title">
      <div className="wrap">
        <h2 className="ab-h2" id="values-title">قيم بهجة</h2>
        <p className="ab-intro">ثلاثة مبادئ نعود إليها في كل ما نختاره ونقدّمه.</p>

        <ul className="ab-values-list">
          {values.map((v) => (
            <li key={v.title} className="ab-value">
              <span className="ab-value-n" aria-hidden="true">{v.n}</span>
              <h3 className="ab-value-title">{v.title}</h3>
              <p className="ab-value-copy">{v.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
