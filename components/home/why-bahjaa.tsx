import Link from "next/link";

/* short: الرئيسية — العنوان والجملة الخلاصة وزر إلى /about
   full: صفحة «عن بهجة» — النص كاملاً */
export function WhyBahjaa({ variant = "full" }: { variant?: "full" | "short" }) {
  const isShort = variant === "short";
  return (
    <section
      className={`home-why home-anchor${isShort ? " home-why-short" : ""}`}
      id="why"
      aria-labelledby="why-title"
    >
      <div className="wrap">
        <div className="home-col">
          <h2 className="h-sec" id="why-title">لماذا بهجة؟</h2>

          <div className="home-prose">
            {!isShort && (
              <>
                <p>
                  نعيش في عالمٍ مليء بالكتب، والمقالات، والمقاطع، والأفكار.
                  <br />
                  لكن كثرة المعلومات لا تعني بالضرورة وضوحًا أكبر أو قرارات أفضل.
                </p>
                <p>
                  المشكلة ليست في الوصول إلى المعرفة، بل في معرفة ما يستحق الانتباه،
                  وفهم ما يعنيه في سياقك، ثم تحويله إلى عمل ونتيجة.
                </p>
                <p>لهذا وُجدت بهجة.</p>
                <p>
                  نبحث في المعرفة الموثوقة من مصادر عالمية متنوعة، ونستخلص جوهرها،
                  ثم نقدّمها بأسلوب عربي واضح وعميق وقابل للتطبيق في واقع العمل
                  والحياة.
                </p>
              </>
            )}
            <p className="home-prose-strong">
              لا نلخّص المعرفة لتقرأ أكثر، بل لنساعدك على أن تنفّذ أفضل.
            </p>
          </div>

          {isShort && (
            <Link href="/about" className="btn btn-ghost">عن بهجة</Link>
          )}
        </div>
      </div>
    </section>
  );
}
