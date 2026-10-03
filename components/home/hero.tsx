import Image from "next/image";
import { DEFAULT_HOME_HERO, heroImageSrc, type HomeHero } from "@/lib/site/home-hero";

/* القيم من home_hero المنشور (bh_site_content)، وإلا القيم الافتراضية — وهي نص الـHero السابق حرفياً.
   البنية والأصناف كما هي دون تغيير. */
export function Hero({ content = DEFAULT_HOME_HERO }: { content?: HomeHero }) {
  return (
    <section className="home-hero home-hero-v3" aria-labelledby="hero-title">
      <div className="wrap home-hero-grid">
        <div className="home-hero-copy">
          <p className="hm-eyebrow">{content.eyebrow}</p>

          <h1 className="home-hero-title" id="hero-title">
            <span>{content.title_line1}</span>
            <span>{content.title_line2}</span>
          </h1>

          <p className="home-hero-lede">
            {content.intro}
          </p>

          <div className="home-hero-actions">
            <a href={content.primary_href} className="btn btn-brand">{content.primary_label}</a>
            <a href={content.secondary_href} className="btn btn-ghost">{content.secondary_label}</a>
          </div>

          <p className="home-hero-authority">
            {/* نص واحد بعد العنصر البارز — لا عقدتان نصيتان متجاورتان، فيطابق الـHTML السابق حرفياً */}
            <strong>{content.founder_lead}</strong>{` — ${content.founder_text}`}
          </p>
        </div>

        <figure className="home-hero-visual">
          <Image
            src={heroImageSrc(content)}
            width={860}
            height={602}
            priority
            sizes="(max-width: 860px) 100vw, 520px"
            alt={content.image_alt}
          />
        </figure>
      </div>
    </section>
  );
}
