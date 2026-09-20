'use client'
// components/bahjaa/knowledge-journey.tsx — «الكتاب بداية الرحلة، وليس نهايتها»
//
// المكوّن التوقيعي: أربع مراحل متصلة بخط تقدّم يتحوّل إلى أخضر بهجة كلما
// دخلت مرحلة نطاق الرؤية أثناء التمرير — كشف خفيف عبر IntersectionObserver.
// إضافي بحت: بلا دعم المتصفح أو قبل تشغيل JS تبقى كل مرحلة ظاهرة بالكامل
// فوراً (سمة data-reveal لا تُضبط إلا بعد تأكّد الدعم)، ويُحترم
// prefers-reduced-motion عبر القاعدة العامة في globals.css التي تُلغي
// كل transition/animation موقعياً.
import { useEffect, useRef, useState } from 'react'
import { UnderstandIcon, ExtractIcon, ApplyIcon, BusinessIcon } from './icons'

const STAGES = [
  { n: '١', key: 'understand', icon: UnderstandIcon, title: 'افهم', text: 'أهم الأفكار دون الضياع في التفاصيل.' },
  { n: '٢', key: 'extract',    icon: ExtractIcon,    title: 'استخرج', text: 'ما يرتبط بعملك وقراراتك تحديداً.' },
  { n: '٣', key: 'apply',      icon: ApplyIcon,      title: 'طبّق', text: 'حوّل الفكرة إلى خطوة أو خطة تنفّذها.' },
  { n: '٤', key: 'measure',    icon: BusinessIcon,   title: 'قِس', text: 'تابع ما تغيّر، وما يحتاج إلى تحسين.' },
] as const

export function KnowledgeJourney() {
  const listRef = useRef<HTMLOListElement>(null)
  const [reveal, setReveal] = useState(false)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !listRef.current) return
    setReveal(true)
    const stages = listRef.current.querySelectorAll('.journey-stage')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { threshold: 0.35 }
    )
    stages.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section className="tint-band bh-anchor" id="knowledge-journey" aria-labelledby="journey-title">
      <div className="wrap section-block">
        <p className="eyebrow">رحلة المعرفة في بهجة</p>
        <h2 className="h-sec" id="journey-title" style={{ marginTop: 14 }}>
          الكتاب بداية الرحلة، وليس نهايتها
        </h2>
        <p className="read col" style={{ marginTop: 18, marginBottom: 40 }}>
          في بهجة لا نكتفي باختصار المعرفة؛ نعيد تنظيمها لتصبح قابلة للفهم والتطبيق.
        </p>

        <ol
          ref={listRef}
          className="journey"
          data-reveal={reveal || undefined}
          aria-label="أربع مراحل: افهم، استخرج، طبّق، قِس"
        >
          {STAGES.map((s, i) => {
            const Icon = s.icon
            return (
              <li className="journey-stage" key={s.key}>
                <div className="journey-node">
                  <span className="journey-num">{s.n}</span>
                  <span className="journey-icon"><Icon width={26} height={26} /></span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                {i < STAGES.length - 1 ? <span className="journey-link" aria-hidden="true" /> : null}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
