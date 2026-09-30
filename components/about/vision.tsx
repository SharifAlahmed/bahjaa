/* الرؤية والرسالة في قسم واحد: الوجهة التي نسعى إليها، وما نفعله للوصول إليها. */
export function AboutVision() {
  return (
    <section className="ab-vision ab-purpose" aria-labelledby="purpose-title">
      <div className="wrap">
        <h2 className="ab-h2" id="purpose-title">ما الذي نسعى إليه؟</h2>

        <div className="ab-purpose-grid">
          <div className="ab-purpose-item">
            <p className="ab-eyebrow">رؤيتنا</p>
            <p className="ab-vision-lead">
              أن نجعل المعرفة الموثوقة قوةً عمليةً تمكّن القادة وروّاد الأعمال العرب
              من اتخاذ قرارات أكثر وعيًا، وبناء أعمال ذات أثر ونتائج مستدامة.
            </p>
          </div>

          <div className="ab-purpose-item">
            <p className="ab-eyebrow">رسالتنا</p>
            <p className="ab-purpose-copy">
              أن نخفّف المسافة بين المعرفة والتطبيق؛ فننتقي ما يستحق وقتك، ونقدّمه
              بوضوح وعمق، ونساعدك على تحويله إلى قرار أو خطوة عملية.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
