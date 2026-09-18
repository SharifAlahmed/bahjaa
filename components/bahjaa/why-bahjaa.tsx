// components/bahjaa/why-bahjaa.tsx — أربع فوائد موجزة، لا فقرات طويلة.
// نفس أيقونات رحلة المعرفة حيث يصحّ المعنى — نظام أيقونات واحد متّسق للصفحة كلها.
import { ProductivityIcon, UnderstandIcon, ApplyIcon, BusinessIcon } from './icons'

const REASONS = [
  { n: '١', icon: ProductivityIcon, title: 'وقت أقل', text: 'الوصول إلى جوهر المعرفة دون استهلاك ساعات طويلة.' },
  { n: '٢', icon: UnderstandIcon,   title: 'فهم أعمق', text: 'تنظيم الأفكار بطريقة تساعدك على رؤية الصورة كاملة.' },
  { n: '٣', icon: ApplyIcon,        title: 'تطبيق عملي', text: 'أفكار تتحول إلى خطوات وخطط تنفّذها فعلاً.' },
  { n: '٤', icon: BusinessIcon,     title: 'أثر قابل للقياس', text: 'المعرفة لا تنتهي عند القراءة؛ تتابعها بعدها.' },
] as const

export function WhyBahjaa() {
  return (
    <section className="wrap section-block" aria-labelledby="why-title">
      <p className="eyebrow">لماذا بهجة</p>
      <h2 className="h-sec" id="why-title" style={{ marginTop: 14, marginBottom: 40 }}>لماذا بهجة؟</h2>
      <div className="why-grid">
        {REASONS.map((r) => {
          const Icon = r.icon
          return (
            <article className="why-item" key={r.n}>
              <span className="why-icon"><Icon width={24} height={24} /></span>
              <div className="why-num">{r.n}</div>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
