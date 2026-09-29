import type { Metadata } from "next";
import NewsletterForm from "@/components/NewsletterForm";

const JOIN_FORM_ID = "f43a1a31-56ee-433b-b2be-485bb215b669";

export const metadata: Metadata = {
  title: "نشرة بهجة: فكرة واحدة قابلة للتنفيذ كل أسبوع",
  description:
    "تعرّف على بهجة واشترك في رسالتها الأسبوعية: فكرة واحدة تستحق وقتك، مختارة بعناية ومهيأة للفهم والتطبيق.",
  alternates: { canonical: "/join" },
  openGraph: {
    title: "بهجة — المعرفة لم تعد هي المشكلة",
    description: "المشكلة هي: ماذا نفعل بكل ما نعرفه؟",
    url: "/join",
    type: "website",
    images: [
      {
        url: "/join-og.png",
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
    images: ["/join-og.png"],
  },
};

export default function JoinPage() {
  return (
    <div className="bg-background">
      <section className="mx-auto w-full max-w-[720px] px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
        <p className="eyebrow text-start">نشرة بهجة الأسبوعية</p>

        <h1 className="mt-4 text-start font-display text-[clamp(32px,6vw,58px)] font-bold leading-[1.4] text-brand-dark [text-wrap:balance]">
          المعرفة لم تعد هي المشكلة.
          <br />
          المشكلة هي: ماذا نفعل بكل ما نعرفه؟
        </h1>

        <div className="mt-7 space-y-5 text-start text-[18px] leading-[1.95] text-ink-soft">
          <p>
            نقرأ الكتب، نحفظ المقالات، نشاهد المقاطع، ونتنقل بين عشرات الأفكار
            والأدوات.
          </p>
          <p>
            نعرف أكثر من أي وقت مضى، لكن كثيراً مما نتعلمه يبقى بعيداً عن
            قراراتنا وأعمالنا وحياتنا.
          </p>
        </div>

        <p className="mt-8 text-start font-display text-[28px] font-bold leading-[1.5] text-brand-dark">
          لهذا وُجدت بهجة.
        </p>

        <p className="mt-4 text-start text-[18px] leading-[1.95] text-ink-soft">
          بهجة منصة عربية للمعرفة التطبيقية، تساعد القادة ورواد الأعمال على فهم
          أهم الكتب والأفكار ودراسات الحالة، وتحويلها إلى قرارات وخطوات عملية.
        </p>

        <blockquote className="mt-8 border-s-2 border-brand-ink ps-5 text-start font-display text-[clamp(22px,3.4vw,30px)] font-bold leading-[1.7] text-brand-dark">
          لا نلخّص المعرفة لتقرأ أكثر، بل لنساعدك على أن تفهم أعمق وتطبّق أفضل.
        </blockquote>

        <a
          href="#join-form"
          className="mt-6 inline-flex min-h-11 items-center gap-2 text-start text-[15px] font-bold text-brand-ink no-underline"
        >
          انضم إلى رسالة بهجة الأسبوعية
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-[720px] px-5 py-14 sm:px-8 sm:py-20">
          <p className="eyebrow text-start">رسالة من المؤسس</p>
          <h2 className="mt-3 text-start font-display text-[clamp(28px,4vw,38px)] font-bold leading-[1.5] text-brand-dark">
            لماذا بنيت بهجة؟
          </h2>

          <div className="mt-6 space-y-5 text-start text-[17px] leading-[1.95] text-ink-soft">
            <p>
              خلال أكثر من سبعة وعشرين عاماً من العمل مع قادة ومديرين وفرق
              ومؤسسات مختلفة، رأيت فرقاً واضحاً بين من يكتفي بالمعرفة ومن
              يحوّلها إلى قرار وسلوك ونتيجة.
            </p>
            <p>
              بعضهم كان يطبق ما يتعلمه فيتغيّر عمله، وبعضهم كان يعرف الكثير لكن
              القليل منه يصل إلى الممارسة.
            </p>
            <p className="font-bold text-brand-dark">
              بنيت بهجة لتقليص هذه الفجوة — بين ما نعرفه وما نفعله بما نعرفه.
            </p>
          </div>

          <div className="mt-8 border-t border-border pt-5 text-start">
            <p className="font-bold text-brand-dark">شريف الأحمد</p>
            <p className="mt-1 text-sm text-ink-muted">مؤسس بهجة</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[720px] px-5 py-14 sm:px-8 sm:py-20">
        <p className="eyebrow text-start">رسالة بهجة الأسبوعية</p>
        <h2 className="mt-3 text-start font-display text-[clamp(30px,4.5vw,42px)] font-bold leading-[1.45] text-brand-dark">
          فكرة واحدة تستحق وقتك، كل أسبوع.
        </h2>

        <p className="mt-5 text-start text-[18px] leading-[1.95] text-ink-soft">
          رسالة بهجة الأسبوعية هي امتداد طبيعي لفكرة بهجة. كل أسبوع نختار فكرة
          تستحق انتباهك من كتاب، أو دراسة حالة، أو مصدر موثوق، ثم نضعها في
          سياقها ونقدّمها بطريقة تساعدك على فهمها واستخدامها فعلاً.
        </p>

        <div className="mt-8 grid gap-4">
          <div className="rounded-card border border-border bg-surface p-5 text-start">
            <p className="font-bold text-brand-dark">انتقاء بوعي</p>
            <p className="mt-1 text-ink-soft">لا مزيد من المحتوى لمجرد المحتوى.</p>
          </div>
          <div className="rounded-card border border-border bg-surface p-5 text-start">
            <p className="font-bold text-brand-dark">وضوح بعمق</p>
            <p className="mt-1 text-ink-soft">الفكرة، سياقها، وما الذي تعنيه لك.</p>
          </div>
          <div className="rounded-card border border-border bg-surface p-5 text-start">
            <p className="font-bold text-brand-dark">معرفة للتطبيق</p>
            <p className="mt-1 text-ink-soft">
              ما الذي يمكنك فعله بهذه الفكرة بعد أن تغلق الرسالة؟
            </p>
          </div>
        </div>
      </section>

      <section id="join-form" className="scroll-mt-28 border-t border-border bg-surface sm:scroll-mt-32">
        <div className="mx-auto w-full max-w-[720px] px-5 py-14 sm:px-8 sm:py-20">
          <h2 className="text-start font-display text-[clamp(28px,4vw,38px)] font-bold leading-[1.5] text-brand-dark">
            انضم إلى رسالة بهجة الأسبوعية
          </h2>
          <p className="mt-3 text-start text-[17px] leading-[1.9] text-ink-soft">
            أدخل بريدك، وستصلك رسالة واحدة تستحق وقتك كل أسبوع.
          </p>

          <NewsletterForm formId={JOIN_FORM_ID} className="w-full my-7" />

          <p className="text-start text-sm leading-7 text-ink-muted">
            مجانية بالكامل · رسالة واحدة أسبوعياً · يمكنك إلغاء الاشتراك في أي
            وقت.
          </p>

          <div className="mt-8 border-t border-border pt-5 text-start">
            <p className="font-bold text-brand-dark">يكتبها شريف الأحمد</p>
            <p className="mt-1 text-sm text-ink-muted">مؤسس بهجة</p>
          </div>
        </div>
      </section>
    </div>
  );
}
