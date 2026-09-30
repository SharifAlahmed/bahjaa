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
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-14 pt-6 sm:px-8 sm:pb-20 sm:pt-10">
        {/* الصورة أول ما يراه القارئ: على الجوال في الأعلى بعرض كامل، وعلى سطح المكتب
            عمود يمين ثابت أثناء التمرير، والنص والنموذج في العمود الأيسر */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start lg:gap-16">
          <figure className="m-0 mx-auto w-full max-w-[480px] lg:sticky lg:top-8 lg:max-w-none">
            <Image
              src="/home/hero-mobile.webp"
              width={1122}
              height={1402}
              alt="«من جيد إلى عظيم»: ٣٨٤ صفحة و١٠ ساعات في الكتاب الكامل، مقابل ٩ صفحات و١٥ دقيقة في ملخص بهجة — أفضل الكتب فقط، خلاصات دقيقة وعميقة، ووقت أقل لقرارات أفضل"
              sizes="(max-width: 1024px) min(100vw, 480px), 528px"
              priority
              className="block h-auto w-full rounded-[var(--radius-card)]"
            />
          </figure>

          <div>
            <Image
              src="/logo/bahjaa-logo.png"
              width={104}
              height={104}
              alt="بهجة"
              className="h-[72px] w-[72px] object-contain sm:h-[88px] sm:w-[88px]"
            />

            <section className="mt-6 sm:mt-8">
              <p className="eyebrow text-start">رسالة بهجة الأسبوعية</p>

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

            <section id="join-form" className="mt-8 border-t border-border pt-8 sm:mt-10 sm:pt-9">
              <h2 className="text-start font-display text-[clamp(25px,3vw,32px)] font-bold leading-[1.5] text-brand-dark">
                فكرة واحدة تستحق وقتك، كل أسبوع.
              </h2>

              <p className="mt-3 text-start text-[17px] leading-[1.85] text-ink-soft">
                كل أسبوع، نختار فكرة واحدة من كتاب أو دراسة حالة أو مصدر موثوق،
                ونقدّمها لك بطريقة تساعدك على فهمها واستخدامها فعلاً.
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
      </div>
    </div>
  );
}
