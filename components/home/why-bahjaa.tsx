import Image from "next/image";

export function WhyBahjaa() {
  return (
    <section className="home-why home-anchor" id="why" aria-labelledby="why-title">
      <div className="wrap">
        <div className="home-col">
          <h2 className="h-sec" id="why-title">لماذا بهجة؟</h2>

          <div className="home-prose">
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
            <p className="home-prose-strong">
              لا نلخّص المعرفة لتقرأ أكثر، بل لنساعدك على أن تنفّذ أفضل.
            </p>
          </div>
        </div>

        {/* إنفوغرافيك «كيف تعمل بهجة؟» بعرض المحتوى كاملاً ليبقى نصه مقروءاً */}
        <div className="home-why-media">
          <Image
            src="/home/how-it-works.webp"
            alt="كيف تعمل بهجة؟"
            width={1672}
            height={941}
            sizes="(max-width: 920px) 100vw, 880px"
          />
        </div>

        <a href="#latest" className="btn btn-ghost">استكشف الملخصات</a>
      </div>
    </section>
  );
}
