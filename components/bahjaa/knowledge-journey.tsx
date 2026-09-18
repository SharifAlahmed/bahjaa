// components/bahjaa/knowledge-journey.tsx — «الكتاب بداية الرحلة، وليس نهايتها»
//
// المكوّن التوقيعي: أربع مراحل متصلة بخط تقدّم واحد، لا أربع بطاقات متطابقة.
// نفس نظام الأيقونات الخطي (شبكة ٢٤، سماكة ١٫٦). «قِس» يعيد استخدام
// BusinessIcon — نفس المعنى بالضبط، بلا حاجة لأيقونة رابعة جديدة.
import { UnderstandIcon, ExtractIcon, ApplyIcon, BusinessIcon } from './icons'

const STAGES = [
  { n: '١', key: 'understand', icon: UnderstandIcon, title: 'افهم', text: 'أهم الأفكار دون الضياع في التفاصيل.' },
  { n: '٢', key: 'extract',    icon: ExtractIcon,    title: 'استخرج', text: 'ما يرتبط بعملك وقراراتك تحديداً.' },
  { n: '٣', key: 'apply',      icon: ApplyIcon,      title: 'طبّق', text: 'حوّل الفكرة إلى خطوة أو خطة تنفّذها.' },
  { n: '٤', key: 'measure',    icon: BusinessIcon,   title: 'قِس', text: 'تابع ما تغيّر، وما يحتاج إلى تحسين.' },
] as const

export function KnowledgeJourney() {
  return (
    <section className="wrap section-block" id="knowledge-journey" aria-labelledby="journey-title">
      <p className="eyebrow">رحلة المعرفة في بهجة</p>
      <h2 className="h-sec" id="journey-title" style={{ marginTop: 14 }}>
        الكتاب بداية الرحلة، وليس نهايتها
      </h2>
      <p className="read col" style={{ marginTop: 18, marginBottom: 48 }}>
        في بهجة لا نكتفي باختصار المعرفة؛ نعيد تنظيمها لتصبح قابلة للفهم والتطبيق.
      </p>

      <ol className="journey" aria-label="أربع مراحل: افهم، استخرج، طبّق، قِس">
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
    </section>
  )
}
