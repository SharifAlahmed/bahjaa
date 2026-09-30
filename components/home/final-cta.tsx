import NewsletterForm from "@/components/NewsletterForm";

export function FinalCTA() {
  return (
    <section className="hm-final hm-newsletter" aria-labelledby="final-title">
      <div className="wrap hm-center">
        <p className="hm-eyebrow">رسالة بهجة الأسبوعية</p>
        <h2 className="sr-only" id="final-title">اشترك في رسالة بهجة الأسبوعية</h2>

        <div className="hm-newsletter-form">
          <NewsletterForm
            className="w-full my-0"
            boxClassName="mx-auto max-w-2xl min-h-[170px]"
          />
        </div>

        <p className="hm-newsletter-trust">
          مجانية بالكامل · رسالة واحدة أسبوعياً · إلغاء الاشتراك في أي وقت.
        </p>
      </div>
    </section>
  );
}
