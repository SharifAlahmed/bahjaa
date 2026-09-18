// components/bahjaa/final-cta.tsx — الإغلاق القوي قبل التذييل.
// تباين بصري قوي على خلفية فاتحة — لا لوحة داكنة ثالثة في الصفحة.
import Link from 'next/link'

export function FinalCTA() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <div className="wrap" style={{ textAlign: 'center' }}>
        <h2 className="h-sec" id="final-cta-title">لا تجعل المعرفة تتوقف عند القراءة</h2>
        <p className="read col" style={{ margin: '18px auto 0' }}>
          اكتشف المعرفة. افهمها. طبّقها. اصنع منها أثرًا.
        </p>
        <div className="actions" style={{ marginTop: 32, justifyContent: 'center' }}>
          <Link href="#latest-summaries" className="btn btn-primary">اكتشف بهجة</Link>
        </div>
      </div>
    </section>
  )
}
