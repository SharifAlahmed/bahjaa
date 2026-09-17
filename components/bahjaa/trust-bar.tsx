// components/bahjaa/trust-bar.tsx — شريط الحقائق تحت الهيرو.
//
// دُمج فيه «شريط القيمة» الذي كان داخل الهيرو: كانا يكرّران «٤ أقسام مجاناً»،
// وكانا عائلة تخطيط واحدة تتكرّر في قسمين متتاليين.
// الأرقام كلها ثابتة في النموذج العشاري — لا عدد يتغيّر من كتاب لآخر.
export function TrustBar() {
  const facts = [
    ["١٠", "أقسام تعيد بناء الكتاب كاملاً"],
    ["٤", "منها مفتوحة بلا تسجيل ولا بطاقة"],
    ["١", "خطوة تنفّذها الليلة قبل النوم"],
  ] as const

  return (
    <ul className="facts-strip" aria-label="ما يحتويه كل ملخص">
      {facts.map(([n, t]) => (
        <li className="fact" key={n}>
          <span className="fact-num">{n}</span>
          <span className="fact-txt">{t}</span>
        </li>
      ))}
    </ul>
  )
}
