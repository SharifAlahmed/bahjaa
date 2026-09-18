// components/bahjaa/audience-section.tsx — قسم الإثبات (Proof)، بلا أرقام مختلَقة.
//
// الأرقام الحقيقية اليوم (عدد الملخصات، عدد المستخدمين) صغيرة جداً لتُعرض
// كدليل ثقة. البديل الصادق: من يجد بهجة مفيدة — لا رقم واحد مخترع هنا.
import { LeadershipIcon, EntrepreneurshipIcon, TeamsIcon, UnderstandIcon } from './icons'

const AUDIENCE = [
  { icon: LeadershipIcon,       title: 'القادة والمديرون', text: 'قرارات أوضح في وقت أقصر، مبنية على فهم لا انطباع.' },
  { icon: EntrepreneurshipIcon, title: 'روّاد الأعمال', text: 'أفكار مجرّبة تُختصر إلى خطوة تُطبَّق هذا الأسبوع.' },
  { icon: TeamsIcon,            title: 'المدرّبون والمستشارون', text: 'مادة جاهزة تُبنى عليها جلسة أو نقاش فريق.' },
  { icon: UnderstandIcon,       title: 'القارئ الطموح', text: 'يريد الفكرة الجوهرية، لا 300 صفحة، ولا يريد أن يفوّت العمق.' },
] as const

export function AudienceSection() {
  return (
    <section className="wrap section-block" aria-labelledby="audience-title">
      <p className="eyebrow">لمن بهجة</p>
      <h2 className="h-sec" id="audience-title" style={{ marginTop: 14, marginBottom: 40 }}>
        من يجد في بهجة ما يبحث عنه
      </h2>
      <div className="audience-grid">
        {AUDIENCE.map((a) => {
          const Icon = a.icon
          return (
            <article className="audience-item" key={a.title}>
              <span className="audience-icon"><Icon width={22} height={22} /></span>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
