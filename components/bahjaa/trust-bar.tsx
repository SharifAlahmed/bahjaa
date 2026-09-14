// components/bahjaa/trust-bar.tsx — حقائق منتج فقط. ممنوع اختلاق أرقام أو شهادات.
import { FreeIcon, NoCardIcon, MailIcon } from './icons'

export function TrustBar() {
  return (
    <ul className="trust" aria-label="حقائق البدء">
      <li className="t-item"><FreeIcon width={20} height={20} />أول ٤ أقسام من كل ملخص متاحة مجاناً</li>
      <li className="t-item"><NoCardIcon width={20} height={20} />لا بطاقة دفع مطلوبة للبدء</li>
      <li className="t-item"><MailIcon width={20} height={20} />رمز دخول آمن يصل إلى بريدك</li>
    </ul>
  )
}
