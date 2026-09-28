/* الوعد الرسمي كخلاصة للصفحة: طباعة كبيرة على الورق بين خطّين نحاسيين —
   مكمّل للوحة الرئيسية الداكنة لا نسخة منها، فلا لوحة داكنة في هذه الصفحة */
export function AboutPromise() {
  return (
    <section className="ab-promise" aria-labelledby="promise-title">
      <div className="wrap">
        <span className="ab-rule ab-rule-center" aria-hidden="true" />
        <h2 className="ab-promise-text" id="promise-title">
          لا نلخّص المعرفة لتقرأ أكثر، بل لنساعدك على أن تفهم أعمق وتطبّق أفضل.
        </h2>
        <span className="ab-rule ab-rule-center" aria-hidden="true" />
      </div>
    </section>
  );
}
