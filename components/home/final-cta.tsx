import NewsletterForm from "@/components/NewsletterForm";

export function FinalCTA() {
  return (
    <section className="hm-final hm-newsletter" aria-labelledby="final-title">
      <div className="wrap hm-center">
        <p className="hm-eyebrow">رسالة بهجة الأسبوعية</p>
        <h2 className="hm-final-title" id="final-title">
          فكرة واحدة تستحق وقتك، كل أسبوع.
        </h2>
        <p className="hm-final-body">
          من كتاب أو دراسة حالة أو مصدر موثوق، نختار فكرة واحدة ونقدّمها بطريقة
          تساعدك على فهمها واستخدامها فعلًا.
        </p>

        <div className="hm-newsletter-form">
          <NewsletterForm
            className="w-full my-0"
            boxClassName="mx-auto max-w-2xl min-h-[180px]"
          />
        </div>

        <p className="hm-newsletter-trust">
          مجانية بالكامل · رسالة واحدة أسبوعياً · إلغاء الاشتراك في أي وقت.
        </p>
      </div>
    </section>
  );
}
