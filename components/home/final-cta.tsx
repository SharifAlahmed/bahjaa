import NewsletterForm from "@/components/NewsletterForm";

export function FinalCTA() {
  return (
    <section className="hm-final hm-newsletter" aria-labelledby="final-title">
      <div className="wrap hm-center">
        <p className="hm-eyebrow">النشرة البريدية</p>
        <h2 className="hm-final-title" id="final-title">
          اشترك في النشرة البريدية
        </h2>
        <p className="hm-final-body">
          تصلك أفكار مختارة من الكتب والمقالات ودراسات الحالة، بصياغة تساعدك على
          الفهم والتطبيق.
        </p>

        <div className="hm-newsletter-form">
          <NewsletterForm
            className="w-full my-0"
            boxClassName="mx-auto max-w-2xl min-h-[170px]"
          />
        </div>

        <p className="hm-newsletter-trust">
          مجانية بالكامل · يمكنك إلغاء الاشتراك في أي وقت.
        </p>
      </div>
    </section>
  );
}
