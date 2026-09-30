import Image from "next/image";

export function Hero() {
  return (
    <section className="home-hero home-hero-v3" aria-labelledby="hero-title">
      <div className="wrap home-hero-grid">
        <div className="home-hero-copy">
          <p className="hm-eyebrow">منصة عربية للمعرفة التطبيقية</p>

          <h1 className="home-hero-title" id="hero-title">
            <span>معرفة تستحق وقتك.</span>
            <span>تساعدك على فهم أعمق واتخاذ قرار أفضل.</span>
          </h1>

          <p className="home-hero-lede">
            نختار أهم الكتب والأفكار ودراسات الحالة، ونقدّمها بطريقة تساعدك على فهم
            جوهرها وتحويلها إلى قرارات وخطوات قابلة للتطبيق.
          </p>

          <div className="home-hero-actions">
            <a href="#latest" className="btn btn-brand">استكشف الملخصات</a>
            <a href="#how" className="btn btn-ghost">اكتشف منهج بهجة</a>
          </div>

          <p className="home-hero-authority">
            <strong>أسّسها شريف الأحمد</strong> — بخبرة عملية مع قادة وفرق ومؤسسات،
            ومنهج يستفيد من التفكير الاستراتيجي ومهارات الكوتشينغ المهني.
          </p>
        </div>

        <figure className="home-hero-visual">
          <Image
            src="/join/good-to-great-books.jpg"
            width={860}
            height={602}
            priority
            sizes="(max-width: 860px) 100vw, 520px"
            alt="كتاب «من جيد إلى عظيم» وملخص بهجة كمثال على تحويل المعرفة إلى خلاصة عملية"
          />
        </figure>
      </div>
    </section>
  );
}
