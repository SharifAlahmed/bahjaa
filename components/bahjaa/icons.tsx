// components/bahjaa/icons.tsx — أيقونات خطّية فقط، شبكة 24، سماكة 1.6
// ممنوع الأيقونات الممتلئة والإيموجي. اللون يُورَّث (currentColor) ويُضبط من الأب بـ brass.
import type { SVGProps } from 'react'

const base = {
  width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.6,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const LockIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="4" y="10.5" width="16" height="10.5" />
    <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    <path d="M12 14.5v2.5" />
  </svg>
)

/** سهم التقدّم في RTL: يشير لليسار */
export const ArrowIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M14 6 8 12l6 6" /></svg>
)

export const BookmarkIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M6 4h12v16l-6-4.5L6 20z" /></svg>
)

export const ShareIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="17" cy="6" r="2.6" /><circle cx="7" cy="12" r="2.6" /><circle cx="17" cy="18" r="2.6" />
    <path d="m9.3 10.8 5.4-3.2M9.3 13.2l5.4 3.2" />
  </svg>
)

export const FreeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M4 5.5h9a3 3 0 0 1 3 3V19" /><path d="M20 5.5h-4" /><path d="M4 5.5V19h9" /></svg>
)

export const NoCardIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><rect x="3" y="6" width="18" height="12" /><path d="M3 10h18" /><path d="M5.5 19.5 19 5" /></svg>
)

export const MailIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><rect x="3" y="5.5" width="18" height="13" /><path d="m3 7 9 6 9-6" /></svg>
)

/* ── أيقونات الأقسام الستة — خطّية، شبكة ٢٤، سماكة ١٫٦ ────────
   لا مكتبة خارجية ولا إيموجي. اللون يُورَّث من الأب. */

/** القيادة — بوصلة: الاتجاه لا السرعة */
export const LeadershipIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5.5-5.5 2 2-5.5z" /></svg>
)

/** ريادة الأعمال — بذرة تنبت */
export const EntrepreneurshipIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M12 21v-8" /><path d="M12 13c0-3 2-5 5-5 0 3-2 5-5 5z" /><path d="M12 15c0-2.5-1.7-4.5-4.5-4.5 0 2.5 1.7 4.5 4.5 4.5z" /></svg>
)

/** الإنتاجية — ساعة */
export const ProductivityIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
)

/** الاستراتيجية — رقعة شطرنج بحجر */
export const StrategyIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M4 20h16" /><path d="M9 20V9l3-5 3 5v11" /><path d="M9 13h6" /></svg>
)

/** الفرق والثقافة — ثلاثة أشخاص */
export const TeamsIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="3" /><path d="M6.5 20a5.5 5.5 0 0 1 11 0" /><path d="M3 17a4 4 0 0 1 3.2-3.9" /><path d="M21 17a4 4 0 0 0-3.2-3.9" /></svg>
)

/** المال والأعمال — رسم بياني صاعد */
export const BusinessIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M4 19h16" /><path d="M7 19v-5" /><path d="M12 19V8" /><path d="M17 19v-8" /></svg>
)
