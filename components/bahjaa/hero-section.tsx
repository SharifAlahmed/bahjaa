// components/bahjaa/hero-section.tsx — هيرو الصفحة الرئيسية
//
// تخطيط الصورة المرجعية (RTL): لوحة النص الكريمية في البداية (يمين) بقصّة مائلة،
// وصورة المشهد في النهاية (يسار). الصورة الحقيقية تُوضع في public/hero/
// باسم hero-workspace.(webp|jpg|png) وتُكتشف تلقائياً؛ وقبل وجودها يظهر
// حقل أخضر داكن من نظام الألوان — لا صورة بديلة وهمية.
import { existsSync } from 'node:fs'
import path from 'node:path'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowIcon } from './icons'

const HERO_IMAGE_EXTENSIONS = ['webp', 'jpg', 'png'] as const

function findHeroImage(): string | null {
  for (const extension of HERO_IMAGE_EXTENSIONS) {
    const fileName = `hero-workspace.${extension}`
    if (existsSync(path.join(process.cwd(), 'public', 'hero', fileName))) {
      return `/hero/${fileName}`
    }
  }
  return null
}

export function HeroSection() {
  const heroImage = findHeroImage()

  return (
    <section className="hp" aria-labelledby="hero-title">
      <div className={heroImage ? 'hp-scene' : 'hp-scene hp-scene-empty'} aria-hidden="true">
        {heroImage && (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="hp-scene-img"
          />
        )}
      </div>

      <div className="hp-panel">
        <div className="hp-copy">
          <p className="eyebrow">منصة بهجة للمعرفة التطبيقية</p>
          <h1 className="h-hero hp-title" id="hero-title">نحوّل المعرفة إلى أثر</h1>
          <p className="lede hp-lede">
            نأخذ أهم ما في الكتب والمحتوى المعرفي، ونحوّله إلى فهم واضح وأفكار عملية
            وخطوات قابلة للتطبيق.
          </p>
          <div className="hp-actions">
            <Link href="#latest-summaries" className="btn btn-brand">
              <ArrowIcon width={16} height={16} />
              استكشف بهجة
            </Link>
            <Link href="#knowledge-journey" className="btn btn-secondary">كيف تعمل بهجة؟</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
