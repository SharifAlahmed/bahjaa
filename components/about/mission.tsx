/* رسالتنا: العنوان في عمود جانبي والنص في عمود القراءة — فلسفة لا خطوات */
export function Mission() {
  return (
    <section className="ab-mission" aria-labelledby="mission-title">
      <div className="wrap ab-side-grid">
        <h2 className="ab-h2 ab-side-head" id="mission-title">رسالتنا</h2>
        <div className="ab-prose">
          <p className="ab-mission-lead">مهمتنا في بهجة أن نخفف المسافة بين المعرفة والتطبيق.</p>
          <p>
            نبحث وسط وفرة الكتب والمقالات والأفكار عن المعرفة التي تستحق وقتك، ثم نستخرج جوهرها
            ونقدّمها لك بطريقة واضحة وعميقة.
          </p>
          <p className="ab-turn">لكننا لا نتوقف عند التلخيص.</p>
          <p>
            نساعدك على فهم ما تعنيه الفكرة في سياقك، وكيف يمكن أن تستخدمها، وما الخطوة التي تستطيع أن
            تبدأ بها.
          </p>
          <p>
            غايتنا ليست أن تنهي محتوى أكثر، بل أن تخرج من كل معرفة بشيء تستطيع أن تستخدمه.
          </p>
          <p className="ab-coda">
            من المعرفة إلى الفهم، ومن الفهم إلى التطبيق، ومن التطبيق إلى أثر حقيقي.
          </p>
        </div>
      </div>
    </section>
  );
}
