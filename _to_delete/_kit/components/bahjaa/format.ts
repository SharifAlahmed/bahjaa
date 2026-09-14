// components/bahjaa/format.ts — كل رقم يراه القارئ بالأرقام العربية الهندية

const AR = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

/** يحوّل الأرقام اللاتينية داخل أي نص إلى عربية هندية. لا تستخدمه مع قيم ألوان أو كود. */
export function toArabicDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => AR[Number(d)])
}

/** صيغة عربية سليمة لزمن القراءة: دقيقة / دقيقتان / ٣ دقائق / ١١ دقيقة */
export function readingLabel(minutes: number): string {
  if (minutes === 1) return 'قراءة دقيقة واحدة'
  if (minutes === 2) return 'قراءة دقيقتين'
  const n = toArabicDigits(minutes)
  return minutes >= 3 && minutes <= 10 ? `قراءة ${n} دقائق` : `قراءة ${n} دقيقة`
}

/** صيغة عربية سليمة لعدد الملخصات داخل قسم */
export function countLabel(n: number): string {
  if (n === 0) return 'لا ملخصات بعد'
  if (n === 1) return 'ملخص واحد'
  if (n === 2) return 'ملخصان'
  return n <= 10 ? `${toArabicDigits(n)} ملخصات` : `${toArabicDigits(n)} ملخصاً`
}
