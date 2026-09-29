/* افتتاحية «عن بهجة»: بيان تحريري مقتضب على الورق، بلا صورة ولا رسم */
export function AboutHero() {
  return (
    <section className="ab-hero" aria-labelledby="about-title">
      <div className="wrap">
        <p className="ab-eyebrow">عن بهجة</p>
        <h1 className="ab-hero-title" id="about-title">من المعرفة الى الأثر</h1>
        <p className="ab-hero-lede">
          بهجة مساحة عربية للمعرفة التي تستحق وقتك؛ نختارها بوعي، ونقدّمها بوضوح وعمق،
          ونساعدك على تحويلها إلى شيء يمكنك استخدامه.
        </p>
        <p className="ab-hero-note">
          لأننا لا نريدك أن تعرف أكثر، بل أن تستفيد وتطبق أكثر مما تعرف.
        </p>
      </div>
    </section>
  );
}
