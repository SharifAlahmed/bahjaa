import type { Metadata } from "next";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = {
  metadataBase: new URL("https://bahjaa.com"),
  title: "نشرة بهجة: فكرة واحدة تستحق وقتك كل أسبوع",
  description:
    "تعرّف على بهجة واشترك في رسالتها الأسبوعية: فكرة مختارة بعناية، موضوعة في سياقها، ومهيأة للتطبيق.",
  alternates: { canonical: "/join" },
  openGraph: {
    title: "بهجة — المعرفة لم تعد هي المشكلة",
    description: "المشكلة هي: ماذا نفعل بكل ما نعرفه؟",
    url: "/join",
    type: "website",
    images: [
      {
        url: "/join-og.jpg",
        width: 1200,
        height: 630,
        alt: "بهجة — المعرفة لم تعد هي المشكلة. المشكلة هي: ماذا نفعل بكل ما نعرفه؟",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "بهجة — المعرفة لم تعد هي المشكلة",
    description: "المشكلة هي: ماذا نفعل بكل ما نعرفه؟",
    images: ["/join-og.jpg"],
  },
};

const JOIN_FORM_ID = process.env.NEXT_PUBLIC_BEEHIIV_JOIN_FORM_ID;

export default function JoinPage() {
  return (
    <article className="join-page">
      <section className="join-hero" aria-labelledby="join-title">
        <div className="join-col">
          <p className="join-eyebrow">نشرة بهجة الأسبوعية</p>
          <h1 className="join-title" id="join-title">
            المعرفة لم تعد هي المشكلة.
            <span>المشكلة هي: ماذا نفعل بكل ما نعرفه؟</span>
          </h1>

          <div className="join-intro">
            <p>
              نقرأ الكتب، نحفظ المقالات، نشاهد المقاطع، ونتنقل بين عشرات الأفكار
              والأدوات.
            </p>
            <p>
              نعرف أكثر من أي وقت مضى، لكن كثيراً مما نتعلمه يبقى بعيداً عن
              قراراتنا وأعمالنا وحياتنا.
            </p>
          </div>

          <p className="join-turn">لهذا وُجدت بهجة.</p>

          <p className="join-definition">
            بهجة منصة عربية للمعرفة التطبيقية، تساعد القادة ورواد الأعمال على
            فهم أهم الكتب والأفكار ودراسات الحالة، وتحويلها إلى قرارات وخطوات
            عملية.
          </p>

          <blockquote className="join-promise">
            لا نلخّص المعرفة لتقرأ أكثر، بل لنساعدك على أن تفهم أعمق وتطبّق أفضل.
          </blockquote>
        </div>
      </section>

      <section className="join-founder" aria-labelledby="join-founder-title">
        <div className="join-col">
          <p className="join-section-kicker">من وراء الفكرة</p>
          <h2 className="join-section-title" id="join-founder-title">
            لماذا بنيت بهجة؟
          </h2>

          <div className="join-copy">
            <p>
              خلال سنوات من العمل مع قادة ومديرين، رأيت فرقاً واضحاً بين من يكتفي
              بالمعرفة ومن يحوّلها إلى قرار وسلوك ونتيجة.
            </p>
            <p>
              بعضهم كان يطبق ما يتعلمه فيتغيّر عمله، وبعضهم كان يعرف الكثير لكن
              القليل منه يصل إلى الممارسة.
            </p>
            <p className="join-founder-core">
              بنيت بهجة لتقليص هذه الفجوة — بين ما نعرفه وما نفعله بما نعرفه.
            </p>
          </div>

          <div className="join-founder-sign">
            <strong>شريف الأحمد</strong>
            <span>مؤسس بهجة</span>
          </div>
        </div>
      </section>

      <section className="join-newsletter" aria-labelledby="join-newsletter-title">
        <div className="join-col">
          <p className="join-section-kicker">رسالة بهجة الأسبوعية</p>
          <h2 className="join-section-title" id="join-newsletter-title">
            فكرة واحدة تستحق وقتك، كل أسبوع.
          </h2>

          <p className="join-newsletter-lead">
            رسالة بهجة الأسبوعية هي امتداد طبيعي لفكرة بهجة. كل أسبوع نختار فكرة
            تستحق انتباهك من كتاب، أو دراسة حالة، أو مصدر موثوق، ثم نضعها في
            سياقها ونقدّمها بطريقة تساعدك على فهمها واستخدامها فعلاً.
          </p>

          <div className="join-principles" role="list" aria-label="ما الذي يميز رسالة بهجة">
            <div className="join-principle" role="listitem">
              <strong>انتقاء بوعي</strong>
              <span>لا مزيد من المحتوى لمجرد المحتوى.</span>
            </div>
            <div className="join-principle" role="listitem">
              <strong>وضوح بعمق</strong>
              <span>الفكرة، سياقها، وما الذي تعنيه لك.</span>
            </div>
            <div className="join-principle" role="listitem">
              <strong>معرفة للتطبيق</strong>
              <span>ما الذي يمكنك فعله بهذه الفكرة بعد أن تغلق الرسالة؟</span>
            </div>
          </div>
        </div>
      </section>

      <section className="join-signup" aria-labelledby="join-signup-title">
        <div className="join-col">
          <div className="join-signup-head">
            <p className="join-section-kicker">ابدأ من هنا</p>
            <h2 className="join-section-title" id="join-signup-title">
              انضم إلى رسالة بهجة الأسبوعية
            </h2>
            <p>أدخل بريدك، وستصلك رسالة واحدة تستحق وقتك كل أسبوع.</p>
          </div>

          {JOIN_FORM_ID ? (
            <NewsletterForm formId={JOIN_FORM_ID} />
          ) : (
            <div className="join-form-pending" role="status">
              نموذج الاشتراك المخصص لـ /join جاهز للربط بمجرد إضافة معرّف Beehiiv.
            </div>
          )}

          <p className="join-assurance">
            مجانية بالكامل · رسالة واحدة أسبوعياً · يمكنك إلغاء الاشتراك في أي وقت.
          </p>

          <p className="join-byline">
            <strong>يكتبها شريف الأحمد</strong>
            <span>مؤسس بهجة</span>
          </p>
        </div>
      </section>
    </article>
  );
}
