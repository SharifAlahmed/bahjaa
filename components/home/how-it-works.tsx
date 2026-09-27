import Image from "next/image";

/* إنفوغرافيك «كيف تعمل بهجة؟» — العنوان داخل الصورة، فيُكرَّر لقارئ الشاشة */
export function HowItWorks() {
  return (
    <section className="home-how" aria-labelledby="how-title">
      <div className="wrap">
        <h2 className="sr-only" id="how-title">كيف تعمل بهجة؟</h2>
        <div className="home-why-media">
          <Image
            src="/home/how-it-works.webp"
            alt=""
            width={1672}
            height={941}
            sizes="(max-width: 1120px) 100vw, 1080px"
          />
        </div>
      </div>
    </section>
  );
}
