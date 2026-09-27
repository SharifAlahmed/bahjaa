import { getImageProps } from "next/image";

/* سطح المكتب (٦٠٠ فأكثر): صورة الهيرو وفيها العنوان والنقاط، فيبقى h1 لقارئ الشاشة فقط.
   الجوال: صورة بلا نص، والعنوان والنقاط تُكتب في الصفحة بخط Tajawal. */
const points = [
  {
    title: "أفضل الكتب فقط",
    body: "نختار بعناية الكتب والأفكار الأكثر قيمة للقادة وروّاد الأعمال، ثم نقدّم لك خلاصتها المركّزة.",
  },
  {
    title: "خلاصات دقيقة وعميقة",
    body: "نحوّل المعرفة الموثوقة إلى خلاصات واضحة تحفظ الجوهر، وتزيل الحشو، وتُبرز ما يهم صانع القرار.",
  },
  {
    title: "حوّل وقتك إلى قرارات أفضل",
    body: "اقرأ ما تحتاجه في دقائق بدل ساعات، وانتقل من الفهم إلى التطبيق بخطوات عملية قابلة للتنفيذ.",
  },
];

export function Hero() {
  const common = { alt: "", sizes: "(max-width: 1120px) 100vw, 1120px", priority: true };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: "/home/hero-banner.webp", width: 1672, height: 941 });
  const {
    props: { srcSet: mobileSrcSet, ...mobileImg },
  } = getImageProps({ ...common, src: "/home/hero-mobile-art.webp", width: 1122, height: 1402 });

  return (
    <section className="home-hero" aria-labelledby="hero-title">
      <h1 className="home-hero-h1" id="hero-title">
        استخرج أفضل الأفكار القيادية في <span className="home-accent">١٥ دقيقة</span> فقط
      </h1>
      <picture>
        <source media="(min-width: 600px)" srcSet={desktopSrcSet} width={1672} height={941} />
        <img {...mobileImg} srcSet={mobileSrcSet} alt="" />
      </picture>
      <ul className="home-m-list">
        {points.map((point) => (
          <li key={point.title}>
            <h2 className="home-m-list-title">{point.title}</h2>
            <p className="home-m-list-body">{point.body}</p>
          </li>
        ))}
      </ul>
      <div className="home-hero-cta">
        <a href="#latest" className="btn btn-brand">استكشف الملخصات</a>
      </div>
    </section>
  );
}
