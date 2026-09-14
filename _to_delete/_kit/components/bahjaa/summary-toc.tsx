// components/bahjaa/summary-toc.tsx — فهرس «في هذا الملخص»
// مفتوح على سطح المكتب، مطوي على الجوال (CSS + سمة open الافتراضية).
import { LockIcon } from './icons'

export type TocItem = { label: string; href: string; num?: string; locked?: boolean }

const DEFAULT_ITEMS: TocItem[] = [
  { num: '١', label: 'ملخص الـ٣٠ ثانية',      href: '#sec-brief' },
  { num: '٢', label: 'لحظة التعرّف',          href: '#sec-recognition' },
  { num: '٣', label: 'لماذا هذا الكتاب الآن؟', href: '#sec-why-now' },
  { num: '٤', label: 'الفكرة المحورية',        href: '#sec-core-idea' },
  { num: '٥', label: 'المحاور الكاملة',        href: '#sec-pillars', locked: true },
  {            label: 'الاقتباسات',            href: '#email-gate',  locked: true },
  {            label: 'خطوة اليوم',            href: '#today-action' },
]

export function SummaryToc({ items = DEFAULT_ITEMS }: { items?: TocItem[] }) {
  return (
    <details className="toc" open>
      <summary>في هذا الملخص</summary>
      <ul className="toc-list">
        {items.map((item) => (
          <li key={item.href + item.label}>
            <a href={item.href}>
              <span className="n" aria-hidden="true">{item.num ?? '·'}</span>
              {item.label}
              {item.locked && <span className="lockmark" aria-hidden="true"><LockIcon width={14} height={14} /></span>}
            </a>
          </li>
        ))}
      </ul>
      <p className="meta" style={{ marginTop: 16 }}>
        الأقسام ١–٤ مفتوحة بلا تسجيل. بقية الملخص — المحاور السبعة والاقتباسات المفسّرة وخطوة التطبيق — تُفتح ببريدك.
      </p>
    </details>
  )
}
