const steps = [
  { n: "١", title: "ننتقي", body: "ما الذي يستحق وقتك وانتباهك؟" },
  { n: "٢", title: "نفهم", body: "ما الذي يقوله المصدر فعلًا، وما السياق الذي يمنح الفكرة معناها؟" },
  { n: "٣", title: "نسأل", body: "ما الفكرة الجوهرية؟ وما الافتراضات وراءها؟" },
  { n: "٤", title: "نخطّط", body: "كيف تتحول المعرفة إلى قرار، أو هدف، أو خطوات واضحة؟" },
  { n: "٥", title: "نلتزم", body: "ما الذي سنفعله فعلًا؟ ومتى؟ وما الذي يساعدنا على الاستمرار؟" },
  { n: "٦", title: "نقيس", body: "ما الذي تغيّر في التفكير، أو القرار، أو السلوك، أو النتيجة؟" },
];

export function KnowledgeJourney() {
  return (
    <section className="hm-journey hm-journey-v3 home-anchor" id="how" aria-labelledby="how-title">
      <div className="wrap">
        <header className="hm-journey-head">
          <p className="hm-eyebrow">منهج بهجة</p>
          <h2 className="h-sec" id="how-title">من المعرفة إلى فهم وقرار وفعل</h2>
          <p className="hm-journey-intro">
            لا نتعامل مع المعرفة بوصفها مادة يجب اختصارها، بل فكرة يجب فهمها
            ومساءلتها ثم تحويلها إلى قرار وخطة وفعل.
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
          ننتقي بوعي. نفهم بعمق. نسأل بذكاء. نخطط بوضوح. نلتزم بالفعل. ونقيس الأثر.
        </p>
      </div>
    </section>
  );
}
