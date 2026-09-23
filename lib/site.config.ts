// lib/site.config.ts — إعدادات الموقع الثابتة
// عدّل contact.email عند حصولك على البريد الرسمي.
export const SITE = {
  name:   "بهجة",
  url:    "https://bahjaa.com",
  contact: {
    email: "hello@bahjaa.com",  // ← عدّل هنا
  },
} as const;

/** يحوّل رقماً إلى أرقام عربية هندية (٠١٢٣...) */
export function toArabicNumerals(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);
}

/** دقيقة/دقيقتان/٣–١٠ دقائق/١١+ دقيقة */
export function pluralMinutes(n: number): string {
  const a = toArabicNumerals(n);
  if (n === 1)  return `${a} دقيقة`;
  if (n === 2)  return `دقيقتان`;
  if (n <= 10)  return `${a} دقائق`;
  return        `${a} دقيقة`;
}
