// بانر الصفحة الرئيسية (bh_site_content، المفتاح home_banner): بطاقة واحدة بين قسم الافتتاح والملخصات.
// لا يظهر إلا إذا كان منشوراً و enabled = true. التعطيل لا يمسح المحتوى.
// منطق خالص بلا Supabase ليُختبر مباشرة.
import { isSafeHref, siteMediaPrefix } from "./home-hero";

export const HOME_BANNER_KEY = "home_banner";
export const HOME_BANNER_MEDIA_FOLDER = "site/home-banner";

export type HomeBanner = {
  enabled: boolean;
  title: string;
  text: string;
  imageUrl: string | null;
  imageAlt: string;
  ctaLabel: string;
  ctaUrl: string;
};

export const EMPTY_HOME_BANNER: HomeBanner = {
  enabled: false, title: "", text: "", imageUrl: null, imageAlt: "", ctaLabel: "", ctaUrl: "",
};

type TextKey = "title" | "text" | "imageAlt" | "ctaLabel" | "ctaUrl";
export const HOME_BANNER_LIMITS: Record<TextKey, number> = { title: 120, text: 400, imageAlt: 200, ctaLabel: 40, ctaUrl: 300 };

export type BannerIssue = { field: keyof HomeBanner; message: string };

const VERSIONED_FILE = /^[0-9]{13}-[a-z0-9]{8}\.(jpg|png|webp)$/;

/** مسار الكائن داخل bh-covers إن كان الرابط صورة بانر مرفوعة بالمسار المعتمد، وإلا null */
export function ownBannerImagePath(url: unknown, supabaseUrl: string): string | null {
  if (typeof url !== "string") return null;
  const prefix = siteMediaPrefix(supabaseUrl, HOME_BANNER_MEDIA_FOLDER);
  if (!url.startsWith(prefix)) return null;
  const file = url.slice(prefix.length);
  return VERSIONED_FILE.test(file) ? `${HOME_BANNER_MEDIA_FOLDER}/${file}` : null;
}

const LABEL: Record<TextKey, string> = {
  title: "العنوان", text: "النص", imageAlt: "النص البديل للصورة", ctaLabel: "نص الزر", ctaUrl: "رابط الزر",
};

/** تحقق كامل (الواجهة والخادم). عند التعطيل يُسمح بعنوان ونص فارغين — ويبقى المحتوى المحفوظ كما هو. */
export function validateHomeBanner(
  input: unknown, supabaseUrl: string,
): { ok: true; value: HomeBanner } | { ok: false; issues: BannerIssue[] } {
  const issues: BannerIssue[] = [];
  const src = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  for (const k of Object.keys(src)) if (!(k in EMPTY_HOME_BANNER)) issues.push({ field: "title", message: `حقل غير معروف: ${k}` });
  if (typeof src.enabled !== "boolean") issues.push({ field: "enabled", message: "حالة الإظهار غير صالحة." });
  const enabled = src.enabled === true;
  const str = (k: TextKey) => (typeof src[k] === "string" ? (src[k] as string).trim() : "");
  const out: HomeBanner = {
    enabled, title: str("title"), text: str("text"), imageUrl: null,
    imageAlt: str("imageAlt"), ctaLabel: str("ctaLabel"), ctaUrl: str("ctaUrl"),
  };
  for (const k of Object.keys(HOME_BANNER_LIMITS) as TextKey[]) {
    if (src[k] !== undefined && typeof src[k] !== "string") issues.push({ field: k, message: `«${LABEL[k]}» غير صالح.` });
    if (out[k].length > HOME_BANNER_LIMITS[k]) issues.push({ field: k, message: `«${LABEL[k]}» أطول من الحد المسموح.` });
  }
  if (enabled && !out.title) issues.push({ field: "title", message: "العنوان مطلوب عند إظهار البانر." });
  if (enabled && !out.text) issues.push({ field: "text", message: "النص مطلوب عند إظهار البانر." });

  const img = src.imageUrl;
  if (img === null || img === undefined || img === "") out.imageUrl = null;
  else if (ownBannerImagePath(img, supabaseUrl)) out.imageUrl = img as string;
  else issues.push({ field: "imageUrl", message: "الصورة مرفوضة: يجب أن تكون صورة مرفوعة من محرّر البانر." });
  if (out.imageUrl && !out.imageAlt) issues.push({ field: "imageAlt", message: "النص البديل مطلوب عند وجود صورة." });

  if (!!out.ctaLabel !== !!out.ctaUrl)
    issues.push({ field: out.ctaLabel ? "ctaUrl" : "ctaLabel", message: "نص الزر ورابطه يُكتبان معاً أو يُتركان فارغين معاً." });
  if (out.ctaUrl && !isSafeHref(out.ctaUrl))
    issues.push({ field: "ctaUrl", message: "الرابط غير مقبول: استخدم مساراً يبدأ بـ / أو قسماً مثل #latest أو رابط https://" });

  return issues.length ? { ok: false, issues } : { ok: true, value: out };
}

/** ما يُعرض للعموم: البانر فقط إن كان صالحاً ومفعّلاً، وإلا null (لا شيء يُرسم إطلاقاً) */
export function publicHomeBanner(value: unknown, supabaseUrl: string): HomeBanner | null {
  if (value === null || value === undefined) return null;
  const res = validateHomeBanner(value, supabaseUrl);
  return res.ok && res.value.enabled ? res.value : null;
}

/** القيمة المحفوظة كما تُحمَّل في المحرّر (حتى لو معطّلة)؛ غير الصالح يعود فارغاً معطّلاً */
export function editorHomeBanner(value: unknown, supabaseUrl: string): HomeBanner {
  if (value === null || value === undefined) return EMPTY_HOME_BANNER;
  const res = validateHomeBanner(value, supabaseUrl);
  return res.ok ? res.value : EMPTY_HOME_BANNER;
}
