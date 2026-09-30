const steps = [
  { n: "١", title: "ننتقي", body: "ما الذي يستحق وقتك؟" },
  { n: "٢", title: "نفهم", body: "ما الذي يقوله المصدر في سياقه؟" },
  { n: "٣", title: "نسأل", body: "ما الفكرة الجوهرية وما الافتراضات وراءها؟" },
  { n: "٤", title: "نخطّط", body: "ما القرار أو الخطوة التالية؟" },
  { n: "٥", title: "نلتزم", body: "ماذا سنفعل فعلًا، ومتى؟" },
  { n: "٦", title: "نقيس", body: "ما الذي تغيّر بعد التطبيق؟" },
];

export function KnowledgeJourney() {
  return (
    <section className="hm-journey hm-journey-v4 home-anchor" id="how" aria-labelledby="how-title">
      <div className="wrap">
        <header className="hm-journey-head">
          <p className="hm-eyebrow">منهج بهجة</p>
          <h2 className="h-sec" id="how-title">من المعرفة إلى فهم وقرار وفعل</h2>
          <p className="hm-journey-intro">
            نمرّ بالمعرفة عبر ست مراحل تساعدنا على الوصول إلى الجوهر،
            ثم تحويله إلى قرار يمكن تنفيذه وقياس أثره.
          </p>
        </header>

        <ol className="hm-steps">
          {steps.map((s) => (
            <li key={s.title} className="hm-step">
              <span className="hm-step-n" aria-hidden="true">{s.n}</span>
              <h3 className="hm-step-title">{s.title}</h3>
              <p className="hm-step-body">{s.body}</p>
            </li>
          ))}
        </ol>

        <p className="hm-journey-close">
          ننتقي بوعي · نفهم بعمق · نسأل بذكاء · نخطط بوضوح · نلتزم بالفعل · نقيس الأثر
        </p>
      </div>
    </section>
  );
}
