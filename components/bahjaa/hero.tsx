// components/bahjaa/hero.tsx — الهيرو هو اللوحة الداكنة الوحيدة في الصفحة الرئيسية
import Link from 'next/link'

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap">
        <p className="eyebrow">منصة بهجة للمعرفة التطبيقية</p>
        <h1 className="h-hero" id="hero-title">نحوّل المعرفة إلى أثر</h1>
        <p className="lede">
          ملخصات عملية تعيد بناء أهم الكتب للقائد المشغول: الفكرة المحورية، والمحاور، والاقتباسات،
          والفخاخ التي يجب الانتباه لها.
        </p>
        <p className="promise">اقرأ الخلاصة في دقائق، ثم اخرج بخطوة واحدة تطبّقها اليوم.</p>

        {/* زر أخضر واحد في هذه المنطقة */}
        <div className="actions">
          <Link href="#latest-summaries" className="btn btn-primary">استكشف الملخصات</Link>
          <Link href="#inside-summary" className="btn btn-ghost-light">كيف تعمل بهجة؟</Link>
        </div>

        <ul className="value-strip" aria-label="ما يحتويه كل ملخص">
          <li className="vs-item"><div className="vs-num">٧</div><div className="vs-txt">محاور تغطي جوهر الكتاب</div></li>
          <li className="vs-item"><div className="vs-num">٥</div><div className="vs-txt">اقتباسات مع تفسير بهجة</div></li>
          <li className="vs-item"><div className="vs-num">١</div><div className="vs-txt">خطوة عملية تنفّذها اليوم</div></li>
        </ul>
      </div>
    </section>
  )
}
