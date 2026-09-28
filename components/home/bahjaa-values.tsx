/* قيم بهجة الرسمية الثلاث — كيف تفكر بهجة وتتعامل مع المعرفة.
   تختلف عن رحلة المستخدم (افهم ← استخرج ← طبّق ← قِس)، فلا خطوط وصل ولا أسهم هنا. */
const values = [
  {
    n: "١",
    title: "انتقاء بوعي",
    body: "نختار الكتب والأفكار والمصادر التي تحمل قيمة حقيقية، لأن ما نختار أن نتعلمه لا يقل أهمية عن الطريقة التي نتعلم بها.",
  },
  {
    n: "٢",
    title: "وضوح بعمق",
    body: "نصل إلى جوهر الفكرة ونحافظ على سياقها، ثم نقدّمها بوضوح دون أن نفقد معناها أو عمقها.",
  },
  {
    n: "٣",
    title: "معرفة للتطبيق",
    body: "لا نريد أن تتوقف المعرفة عند القراءة. نحول الأفكار إلى أسئلة وخطوات وأدوات تساعدك على استخدامها في الواقع.",
  },
];

export function BahjaaValues() {
  return (
    <section className="hm-values" aria-labelledby="values-title">
      <div className="wrap">
        <h2 className="h-sec hm-center" id="values-title">قيم بهجة</h2>
        <ul className="hm-values-grid">
          {values.map((v) => (
            <li key={v.title} className="hm-value">
              <span className="hm-value-n" aria-hidden="true">{v.n}</span>
              <h3 className="hm-value-title">{v.title}</h3>
              <p className="hm-value-body">{v.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
