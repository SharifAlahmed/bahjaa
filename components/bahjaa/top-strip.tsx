// components/bahjaa/top-strip.tsx — شريط رفيع فوق الترويسة.
//
// ثلاث حقائق فقط، كلها صادقة على كل ملخص وثابتة في النموذج العشاري.
// ممنوع أي رقم لا نملكه: لا «آلاف القرّاء» ولا «١٠٠٪ آمن».
import { FreeIcon, NoCardIcon, MailIcon } from './icons'

const FACTS = [
  ['free', 'أول ٤ أقسام مفتوحة مجاناً'],
  ['card', 'بلا بطاقة ولا كلمة مرور'],
  ['mail', 'رمز دخول يصل بريدك'],
] as const

const ICON = { free: FreeIcon, card: NoCardIcon, mail: MailIcon }

export function TopStrip() {
  return (
    <div className="top-strip">
      <div className="wrap">
        <ul>
          {FACTS.map(([k, text], i) => {
            const Icon = ICON[k]
            return (
              // على الجوال تظهر الأولى وحدها — الثلاثة تتكدّس وتخنق الصفحة
              <li key={k} className={i > 0 ? 'hide-sm' : undefined}>
                <Icon width={14} height={14} />
                {text}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
