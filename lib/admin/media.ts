// قواعد عامة لرفع صور الأدمن (أغلفة الآن؛ Hero/Banner لاحقاً بقواعد مختلفة).
// منطق خالص بلا اعتماد على المتصفح أو Supabase ليُختبر مباشرة.
import { toArabicNumerals } from "@/lib/site.config";

export type ImageRules = {
  /** أنواع MIME المسموحة */
  mimeTypes: readonly string[];
  maxBytes: number;
  minWidth: number;
  minHeight: number;
  /** نسبة العرض إلى الارتفاع المتوقعة: خارجها تحذير لا منع */
  aspect?: { min: number; max: number; hint: string };
};

export const MIME_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const megabytes = (bytes: number) => toArabicNumerals(String(Math.round((bytes / (1024 * 1024)) * 10) / 10));

/** فحص النوع والحجم قبل قراءة الصورة. يعيد رسالة الخطأ أو null */
export function validateImageFile(file: { type: string; size: number }, rules: ImageRules): string | null {
  if (!rules.mimeTypes.includes(file.type) || !MIME_EXTENSION[file.type])
    return "نوع الملف غير مدعوم. المسموح: JPG أو PNG أو WebP.";
  if (file.size === 0) return "الملف فارغ.";
  if (file.size > rules.maxBytes)
    return `حجم الملف ${megabytes(file.size)} ميغابايت، والحد الأقصى ${megabytes(rules.maxBytes)} ميغابايت.`;
  return null;
}

/** فحص الأبعاد بعد قراءة الصورة: الأبعاد الصغيرة تمنع، والنسبة البعيدة تحذّر فقط */
export function validateImageDimensions(
  width: number, height: number, rules: ImageRules,
): { error: string | null; warning: string | null } {
  if (!(width > 0 && height > 0)) return { error: "تعذّرت قراءة الصورة. جرّب ملفاً آخر.", warning: null };
  if (width < rules.minWidth || height < rules.minHeight)
    return {
      error: `الصورة صغيرة: العرض ${toArabicNumerals(String(width))} والارتفاع ${toArabicNumerals(String(height))} بكسل. الحد الأدنى: العرض ${toArabicNumerals(String(rules.minWidth))} والارتفاع ${toArabicNumerals(String(rules.minHeight))} بكسل.`,
      warning: null,
    };
  const ratio = width / height;
  if (rules.aspect && (ratio < rules.aspect.min || ratio > rules.aspect.max))
    return { error: null, warning: rules.aspect.hint };
  return { error: null, warning: null };
}

/** اسم ملف فريد لا يتكرر: <الوقت بالميلي ثانية>-<٨ خانات عشوائية>.<الامتداد> */
export function uniqueObjectName(mimeType: string, now: number, random: string): string {
  const ext = MIME_EXTENSION[mimeType];
  if (!ext) throw new Error("unsupported mime type");
  if (!/^[a-z0-9]{8}$/.test(random)) throw new Error("bad random suffix");
  return `${String(now).padStart(13, "0")}-${random}.${ext}`;
}

/** ٨ خانات [a-z0-9] من مصدر عشوائي آمن */
export function randomSuffix(bytes: Uint8Array): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}
