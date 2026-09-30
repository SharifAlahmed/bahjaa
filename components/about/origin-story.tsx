/* القصة وراء بهجة: مسار قراءة واحد بلا عناصر جانبية تنافس النص. */
export function OriginStory() {
  return (
    <section className="ab-story ab-story-v3" aria-labelledby="story-title">
      <div className="wrap">
        <div className="ab-prose ab-story-copy">
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
      </div>
    </section>
  );
}
