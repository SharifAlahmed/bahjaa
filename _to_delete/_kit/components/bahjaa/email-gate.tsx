'use client'
// components/bahjaa/email-gate.tsx — بوابة فتح بقية الملخص.
//
// ⚠️ هذا المكوّن يعرض الواجهة فقط. منطق الإرسال يُمرَّر من الخارج عبر onSubmit
// حتى لا يُكرَّر منطق OTP الموجود أصلاً في login-form.tsx.
//
// مثال التوصيل بـ Supabase (نفس ما يعمل اليوم في صفحة الدخول):
//
//   <EmailGate onSubmit={async (email) => {
//     const supabase = createClient()
//     const { error } = await supabase.auth.signInWithOtp({ email })
//     if (error) return { ok: false, message: 'تعذّر الإرسال. حاول بعد قليل.' }
//     return { ok: true, message: 'أرسلنا رمزاً من ٨ أرقام إلى بريدك.' }
//   }} />
//
// وبعد التحقق من الرمز استخدم window.location.assign('/s/<slug>') — تحميل كامل
// يمسح أي نسخة مخزّنة، وهو ما يمنع عودة خطأ حالة الجلسة.

import { useState, type FormEvent } from 'react'
import { LockIcon } from './icons'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Result = { ok: boolean; message: string }

export function EmailGate({
  onSubmit,
  haveCodeHref = '/login',
}: {
  onSubmit?: (email: string) => Promise<Result>
  haveCodeHref?: string
}) {
  const [status, setStatus] = useState<Result | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get('email')?.toString().trim() ?? ''

    if (!EMAIL_RE.test(email)) {
      setInvalid(true)
      setStatus({ ok: false, message: 'يرجى إدخال بريد إلكتروني صحيح.' })
      return
    }

    setInvalid(false)
    setPending(true)
    try {
      const result = onSubmit
        ? await onSubmit(email)
        : { ok: true, message: 'تم إرسال رمز تجريبي إلى بريدك الإلكتروني.' }
      setStatus(result)
    } catch {
      setStatus({ ok: false, message: 'حدث خطأ غير متوقع. حاول مرة أخرى.' })
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="gate" id="email-gate" aria-labelledby="gate-title">
      <p className="lock-line">
        <LockIcon />
        <span className="eyebrow">أكمل بقية تجربة الملخص</span>
      </p>

      <h3 id="gate-title">أكمل من حيث بدأت</h3>
      <p className="explain incard">
        افتح بقية المحاور، الاقتباسات المفسّرة، وخطوة التطبيق لهذا الكتاب — مع كل ملخصات بهجة.
      </p>

      <div className="unlocks">
        <div><div className="u-num">٧</div><div className="u-txt">محاور تغطي الكتاب كاملاً، لكل محور جوهره وفخّه الشائع</div></div>
        <div><div className="u-num">٥</div><div className="u-txt">اقتباسات من النص الأصلي بتفسير فريق بهجة</div></div>
        <div><div className="u-num">٤</div><div className="u-txt">خطوات في مسار التطبيق، تبدأ بخمس دقائق الليلة</div></div>
      </div>

      <form className="field" onSubmit={handleSubmit} noValidate>
        <label htmlFor="gate-email">بريدك الإلكتروني</label>
        <div className="field-row">
          <input
            id="gate-email" name="email" type="email" inputMode="email" autoComplete="email"
            required placeholder="name@example.com"
            aria-invalid={invalid || undefined}
            aria-describedby="gate-helper gate-status"
          />
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? 'جارٍ الإرسال…' : 'أرسل رمز الدخول'}
          </button>
        </div>
        <p className="meta helper" id="gate-helper">
          أدخل بريدك، وسنرسل لك رمز دخول من ٨ أرقام. لا بطاقة ولا كلمة مرور.
        </p>
        <p className="status" id="gate-status" role="status" aria-live="polite"
           data-state={status ? (status.ok ? 'ok' : 'err') : undefined}>
          {status?.message ?? ''}
        </p>
        <p className="have-code"><a className="textlink" href={haveCodeHref}>لدي رمز بالفعل</a></p>
      </form>
    </section>
  )
}
