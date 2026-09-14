// app/fonts.ts — خطوط بهجة عبر next/font (تُستضاف ذاتياً، بلا طلب لجوجل وقت التشغيل)
import { Amiri, IBM_Plex_Sans_Arabic, Tajawal } from 'next/font/google'

export const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
  fallback: ['Times New Roman', 'serif'],
})

export const plexAr = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-plex-ar',
  display: 'swap',
  fallback: ['Segoe UI', 'Tahoma', 'sans-serif'],
})

// تجوال للشعار وحده — يُستخدم فقط إن لم يُستعمل ملف الشعار الصوري
export const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['700'],
  variable: '--font-tajawal',
  display: 'swap',
  fallback: ['sans-serif'],
})
