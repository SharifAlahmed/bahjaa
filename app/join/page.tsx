import type { Metadata } from "next";
import NewsletterForm from "@/components/NewsletterForm";

const JOIN_FORM_ID = "f43a1a31-56ee-433b-b2be-485bb215b669";

export const metadata: Metadata = {
  title: "نشرة بهجة: فكرة واحدة قابلة للتنفيذ كل أسبوع",
  description:
    "تعرّف على بهجة، منصة عربية للمعرفة التطبيقية، وانضم إلى رسالة بهجة الأسبوعية: فكرة واحدة تستحق وقتك وتساعدك على الانتقال من المعرفة إلى التطبيق.",
  alternates: { canonical: "/join" },
  openGraph: {
    title: "بهجة — المعرفة لم تعد هي المشكلة",
    description:
      "المشكلة هي: ماذا نفعل بكل ما نعرفه؟ تعرّف على بهجة وانضم إلى رسالتها الأسبوعية.",
    url: "/join",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "بهجة — المعرفة لم تعد هي المشكلة",
    description: "المشكلة هي: ماذا نفعل بكل ما نعرفه؟",
  },
};

export default function JoinPage() {
  return (
    <div className="join-page">
      <article className="join-shell">
        <header className="join-hero">
          <p className="join-eyebrow">نشرة بهجة الأسبوعية</p>
          <h1 className="join-title">
            المعرفة لم تعد هي المشكلة.
            <span>المشكلة هي: ماذا نفعل بكل ما نعرفه؟</span>
          </h1>

          <div className="join-lead">
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
            بهجة منصة عربية للمعرفة التطبيقية، تساعد القادة ورواد الأعمال على فهم
            أهم الكتب والأفكار ودراسات الحالة، وتحويلها إلى قرارات وخطوات عملية.
          </p>

          <p className="join-promise">
            لا نلخّص المعرفة لتقرأ أكثر، بل لنساعدك على أن تفهم أعمق وتطبّق أفضل.
          </p>
        </header>

        <section className="join-founder" aria-labelledby="join-founder-title">
          <p className="join-section-label">من المؤسس</p>
          <h2 id="join-founder-title">لماذا بنيت بهجة؟</h2>
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
          <p className="join-founder-sign">
            <strong>شريف الأحمد</strong>
            <span>مؤسس بهجة</span>
          </p>
        </section>

        <section className="join-newsletter" aria-labelledby="join-newsletter-title">
          <p className="join-section-label">رسالة بهجة الأسبوعية</p>
          <h2 id="join-newsletter-title">فكرة واحدة تستحق وقتك، كل أسبوع.</h2>
          <p>
            رسالة بهجة الأسبوعية هي امتداد طبيعي لفكرة بهجة. كل أسبوع نختار فكرة
            تستحق انتباهك من كتاب، أو دراسة حالة، أو مصدر موثوق، ثم نضعها في سياقها
            ونقدّمها بطريقة تساعدك على فهمها واستخدامها فعلاً.
          </p>

          <div className="join-principles" aria-label="ما الذي يميز رسالة بهجة">
            <div>
              <strong>انتقاء بوعي</strong>
              <span>لا مزيد من المحتوى لمجرد المحتوى.</span>
            </div>
            <div>
              <strong>وضوح بعمق</strong>
              <span>الفكرة، سياقها، وما الذي تعنيه لك.</span>
            </div>
            <div>
              <strong>معرفة للتطبيق</strong>
              <span>ما الذي يمكنك فعله بهذه الفكرة بعد أن تغلق الرسالة؟</span>
            </div>
          </div>
        </section>

        <section className="join-signup" aria-labelledby="join-signup-title">
          <p className="join-section-label">ابدأ من هنا</p>
          <h2 id="join-signup-title">انضم إلى رسالة بهجة الأسبوعية</h2>
          <p className="join-signup-intro">
            أدخل بريدك، وستصلك رسالة واحدة تستحق وقتك كل أسبوع.
          </p>

          <NewsletterForm formId={JOIN_FORM_ID} />

          <p className="join-trust">
            مجانية بالكامل · رسالة واحدة أسبوعياً · يمكنك إلغاء الاشتراك في أي وقت.
          </p>
          <p className="join-written-by">
            يكتبها <strong>شريف الأحمد</strong>
            <span>مؤسس بهجة</span>
          </p>
        </section>
      </article>
    </div>
  );
}
