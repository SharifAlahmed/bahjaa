// components/bahjaa/summary-section.tsx — قسم واحد من الملخص مع الرقم المتدلّي في الهامش
import type { ReactNode } from 'react'

const AR = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩']
const ar = (n: number) => String(n).replace(/[0-9]/g, (d) => AR[Number(d)])

export function SummarySection({
  num, id, eyebrow, title, children,
}: {
  num: number
  id: string
  eyebrow: string
  title?: string
  children: ReactNode
}) {
  return (
    <div className="sec" id={id}>
      <div className="sec-num" aria-hidden="true">{ar(num)}</div>
      <div className="sec-body">
        <p className="eyebrow">{eyebrow}</p>
        {title ? <h2 className="h-sec">{title}</h2> : null}
        {children}
      </div>
    </div>
  )
}

/** غلاف المحتوى المقفول: تلاشي ١٥٠ بكسل فوق فقرة بشفافية ٠٫٣، ثم البوابة. */
export function LockedTeaser({ children }: { children: ReactNode }) {
  return (
    <div className="locked">
      <div className="teaser" aria-hidden="true">{children}</div>
      <div className="fade" />
    </div>
  )
}
