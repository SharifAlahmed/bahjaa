// lib/seal.ts — خَتْم بهجة التوليدي.
//
// شكل نجمي مشتقّ من معرّف الكتاب (slug) وحده: نفس الكتاب ينتج نفس الخَتْم دائماً،
// وكتابان مختلفان لا يتشابهان. لا صور، لا تراخيص، لا اعتماد على الحرف الأول.
//
// ⚠️ هذا الملف هو المصدر الوحيد للحقيقة. scripts/generate-covers.mjs يحمل نسخة
// مطابقة لأنه سكربت Node مستقل — أي تعديل هنا يُنسخ هناك.

/** بصمة FNV-1a ثابتة عبر البيئات */
export function sealHash(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const pick = (h: number, shift: number, n: number) => ((h >>> shift) & 0xff) % n;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

export type Seal = {
  /** مسار النجمة داخل viewBox "-74 -74 148 148" */
  d: string;
  /** نصف قطر الدائرة الداخلية */
  inner: number;
  /** عدد الرؤوس — للتوثيق والاختبار */
  points: number;
};

export function seal(slug: string): Seal {
  const h = sealHash(slug);
  const N = 9 + pick(h, 0, 4) * 2; // ٩ · ١١ · ١٣ · ١٥ — فردي دائماً
  let step = 3 + pick(h, 8, Math.floor(N / 2) - 2);
  while (gcd(step, N) !== 1) step++; // يمنع انغلاق النجمة على مضلّع بسيط
  const R = 58;

  let d = "";
  for (let i = 0, seen = 0; seen < N; seen++, i = (i + step) % N) {
    const a = (i * 2 * Math.PI) / N - Math.PI / 2;
    d += (seen === 0 ? "M" : "L") +
      (R * Math.cos(a)).toFixed(1) + " " + (R * Math.sin(a)).toFixed(1) + " ";
  }
  return { d: d + "Z", inner: 20 + pick(h, 16, 14), points: N };
}
