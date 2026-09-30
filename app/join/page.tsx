import type { Metadata } from "next";
import Image from "next/image";
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
    <div className="join-landing min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[680px] px-5 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-12">
        <Image
          src="/logo/bahjaa-logo.png"
          width={104}
          height={104}
          alt="بهجة"
          priority
          className="mx-auto h-[88px] w-[88px] object-contain sm:h-[104px] sm:w-[104px]"
        />

        <section className="mt-8 sm:mt-10">
          <p className="eyebrow text-start">رسالة بهجة الأسبوعية</p>

          <h1 className="mt-3 text-start font-display text-[clamp(34px,6vw,54px)] font-bold leading-[1.38] text-brand-dark [text-wrap:balance]">
            المعرفة لم تعد هي المشكلة.
            <br />
            الفارق فيما نفعله بما نعرفه.
          </h1>

          <p className="mt-6 text-start text-[18px] leading-[1.9] text-ink-soft">
            بهجة منصة عربية للمعرفة التطبيقية، تساعد القادة ورواد الأعمال على
            تحويل أهم الكتب والأفكار ودراسات الحالة إلى فهم أوضح وقرارات وخطوات
            عملية.
          </p>

          <p className="mt-5 text-start font-display text-[20px] font-bold leading-[1.8] text-brand-dark">
            لا نلخّص المعرفة لتقرأ أكثر، بل لنساعدك على أن تفهم أعمق وتطبّق أفضل.
          </p>
        </section>

        <section id="join-form" className="mt-10 border-t border-border pt-9 sm:mt-12 sm:pt-10">
          <h2 className="text-start font-display text-[clamp(27px,4vw,36px)] font-bold leading-[1.5] text-brand-dark">
            فكرة واحدة تستحق وقتك، كل أسبوع.
          </h2>

          <p className="mt-3 text-start text-[17px] leading-[1.85] text-ink-soft">
            من كتاب، أو دراسة حالة، أو مصدر موثوق — نضعها في سياقها ونحوّلها إلى
            شيء يمكنك استخدامه فعلاً.
          </p>

          <NewsletterForm formId={JOIN_FORM_ID} className="w-full my-6" />

          <p className="text-start text-sm leading-7 text-ink-muted">
            مجانية بالكامل · رسالة واحدة أسبوعياً · إلغاء الاشتراك في أي وقت.
          </p>

          <p className="mt-6 border-t border-border pt-5 text-start text-sm leading-7 text-ink-muted">
            يكتبها <span className="font-bold text-brand-dark">شريف الأحمد</span> · مؤسس بهجة
          </p>
        </section>
      </div>
    </div>
  );
}
