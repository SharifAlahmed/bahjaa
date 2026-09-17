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
  className?: string;
};

export function Cover({ title, slug, category, categoryLabel, className = "" }: Props) {
  const { field, accent } = categoryVars(category);
  return (
    <div
      className={`cover ${className}`}
      style={
        {
          ["--cat" as string]: field,
          ["--cat-accent" as string]: accent,
        } as React.CSSProperties
      }
    >
      <CoverSeal slug={slug} />
      <div className="cover-foot">
        <div className="cover-rule" />
        <span className={`cover-title ${coverTitleClass(title)}`}>{title}</span>
        <span className="cover-label">بهجة · {categoryLabel}</span>
      </div>
    </div>
  );
}
