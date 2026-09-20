// components/bahjaa/cover.tsx — الغلاف التوليدي: لا صور كتب ولا تراخيص.
//
// المرحلة ٥ — «الخَتْم»: الحقل من أحد سطحَي اللوحة الداكنين، والتمييز بين الكتب
// يحمله خَتْم نجمي مولّد من معرّف الكتاب، لا لون كامل ولا حرف أول.
// القيم كلها من app/globals.css — لا قيمة hex في هذا الملف.

import { seal } from "@/lib/seal";

export const CATEGORY_SLUGS = [
  "leadership",
  "entrepreneurship",
  "productivity",
  "strategy",
  "teams",
  "business",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

/** يقرأ حقل القسم ولكنته من رموز CSS — المصدر app/globals.css */
export function categoryVars(category: CategorySlug) {
  return {
    field: `var(--cat-${category}-field)`,
    accent: `var(--cat-${category}-accent)`,
  };
}

/** التدرّج على عدد الحروف لا الكلمات — العربية تتفاوت كثيراً في طول الكلمة */
export function coverTitleClass(title: string): "lg" | "md" | "sm" {
  const len = title.trim().length;
  if (len <= 14) return "lg";
  if (len <= 20) return "md";
  return "sm";
}

/** الخَتْم — زخرفة بحتة، مخفيّ عن قارئ الشاشة */
export function CoverSeal({ slug }: { slug: string }) {
  const s = seal(slug);
  return (
    <svg
      className="cover-seal"
      viewBox="-74 -74 148 148"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle r="68" stroke="currentColor" strokeOpacity=".28" strokeWidth="1" />
      <path d={s.d} stroke="currentColor" strokeWidth="1.15" strokeLinejoin="round" />
      <circle r={s.inner} stroke="currentColor" strokeOpacity=".55" strokeWidth="1" />
    </svg>
  );
}

type Props = {
  title: string;
  slug: string;
  category: CategorySlug;
  categoryLabel: string;
  /** غلاف الكتاب الحقيقي. حين يغيب يعود الغلاف المولّد كما هو. */
  coverUrl?: string | null;
  /** أولوية التحميل — للغلاف الأول في الصفحة فقط */
  priority?: boolean;
  className?: string;
};

/** أغلفة محلية عالية الدقة تُستخدم عندما لا يرسل الملخص cover_url. */
function localCoverFor(slug: string, title: string): string | null {
  const key = `${slug} ${title}`.toLowerCase();
  const covers: Record<string, string> = {
    "atomic-habits": "/covers/atomic-habits-realistic.png",
    "psychology-of-money": "/covers/psychology-money.png",
    "good-to-great": "/covers/good-to-great-realistic.png",
    "win-friends": "/covers/win-friends-realistic.png",
    "winning": "/covers/winning-realistic.png",
    "seven-habits": "/covers/seven-habits-realistic.png",
    "napoleon-hill": "/covers/napoleon-hill-realistic.png",
    "lean-startup": "/covers/flexible-company.png",
    "الشركة الناشئة": "/covers/flexible-company.png",
    "سيكولوجية المال": "/covers/psychology-money.png",
    "العادات السبع": "/covers/seven-habits-realistic.png",
    "العادات الذرية": "/covers/atomic-habits-realistic.png",
    "قواعد نابليون": "/covers/napoleon-hill-realistic.png",
    "تكسب الأصدقاء": "/covers/win-friends-realistic.png",
    "من جيد إلى عظيم": "/covers/good-to-great-realistic.png",
    "الفوز": "/covers/winning-realistic.png",
  };
  const exact = covers[key];
  if (exact) return exact;
  const match = Object.keys(covers).find((name) => key.includes(name));
  return match ? covers[match] : null;
}

export function Cover({
  title,
  slug,
  category,
  categoryLabel,
  coverUrl,
  priority = false,
  className = "",
}: Props) {
  const { field, accent } = categoryVars(category);
  const style = {
    ["--cat" as string]: field,
    ["--cat-accent" as string]: accent,
  } as React.CSSProperties;

  // الأصول المحلية الواقعية تتقدم دائمًا على روابط Supabase القديمة أو المعطلة.
  const resolvedCoverUrl = localCoverFor(slug, title) || coverUrl;

  // ── غلاف مصوَّر: نسبة ٢:٣ كأغلفة الكتب المطبوعة،
  //    والخَتْم ينكمش إلى علامة ركن بدل أن يملأ الحقل.
  if (resolvedCoverUrl) {
    return (
      <div className={`cover cover-photo ${className}`} style={style}>
        <img
          src={resolvedCoverUrl}
          alt={`غلاف كتاب ${title}`}
          className="cover-img"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
        <span className="cover-mark" aria-hidden="true">
          <CoverSeal slug={slug} />
        </span>
      </div>
    );
  }

  // ── الاحتياط: الغلاف المولّد، بلا تغيير عمّا كان
  return (
    <div className={`cover ${className}`} style={style}>
      <CoverSeal slug={slug} />
      <div className="cover-foot">
        <div className="cover-rule" />
        <span className={`cover-title ${coverTitleClass(title)}`}>{title}</span>
        <span className="cover-label">بهجة · {categoryLabel}</span>
      </div>
    </div>
  );
}
