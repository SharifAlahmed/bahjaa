import Image from "next/image";

export function WhyBahjaa() {
  return (
    <section className="home-why home-anchor" id="why" aria-labelledby="why-title">
      <div className="wrap home-why-grid">
        <div className="home-why-media">
          <Image
            src="/home/why-summary.webp"
            alt=""
            width={1536}
            height={1024}
            sizes="(max-width: 860px) 100vw, 560px"
          />
        </div>

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

          <a href="#latest" className="btn btn-ghost">استكشف الملخصات</a>
        </div>
      </div>
    </section>
  );
}
