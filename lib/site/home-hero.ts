// Hero الصفحة الرئيسية كمحتوى يديره الأدمن (bh_site_content، المفتاح home_hero).
// منطق خالص بلا اعتماد على Supabase أو المتصفح ليُختبر مباشرة.
// القيم الافتراضية هي نص الـHero الحالي حرفياً: تُعرض ما دام لا يوجد إعداد منشور، وتملأ المحرّر أول مرة.

export const HOME_HERO_KEY = "home_hero";
export const HOME_HERO_MEDIA_FOLDER = "site/home-hero";
export const HOME_HERO_DEFAULT_IMAGE = "/join/good-to-great-books.jpg";

export type HomeHero = {
  eyebrow: string;
  title_line1: string;
  title_line2: string;
  intro: string;
  primary_label: string;
  primary_href: string;
  secondary_label: string;
  secondary_href: string;
  /** سطر المؤسس: الجزء البارز ثم بقية السطر (كما يُعرض الآن) */
  founder_lead: string;
  founder_text: string;
  /** null = صورة الـHero الحالية من المستودع */
  image_url: string | null;
  image_alt: string;
};

export const DEFAULT_HOME_HERO: HomeHero = {
  eyebrow: "منصة عربية للمعرفة التطبيقية",
  title_line1: "معرفة تستحق وقتك.",
  title_line2: "تساعدك على فهم أعمق واتخاذ قرار أفضل.",
  intro:
    "نختار أهم الكتب والأفكار ودراسات الحالة، ونقدّمها بطريقة تساعدك على فهم جوهرها وتحويلها إلى قرارات وخطوات قابلة للتطبيق.",
  primary_label: "استكشف الملخصات",
  primary_href: "#latest",
  secondary_label: "اكتشف منهج بهجة",
  secondary_href: "#how",
  founder_lead: "أسّسها شريف الأحمد",
  founder_text: "بخبرة عملية مع قادة وفرق ومؤسسات، ومنهج يستفيد من التفكير الاستراتيجي ومهارات الكوتشينغ المهني.",
  image_url: null,
  image_alt: "كتاب «من جيد إلى عظيم» وملخص بهجة كمثال على تحويل المعرفة إلى خلاصة عملية",
};

type TextField = Exclude<keyof HomeHero, "image_url">;

export const HOME_HERO_FIELDS: { id: TextField; label: string; max: number; multiline?: boolean; dir?: "ltr"; hint?: string }[] = [
  { id: "eyebrow", label: "السطر التمهيدي", max: 80 },
  { id: "title_line1", label: "العنوان — السطر الأول", max: 80 },
  { id: "title_line2", label: "العنوان — السطر الثاني", max: 120 },
  { id: "intro", label: "الفقرة التعريفية", max: 400, multiline: true },
  { id: "primary_label", label: "الزر الرئيسي — النص", max: 40 },
  { id: "primary_href", label: "الزر الرئيسي — الرابط", max: 300, dir: "ltr", hint: "مسار داخلي يبدأ بـ / ، أو قسم في الصفحة نفسها مثل #latest ، أو رابط https://" },
  { id: "secondary_label", label: "الزر الثانوي — النص", max: 40 },
  { id: "secondary_href", label: "الزر الثانوي — الرابط", max: 300, dir: "ltr", hint: "مسار داخلي يبدأ بـ / ، أو قسم في الصفحة نفسها مثل #how ، أو رابط https://" },
  { id: "founder_lead", label: "سطر المؤسس — الجزء البارز", max: 80 },
  { id: "founder_text", label: "سطر المؤسس — بقية السطر", max: 300, multiline: true },
  { id: "image_alt", label: "النص البديل للصورة", max: 200, hint: "وصف الصورة لقارئات الشاشة ومحركات البحث." },
];

export type HeroIssue = { field: keyof HomeHero; message: string };

const CONTROL = /[\u0000-\u001f\u007f\s\\]/;

/** رابط آمن: مسار داخلي (/...) أو قسم في الصفحة نفسها (#...) أو https:// صالح. لا أي بروتوكول آخر. */
export function isSafeHref(href: unknown): boolean {
  if (typeof href !== "string" || href.length === 0 || href.length > 300) return false;
  if (CONTROL.test(href)) return false;
  if (/^#[A-Za-z][A-Za-z0-9_-]*$/.test(href)) return true;
  if (href.startsWith("/")) return !href.startsWith("//");
  if (!href.startsWith("https://")) return false;
  try {
    const u = new URL(href);
    return u.protocol === "https:" && !!u.hostname && !u.username && !u.password;
  } catch {
    return false;
  }
}

const VERSIONED_FILE = /^[0-9]{13}-[a-z0-9]{8}\.(jpg|png|webp)$/;

export function siteMediaPrefix(supabaseUrl: string, folder = HOME_HERO_MEDIA_FOLDER): string {
  return `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/bh-covers/${folder}/`;
}

/** يعيد مسار الكائن داخل bh-covers إن كان الرابط صورة Hero مرفوعة بالمسار المعتمد، وإلا null */
export function ownHeroImagePath(url: unknown, supabaseUrl: string): string | null {
  if (typeof url !== "string") return null;
  const prefix = siteMediaPrefix(supabaseUrl);
  if (!url.startsWith(prefix)) return null;
  const file = url.slice(prefix.length);
  return VERSIONED_FILE.test(file) ? `${HOME_HERO_MEDIA_FOLDER}/${file}` : null;
}

/**
 * تحقق كامل من قيمة home_hero (يُستخدم في الواجهة وعلى الخادم).
 * يعيد القيم بعد التشذيب، أو قائمة الأخطاء.
 */
export function validateHomeHero(
  input: unknown, supabaseUrl: string,
): { ok: true; value: HomeHero } | { ok: false; issues: HeroIssue[] } {
  const issues: HeroIssue[] = [];
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out = {} as HomeHero;
  for (const f of HOME_HERO_FIELDS) {
    const raw = src[f.id];
    const v = typeof raw === "string" ? raw.trim() : "";
    if (!v) issues.push({ field: f.id, message: `«${f.label}» مطلوب.` });
    else if (v.length > f.max) issues.push({ field: f.id, message: `«${f.label}» أطول من الحد المسموح.` });
    out[f.id] = v;
  }
  for (const f of ["primary_href", "secondary_href"] as const) {
    if (out[f] && !isSafeHref(out[f]))
      issues.push({ field: f, message: "الرابط غير مقبول: استخدم مساراً يبدأ بـ / أو قسماً مثل #latest أو رابط https://" });
  }
  const img = src.image_url;
  if (img === null || img === undefined || img === "") out.image_url = null;
  else if (ownHeroImagePath(img, supabaseUrl)) out.image_url = img as string;
  else {
    out.image_url = null;
    issues.push({ field: "image_url", message: "الصورة مرفوضة: يجب أن تكون صورة مرفوعة من محرّر الـHero." });
  }
  for (const k of Object.keys(src)) {
    if (!(k in DEFAULT_HOME_HERO)) issues.push({ field: "eyebrow", message: `حقل غير معروف: ${k}` });
  }
  return issues.length ? { ok: false, issues } : { ok: true, value: out };
}

/** القيمة المنشورة كما تُعرض للعموم: إن كانت ناقصة أو غير صالحة لأي سبب نعرض الـHero الافتراضي كاملاً */
export function publicHomeHero(value: unknown, supabaseUrl: string): HomeHero {
  if (value === null || value === undefined) return DEFAULT_HOME_HERO;
  const res = validateHomeHero(value, supabaseUrl);
  return res.ok ? res.value : DEFAULT_HOME_HERO;
}

export function heroImageSrc(hero: HomeHero): string {
  return hero.image_url ?? HOME_HERO_DEFAULT_IMAGE;
}
