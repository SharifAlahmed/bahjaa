// components/bahjaa/summary-toc.tsx — فهرس «في هذا الملخص»
//
// الأقسام العشرة كما هي في ملخص بهجة العشاري — لا تُضاف ولا تُدمج ولا يُعاد ترتيبها.
// المراسي تطابق id={`sec-${num}`} في components/section.tsx.
// ١–٤ مفتوحة للجميع · ٥–١٠ خلف البريد.

export type TocItem = { num: string; label: string; href: string; locked?: boolean }

const DEFAULT_ITEMS: TocItem[] = [
  { num: '١',  label: 'ملخص الـ٣٠ ثانية',       href: '#sec-1' },
  { num: '٢',  label: 'لحظة التعرّف',            href: '#sec-2' },
  { num: '٣',  label: 'لماذا هذا الكتاب الآن؟',  href: '#sec-3' },
  { num: '٤',  label: 'الفكرة المحورية',         href: '#sec-4' },
  { num: '٥',  label: 'المحاور الكاملة للكتاب',  href: '#sec-5',  locked: true },
  { num: '٦',  label: 'الاقتباسات الذهبية',      href: '#sec-6',  locked: true },
  { num: '٧',  label: 'مثال واقعي من بيئة الأعمال', href: '#sec-7',  locked: true },
  { num: '٨',  label: 'مسار التحويل',            href: '#sec-8',  locked: true },
  { num: '٩',  label: 'رؤية فريق بهجة النقدية',  href: '#sec-9',  locked: true },
  { num: '١٠', label: 'تقييم فريق بهجة',         href: '#sec-10', locked: true },
]

export function SummaryToc({ items = DEFAULT_ITEMS, locked = true }: { items?: TocItem[]; locked?: boolean }) {
  return (
    <details className="toc" open>
      <summary>في هذا الملخص</summary>
      <ul className="toc-list">
        {items.map((item) => {
          const shut = locked && item.locked
          // المقفول ليس رابطاً: لا هدف له في الصفحة، ولا يستقبل تركيز لوحة المفاتيح
          return (
            <li key={item.href}>
              {shut ? (
                <span className="toc-shut">
                  <span className="n" aria-hidden="true">{item.num}</span>
                  {item.label}
                  <span className="lockmark"><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="10.5" width="16" height="10.5" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /><path d="M12 14.5v2.5" /></svg><span className="sr-only">مقفول — يُفتح بالبريد</span></span>
                </span>
              ) : (
                <a href={item.href}>
                  <span className="n" aria-hidden="true">{item.num}</span>
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ul>
      <p className="meta" style={{ marginTop: 16 }}>
        {locked ? (
          <>
            الأقسام ١–٤ مفتوحة بلا تسجيل. بقية الملخص تُفتح ببريدك —{' '}
            <a href="#email-gate" className="textlink">افتحه الآن</a>.
          </>
        ) : (
          'الملخص مفتوح لك كاملاً — عشرة أقسام.'
        )}
      </p>
    </details>
  )
}
