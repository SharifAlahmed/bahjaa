// components/bahjaa/motif.tsx — نسيج بهجة البصري: من التشتّت إلى الأثر.
//
// عنصر توقيعي واحد يُستخدم في موضعين فقط — البانر التحريري والإغلاق القوي —
// ولا يتكرر أكثر من ذلك حتى لا يفقد تميّزه (قاعدة: لا زخرفة بلا معنى مفاهيمي).
// نقاط متناثرة (معرفة مبعثرة) تتقارب تدريجياً على خط واحد (تنظيم)
// وتنتهي بعقدة ممتلئة (أثر). زخرفي بحت، بلا نص — مخفيّ عن قارئ الشاشة.
// اللون يُورَّث بالكامل (currentColor) — لا قيمة hex هنا.
import type { SVGProps } from 'react'

export function MotifThread(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 44" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M14 28 Q 48 12 80 26 T 148 20 L 224 20"
        stroke="currentColor" strokeOpacity=".38" strokeWidth="1.2"
        strokeDasharray="1 7" strokeLinecap="round"
      />
      <path d="M148 20 L 224 20" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="14" cy="28" r="3" fill="currentColor" fillOpacity=".35" />
      <circle cx="80" cy="26" r="3.4" fill="currentColor" fillOpacity=".5" />
      <circle cx="148" cy="20" r="4" fill="currentColor" fillOpacity=".8" />
      <circle cx="224" cy="20" r="7" fill="currentColor" />
      <circle cx="224" cy="20" r="11" fill="none" stroke="currentColor" strokeOpacity=".28" strokeWidth="1" />
    </svg>
  )
}
