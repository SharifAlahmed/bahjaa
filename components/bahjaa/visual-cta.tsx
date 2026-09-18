// components/bahjaa/visual-cta.tsx — البانر التحريري: اللحظة البصرية الكبرى الثانية بعد الهيرو.
//
// ليس لوحة داكنة ثانية: الهيرو وحده يحمل اللوحة الداكنة في هذه الصفحة.
// تركيب من عمودين — النص والنداء يميناً (أول عنصر في DOM يقع يميناً
// تلقائياً مع RTL)، ونسيج بهجة البصري يساراً — بدل عمود واحد مركزي.
import Link from 'next/link'
import { MotifThread } from './motif'

export function VisualCTA() {
  return (
    <section className="editorial-banner" aria-labelledby="banner-title">
      <div className="wrap eb-grid">
        <div className="eb-copy">
          <p className="eyebrow">فلسفة بهجة</p>
          <p className="quote" id="banner-title" style={{ marginTop: 18 }}>
            المعرفة التي تقرؤها اليوم يجب أن تغيّر ما تفعله غدًا.
          </p>
          <p className="read col" style={{ marginTop: 18 }}>
            اكتشف محتوى يساعدك على الانتقال من الفكرة إلى التطبيق.
          </p>
          <div className="actions" style={{ marginTop: 32, justifyContent: 'flex-start' }}>
            <Link href="#latest-summaries" className="btn btn-primary">استكشف بهجة</Link>
          </div>
        </div>
        <MotifThread className="eb-motif" />
      </div>
    </section>
  )
}
