import type { ReactNode } from "react";

/* قيم بهجة: قيمة في كل شريط أفقي (رقم، عنوان، شرح). مبادئ لا خطوات — لا أسهم ولا خطوط وصل */
const values: { n: string; title: string; body: ReactNode }[] = [
  {
    n: "١",
    title: "انتقاء بوعي",
    body: (
      <>
        <p>لا نبحث عن المزيد من المحتوى، بل عن المعرفة التي تستحق أن تمنحها وقتك وانتباهك.</p>
        <p>
          نختار الكتب والأفكار والمصادر بعناية، لأن ما نختار أن نتعلمه لا يقل أهمية عن الطريقة
          التي نتعلم بها.
        </p>
      </>
    ),
  },
  {
    n: "٢",
    title: "وضوح بعمق",
    body: (
      <>
        <p>لا نختصر الفكرة حتى تفقد معناها، ولا نعقّدها حتى تبدو أكثر قيمة.</p>
        <p>نصل إلى جوهرها، نحافظ على سياقها، ثم نقدّمها بوضوح يساعدك على أن تفهمها فعلًا.</p>
      </>
    ),
  },
  {
    n: "٣",
    title: "معرفة للتطبيق",
    body: (
      <>
        <p>المعرفة بالنسبة لنا لا تنتهي عند القراءة.</p>
        <p>
          نسأل دائمًا:
          <br />
          <strong>ماذا يمكنك أن تفعل بهذه الفكرة؟</strong>
        </p>
        <p>
          لذلك نحول ما تتعلمه إلى أسئلة وخطوات وأدوات تساعدك على استخدامه في حياتك وعملك
          وقراراتك.
        </p>
      </>
    ),
  },
];

export function AboutValues() {
  return (
    <section className="ab-values" aria-labelledby="values-title">
      <div className="wrap">
        <h2 className="ab-h2" id="values-title">قيم بهجة</h2>
        <p className="ab-intro">ثلاثة مبادئ نعود إليها في كل ما نختاره ونقدّمه.</p>
        <ul className="ab-values-list">
          {values.map((v) => (
            <li key={v.title} className="ab-value">
              <span className="ab-value-n" aria-hidden="true">{v.n}</span>
              <h3 className="ab-value-title">{v.title}</h3>
              <div className="ab-prose ab-value-body">{v.body}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
