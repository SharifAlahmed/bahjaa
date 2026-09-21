// components/bahjaa/promo-banner.tsx
// البانر الترويجي: «امتلك خلاصة الفكر الريادي في ١٥ دقيقة فقط»
// يُوضع في page.tsx بعد <KnowledgeJourney /> مباشرة.
import Link from 'next/link'
import Image from 'next/image'
import type { SVGProps } from 'react'

// ── أيقونات مضمّنة ──────────────────────────────────────────────────
const base = {
  width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.6,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
}

const BooksIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const LightbulbIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
  </svg>
)

const ClockIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

// ── بيانات الميزات ──────────────────────────────────────────────────
const FEATURES = [
  {
    Icon: BooksIcon,
    title: 'خلاصات مختارة بعناية',
    desc: 'نراجع أفضل الكتب والمقالات ومصادر المعرفة لمساعدتك على تنمية فكرك وزيادة إنتاجيتك.',
  },
  {
    Icon: LightbulbIcon,
    title: 'مؤلفون وخبراء عالميون',
    desc: 'نقدّم لك خلاصات لأفضل الكتب من كبار المفكرين والرواد مثل جيم كولينز، ستيفن كوفي، وبيتر دراكر.',
  },
  {
    Icon: ClockIcon,
    title: 'وفّر الوقت والجهد',
    desc: 'استفد من الخلاصة المركّزة لتتعلم أسرع، وتطبّق أفضل الأفكار في عملك وحياتك.',
  },
]

// ── المكوّن الرئيسي ─────────────────────────────────────────────────
export function PromoBanner() {
  return (
    <section className="promo-banner" aria-labelledby="pb-title">
      <div className="wrap section-block">

        {/* العنوان */}
        <p className="eyebrow pb-eyebrow">لماذا بهجة؟</p>
        <h2 className="h-sec pb-title" id="pb-title">
          امتلك خلاصة الفكر الريادي في ١٥ دقيقة فقط
        </h2>

        <div className="pb-grid">

          {/* الميزات الثلاث */}
          <ul className="pb-features" role="list">
            {FEATURES.map(({ Icon, title, desc }) => (
              <li key={title} className="pb-feature">
                <span className="pb-icon">
                  <Icon />
                </span>
                <div className="pb-feature-text">
                  <h3 className="pb-feature-title">{title}</h3>
                  <p className="pb-feature-desc">{desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* الصورة الفعلية للكتاب */}
          <div className="pb-visual">
            <div className="pb-img-wrap">
              <Image
                src="/images/good-to-great-cover.png"
                alt="ملخص بهجة لكتاب من جيد إلى عظيم — جيم كولينز"
                width={520}
                height={420}
                className="pb-book-img"
                priority
              />
            </div>
          </div>

        </div>

        {/* الزر */}
        <div className="pb-actions">
          <Link href="#latest-summaries" className="btn btn-primary">
            استكشف الملخصات
          </Link>
        </div>

      </div>
    </section>
  )
}
