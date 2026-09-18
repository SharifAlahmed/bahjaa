// components/bahjaa/visual-cta.tsx — بانر بصري بعد شبكة المحتوى.
//
// ليس لوحة داكنة ثانية: الهيرو وحده يحمل اللوحة الداكنة في هذه الصفحة.
// الوزن البصري هنا يأتي من الطباعة والحدود اللونية لا من خلفية سوداء.
import Link from 'next/link'

export function VisualCTA() {
  return (
    <section className="editorial-banner" aria-labelledby="banner-title">
      <div className="wrap">
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
    </section>
  )
}
