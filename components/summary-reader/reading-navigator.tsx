import { toArabicDigits } from "@/components/bahjaa/format";
import { IconLock } from "./icons";

/* الأقسام العشرة كما هي — لا تُضاف ولا تُدمج ولا يُعاد ترتيبها */
export const SECTION_NAMES = [
  "ملخص الـ٣٠ ثانية",
  "لحظة التعرّف",
  "لماذا هذا الكتاب الآن؟",
  "الفكرة المحورية",
  "المحاور الكاملة للكتاب",
  "الاقتباسات الذهبية",
  "مثال واقعي من بيئة الأعمال",
  "مسار التحويل",
  "رؤية فريق بهجة النقدية",
  "تقييم فريق بهجة",
] as const;

/** حالة كل قسم في المستكشف: رابط (معروض) · مقفول (٥–١٠ للزائر) · غائب (لا بيانات) */
export type NavState = "link" | "locked" | "absent";

function List({ states, idPrefix }: { states: NavState[]; idPrefix: string }) {
  return (
    <ol className="sr-nav-list">
      {SECTION_NAMES.map((name, i) => {
        const n = i + 1;
        const s = states[i];
        const num = <span className="sr-nav-n" aria-hidden="true">{toArabicDigits(n)}</span>;
        return (
          <li key={n} className={`sr-nav-item sr-nav-item--${s}`}>
            {s === "link" ? (
              <a href={`#sec-${n}`} data-sr-nav={n} id={`${idPrefix}-${n}`}>
                {num}
                <span className="sr-nav-label">{name}</span>
              </a>
            ) : (
              /* المقفول والغائب ليسا روابط: لا هدف لهما ولا يستقبلان تركيز لوحة المفاتيح */
              <span>
                {num}
                <span className="sr-nav-label">{name}</span>
                {s === "locked" ? (
                  <span className="sr-nav-lock">
                    <IconLock size={13} />
                    <span className="sr-only">مقفول — يُفتح بالبريد</span>
                  </span>
                ) : null}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* مستكشف القراءة: mode="rail" شريط لاصق بجانب عمود القراءة على سطح المكتب،
   وmode="mobile" قائمة <details> مطوية. يعمل كاملاً بلا JavaScript؛
   ReadingProgress (في العارض) تحسين تدريجي يبرز القسم الحالي فقط */
export function ReadingNavigator({
  states,
  locked,
  mode,
}: {
  states: NavState[];
  locked: boolean;
  mode: "rail" | "mobile";
}) {
  const shown = states.filter((s) => s === "link").length;
  if (mode === "rail") {
    return (
      <nav className="sr-rail" aria-label="أقسام الملخص">
        <p className="sr-rail-title">في هذا الملخص</p>
        <List states={states} idPrefix="sr-rail" />
        {locked ? (
          <p className="sr-rail-note">
            الأقسام ١–٤ مفتوحة. <a href="#email-gate">افتح البقية ببريدك</a>
          </p>
        ) : null}
      </nav>
    );
  }
  return (
    <details className="sr-nav-m">
      <summary>
        <span data-sr-current>في هذا الملخص · {toArabicDigits(shown)} من ١٠ أقسام</span>
      </summary>
      <nav aria-label="أقسام الملخص">
        <List states={states} idPrefix="sr-m" />
      </nav>
    </details>
  );
}
