import Image from "next/image";
import type { HomeBanner as HomeBannerValue } from "@/lib/site/home-banner";

/* بانر الصفحة الرئيسية: بطاقة تحريرية هادئة بين قسم الافتتاح والملخصات.
   لا يُرسم شيء إطلاقاً (لا غلاف ولا مسافة) ما لم يكن البانر منشوراً ومفعّلاً. */
export function HomeBanner({ banner }: { banner: HomeBannerValue | null }) {
  if (!banner || !banner.enabled) return null;
  return (
    <section className="hm-banner" aria-labelledby="home-banner-title">
      <div className="wrap">
        <div className="hm-banner-card" data-has-image={banner.imageUrl ? "true" : undefined}>
          {banner.imageUrl ? (
            <figure className="hm-banner-media">
              <Image src={banner.imageUrl} alt={banner.imageAlt} fill sizes="(max-width: 719px) 100vw, 460px" />
            </figure>
          ) : null}
          <div className="hm-banner-body">
            <h2 className="hm-banner-title" id="home-banner-title">{banner.title}</h2>
            <p className="hm-banner-text">{banner.text}</p>
            {banner.ctaLabel && banner.ctaUrl ? (
              <p className="hm-banner-cta">
                <a href={banner.ctaUrl} className="btn btn-brand">{banner.ctaLabel}</a>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
