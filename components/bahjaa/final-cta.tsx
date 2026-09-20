// components/bahjaa/final-cta.tsx — الإغلاق القوي قبل التذييل.
//
// نسيج بهجة البصري يظهر هنا للمرة الثانية والأخيرة — يُغلق الرحلة
// التي بدأت في الهيرو. تباين بصري قوي على خلفية فاتحة — لا لوحة داكنة ثالثة.
import Link from 'next/link'
import { MotifThread } from './motif'

export function FinalCTA() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <div className="wrap" style={{ textAlign: 'center' }}>
        <MotifThread className="fc-motif" />
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
