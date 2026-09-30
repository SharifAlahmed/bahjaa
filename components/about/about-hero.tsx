/* افتتاحية «عن بهجة»: تعريف واضح ومقتضب، بلا تكرار للوعد النهائي. */
export function AboutHero() {
  return (
    <section className="ab-hero ab-hero-v2" aria-labelledby="about-title">
      <div className="wrap">
        <p className="ab-eyebrow">عن بهجة</p>
        <h1 className="ab-hero-title" id="about-title">من المعرفة إلى الأثر</h1>
        <p className="ab-hero-lede">
          بهجة منصة عربية للمعرفة التطبيقية، تساعد القادة ورواد الأعمال على تحويل المعرفة
          إلى فهم أوضح، وقرارات أفضل، وخطوات قابلة للتطبيق.
        </p>
      </div>
    </section>
  );
}
