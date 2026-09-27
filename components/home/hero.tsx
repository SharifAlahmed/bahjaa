import { getImageProps } from "next/image";

/* الهيرو صورة واحدة بعرض الصفحة تحت الترويسة، بنسخة عمودية للجوال (أقل من ٦٠٠ بكسل).
   العنوان داخل الصورة، فيُكرَّر لقارئ الشاشة في h1 مخفي */
export function Hero() {
  const common = { alt: "", sizes: "(max-width: 1438px) 100vw, 1338px", priority: true };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: "/home/hero-banner.webp", width: 1672, height: 941 });
  const {
    props: { srcSet: mobileSrcSet, ...mobileImg },
  } = getImageProps({ ...common, src: "/home/hero-mobile.webp", width: 1122, height: 1402 });

  return (
    <section className="home-hero" aria-labelledby="hero-title">
      <h1 className="sr-only" id="hero-title">
        استخرج أفضل الأفكار القيادية في ١٥ دقيقة فقط
      </h1>
      <picture>
        <source media="(min-width: 600px)" srcSet={desktopSrcSet} width={1672} height={941} />
        <img {...mobileImg} srcSet={mobileSrcSet} alt="" />
      </picture>
      <div className="home-hero-cta">
        <a href="#latest" className="btn btn-brand">استكشف الملخصات</a>
      </div>
    </section>
  );
}
