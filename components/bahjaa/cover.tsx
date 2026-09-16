// components/bahjaa/cover.tsx — الغلاف التوليدي: لا صور كتب ولا تراخيص.
//
// قرار 16 سبتمبر: لا لون كامل لكل قسم. الحقل من أحد سطحَي اللوحة الداكنين،
// والتمييز بين الأقسام يحمله سطر التصنيف واللكنة. القيم كلها من app/globals.css
// — لا قيمة hex في هذا الملف.
//
// ⚠️ المرحلة 5 تعيد تصميم بنية الغلاف. هذه المرحلة تنقل الألوان إلى الرموز فقط.

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

/** 46px لكلمتين · 30px لعنوان طويل — التدرّج على عدد الحروف لا الكلمات */
export function coverTitleClass(title: string): "lg" | "md" | "sm" {
  const len = title.trim().length;
  if (len <= 14) return "lg";
  if (len <= 20) return "md";
  return "sm";
}

type Props = {
  title: string;
  category: CategorySlug;
  categoryLabel: string;
  className?: string;
};

export function Cover({ title, category, categoryLabel, className = "" }: Props) {
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
      <div className="cover-rule" />
      <span className={`cover-title ${coverTitleClass(title)}`}>{title}</span>
      <span className="cover-label">بهجة · {categoryLabel}</span>
    </div>
  );
}
