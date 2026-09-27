import Image from "next/image";

export function Hero() {
  return (
    <section className="home-hero" aria-labelledby="hero-title">
      <div className="wrap home-hero-grid">
        <div className="home-hero-text">
          <p className="home-kicker">منصة بهجة للمعرفة التطبيقية</p>
          <h1 className="home-hero-title" id="hero-title">
            نحوّل المعرفة إلى أثر
          </h1>
          <p className="home-hero-lede">
            نأخذ أهم ما في الكتب والمحتوى المعرفي، ونحوّله إلى فهم واضح وأفكار
            عملية وخطوات قابلة للتطبيق.
          </p>
          <div className="home-actions">
            <a href="#latest" className="btn btn-brand">استكشف بهجة</a>
            <a href="#why" className="btn btn-ghost">لماذا بهجة؟</a>
          </div>
        </div>

        <div className="home-hero-media">
          <Image
            src="/hero/hero-workspace.webp"
            alt=""
            width={1536}
            height={1024}
            priority
            sizes="(max-width: 860px) 100vw, 540px"
          />
        </div>
      </div>
    </section>
  );
}
