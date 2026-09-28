/* «كيف تعمل بهجة؟» — رحلة المستخدم مع المعرفة: افهم ← استخرج ← طبّق ← قِس.
   id="how" هدف زر الهيرو الثانوي. التقدّم من اليمين إلى اليسار على سطح المكتب، ورأسي على الجوال */
const steps = [
  {
    n: "١",
    title: "افهم",
    lead: "ابدأ بالفكرة كما ينبغي أن تُفهم.",
    body: "جوهر المعرفة وسياقها، لا مجرد نقاط مختصرة.",
  },
  {
    n: "٢",
    title: "استخرج",
    lead: "اعرف ما الذي يستحق أن يبقى معك.",
    body: "الأفكار والمبادئ والأسئلة التي تحمل أكبر قيمة.",
  },
  {
    n: "٣",
    title: "طبّق",
    lead: "حوّل الفكرة إلى خطوة.",
    body: "أسئلة وتمارين وخطوات تساعدك على استخدام ما تعلمته.",
  },
  {
    n: "٤",
    title: "قِس",
    lead: "لاحظ ما الذي تغيّر.",
    body: "راقب أثر ما طبّقته، وما نجح، وما يحتاج إلى تعديل.",
  },
];

export function KnowledgeJourney() {
  return (
    <section className="hm-journey home-anchor" id="how" aria-labelledby="how-title">
      <div className="wrap">
        <header className="hm-journey-head">
          <h2 className="h-sec" id="how-title">كيف تعمل بهجة؟</h2>
          <p className="hm-lead">من المعرفة إلى أثر يمكن أن تراه.</p>
          <p className="hm-journey-intro">
            نأخذك في مسار واضح يساعدك على الانتقال من الفهم إلى الاستخدام.
          </p>
        </header>

        <ol className="hm-steps">
          {steps.map((s) => (
            <li key={s.title} className="hm-step">
              <span className="hm-step-n" aria-hidden="true">{s.n}</span>
              <h3 className="hm-step-title">{s.title}</h3>
              <p className="hm-step-lead">{s.lead}</p>
              <p className="hm-step-body">{s.body}</p>
            </li>
          ))}
        </ol>

        <p className="hm-journey-close">
          افهم ما تتعلمه. استخرج ما يهم. طبّق ما ينفع. وقِس ما يتغيّر.
        </p>
      </div>
    </section>
  );
}
