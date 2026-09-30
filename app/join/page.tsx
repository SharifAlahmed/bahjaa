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
    title: "بهجة — لا تحتاج إلى مزيد من المعلومات.",
    description: "تحتاج إلى معرفة تساعدك على اتخاذ قرار أفضل.",
    url: "/join",
    type: "website",
    images: [
      {
        url: "/join/share.png",
        width: 1200,
        height: 630,
        alt: "بهجة — لا تحتاج إلى مزيد من المعلومات. تحتاج إلى معرفة تساعدك على اتخاذ قرار أفضل.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "بهجة — لا تحتاج إلى مزيد من المعلومات.",
    description: "تحتاج إلى معرفة تساعدك على اتخاذ قرار أفضل.",
    images: ["/join/share.png"],
  },
};

export default function JoinPage() {
  return (
    <div className="join-landing min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-12 pt-6 sm:px-8 sm:pb-20 sm:pt-10">
        {/* الـHero وحده بعمودين على سطح المكتب: الصورة يميناً والنص يساراً.
            على الجوال الصورة أولاً ثم النص. */}
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-2 lg:items-center lg:gap-16">
          <figure className="m-0 mx-auto w-full max-w-[560px] lg:max-w-none">
            <Image
              src="/join/good-to-great-books.jpg"
              width={860}
              height={602}
              alt="«من جيد إلى عظيم»: ٣٨٤ صفحة و١٠ ساعات في الكتاب الكامل، مقابل ٩ صفحات و١٥ دقيقة في ملخص بهجة"
              sizes="(max-width: 1024px) min(100vw, 560px), 528px"
              priority
              className="block h-auto w-full rounded-[var(--radius-card)]"
            />
          </figure>

          <section>
            <Image
              src="/logo/bahjaa-logo.png"
              width={104}
              height={104}
              alt="بهجة"
              className="h-[72px] w-[72px] object-contain sm:h-[88px] sm:w-[88px]"
            />

            <p className="eyebrow mt-5 text-start sm:mt-7">رسالة بهجة الأسبوعية</p>

            {/* سطران واضحان: كل جملة كتلة مستقلة متوازنة، فلا تبقى كلمة وحيدة في سطر */}
            <h1 className="mt-3 text-start font-display text-[clamp(27px,3.4vw,40px)] font-bold leading-[1.4] text-brand-dark">
              <span className="block [text-wrap:balance]">لا تحتاج إلى مزيد من المعلومات.</span>
              <span className="block [text-wrap:balance]">تحتاج إلى معرفة تساعدك على اتخاذ قرار أفضل.</span>
            </h1>

            <p className="mt-5 text-start text-[18px] leading-[1.9] text-ink-soft">
              بهجة منصة عربية للمعرفة التطبيقية، تساعد القادة ورواد الأعمال على
              تحويل أهم الكتب والأفكار ودراسات الحالة إلى فهم أوضح وقرارات وخطوات
              عملية.
            </p>
          </section>
        </div>

        {/* بعد الـHero: عمود واحد في الوسط للاشتراك */}
        <section
          id="join-form"
          className="mx-auto mt-8 max-w-[640px] border-t border-border pt-7 sm:mt-14 sm:pt-10"
        >
          <h2 className="text-start font-display text-[clamp(25px,3vw,32px)] font-bold leading-[1.5] text-brand-dark">
            فكرة واحدة تستحق وقتك، كل أسبوع.
          </h2>

          <p className="mt-3 text-start text-[17px] leading-[1.85] text-ink-soft">
            كل أسبوع، نختار فكرة واحدة من كتاب أو دراسة حالة أو مصدر موثوق،
            ونقدّمها لك بطريقة تساعدك على فهمها واستخدامها فعلاً.
          </p>

          {/* إطار beehiiv يضبط ارتفاعه بنفسه (≈٢٠٧)؛ الحد الأدنى هنا يمنع القفزة أثناء التحميل فقط */}
          <NewsletterForm
            formId={JOIN_FORM_ID}
            className="my-4 w-full sm:my-6"
            boxClassName="join-compact-form mx-auto max-w-2xl"
          />

          <p className="text-center text-sm leading-7 text-ink-muted">
            مجانية بالكامل · رسالة واحدة أسبوعياً · إلغاء الاشتراك في أي وقت.
          </p>

          <p className="mt-5 border-t border-border pt-4 text-center text-sm leading-7 text-ink-muted sm:mt-6 sm:pt-5">
            يكتبها <span className="font-bold text-brand-dark">شريف الأحمد</span> · مؤسس بهجة
          </p>
        </section>
      </div>
    </div>
  );
}
