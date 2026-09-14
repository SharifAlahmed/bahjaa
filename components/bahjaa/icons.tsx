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
