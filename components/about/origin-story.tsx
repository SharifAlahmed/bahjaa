/* القصة وراء بهجة: لماذا وُجدت المنصة، في ثلاث فقرات فقط. */
export function OriginStory() {
  return (
    <section className="ab-story ab-story-v2" aria-labelledby="story-title">
      <div className="wrap ab-story-grid">
        <div className="ab-prose">
          <h2 className="ab-h2" id="story-title">القصة وراء بهجة</h2>

          <p>
            لم تُبنَ بهجة لأن العالم يحتاج إلى مزيد من المحتوى، بل لأن المعرفة القيّمة
            تضيع كثيرًا بين كثرة المصادر وضيق الوقت.
          </p>

          <p>
            نقرأ ونشاهد ونحفظ الكثير، لكن يبقى التحدي:
            <strong> كيف نميّز ما يستحق انتباهنا، ثم نحوّل ما نتعلمه إلى فهم يغيّر قرارًا أو فعلًا؟</strong>
          </p>

          <p className="ab-turn">
            من هنا بدأت بهجة: للوصول إلى جوهر الأفكار، ووضعها في سياقها، ثم تحويلها
            إلى معرفة يمكن استخدامها.
          </p>
        </div>

        <aside className="ab-story-quote" aria-hidden="true">
          <span className="ab-rule" />
          <p>ما الذي يستحق أن نعرفه فعلًا؟</p>
        </aside>
      </div>
    </section>
  );
}
