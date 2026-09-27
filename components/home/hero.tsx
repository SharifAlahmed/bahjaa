import Image from "next/image";

/* الهيرو صورة واحدة بعرض الصفحة تحت الترويسة؛ العنوان داخلها، فيُكرَّر لقارئ الشاشة في h1 مخفي */
export function Hero() {
  return (
    <section className="home-hero" aria-labelledby="hero-title">
      <h1 className="sr-only" id="hero-title">
        استخرج أفضل الأفكار القيادية في ١٥ دقيقة فقط
      </h1>
      <Image
        src="/home/hero-banner.webp"
        alt=""
        width={1672}
        height={941}
        priority
        sizes="100vw"
      />
    </section>
  );
}
