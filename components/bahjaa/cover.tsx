// components/bahjaa/cover.tsx — الغلاف التوليدي: لا صور كتب ولا تراخيص.
//
// المرحلة ٥ — «الخَتْم»: الحقل من أحد سطحَي اللوحة الداكنين، والتمييز بين الكتب
// يحمله خَتْم نجمي مولّد من معرّف الكتاب، لا لون كامل ولا حرف أول.
// القيم كلها من app/globals.css — لا قيمة hex في هذا الملف.

import Image from "next/image";
import { seal } from "@/lib/seal";
import type { ReactNode } from "react";

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

  // ── غلاف مصوَّر: نسبة ٢:٣ كأغلفة الكتب المطبوعة،
  //    والخَتْم ينكمش إلى علامة ركن بدل أن يملأ الحقل.
  if (coverUrl) {
    return (
      <div className={`cover cover-photo ${className}`} style={style}>
        <Image
          src={coverUrl}
          alt={`غلاف كتاب ${title}`}
          fill
          sizes="(max-width:600px) 45vw, (max-width:1000px) 30vw, 260px"
          className="cover-img"
          priority={priority}
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


/** رمز هندسي لكل تصنيف — SVG ثابت لا يُقلب مع dir، اتجاهه مقصود عربياً.
 *  الخط الرئيسي ذهبي معتم (currentColor يُضبط على الحاوية .bk-gen-icon).
 *  العناصر الثانوية بـstrokeOpacity أقل.
 *  vector-effect:non-scaling-stroke يُطبَّق عبر CSS في globals.css. */
export function CategoryIcon({ category }: { category: CategorySlug | string }) {
  const shape = icons[category as CategorySlug] ?? icons._default;
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
    >
      {shape}
    </svg>
  );
}

/* ── الأشكال لكل تصنيف ─────────────────────────────── */
const icons: Record<CategorySlug | "_default", ReactNode> = {
  /** القيادة: ثلاثة أشعة من نقطة واحدة في أسفل اليمين */
  leadership: (
    <>
      <circle cx="76" cy="80" r="3.5" fill="currentColor" />
      <line x1="76" y1="80" x2="14" y2="14"
            stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="76" y1="80" x2="28" y2="8"
            stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.4} strokeLinecap="round" />
      <line x1="76" y1="80" x2="8" y2="32"
            stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.4} strokeLinecap="round" />
    </>
  ),

  /** ريادة الأعمال: نقطة انطلاق وقوس هادئ صاعد */
  entrepreneurship: (
    <>
      <circle cx="76" cy="80" r="3.5" fill="currentColor" />
      <path d="M 76 80 C 70 52 38 22 18 16"
            stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx="18" cy="16" r="3.5" fill="currentColor" />
    </>
  ),

  /** الإنتاجية: درجات متصاعدة بزوايا قائمة */
  productivity: (
    <path d="M 78 80 L 54 80 L 54 56 L 30 56 L 30 32 L 12 32 L 12 14"
          stroke="currentColor" strokeWidth={1.5}
          strokeLinecap="round" strokeLinejoin="round" />
  ),

  /** الاستراتيجية: جذع رئيسي وثلاثة فروع قصيرة على جانب واحد */
  strategy: (
    <>
      <line x1="76" y1="80" x2="22" y2="18"
            stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="62" y1="65" x2="74" y2="53"
            stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.65} strokeLinecap="round" />
      <line x1="48" y1="47" x2="60" y2="35"
            stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.65} strokeLinecap="round" />
      <line x1="34" y1="29" x2="46" y2="17"
            stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.65} strokeLinecap="round" />
    </>
  ),

  /** الفرق: ثلاث دوائر متداخلة تتصاعد على القطر */
  teams: (
    <>
      <circle cx="62" cy="64" r="20"
              stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.35} />
      <circle cx="50" cy="50" r="20"
              stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.65} />
      <circle cx="38" cy="36" r="20"
              stroke="currentColor" strokeWidth={1.5} />
    </>
  ),

  /** الأعمال: أربع نقاط على القطر موصولة بشبكة خطوط */
  business: (
    <>
      <line x1="72" y1="76" x2="40" y2="44"
            stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.3} />
      <line x1="56" y1="60" x2="24" y2="28"
            stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.3} />
      <line x1="72" y1="76" x2="56" y2="60"
            stroke="currentColor" strokeWidth={1.5} />
      <line x1="56" y1="60" x2="40" y2="44"
            stroke="currentColor" strokeWidth={1.5} />
      <line x1="40" y1="44" x2="24" y2="28"
            stroke="currentColor" strokeWidth={1.5} />
      <circle cx="72" cy="76" r="3.5" fill="currentColor" />
      <circle cx="56" cy="60" r="3.5" fill="currentColor" />
      <circle cx="40" cy="44" r="3.5" fill="currentColor" />
      <circle cx="24" cy="28" r="3.5" fill="currentColor" />
    </>
  ),

  /** افتراضي: زاوية قائمة بسيطة */
  _default: (
    <path d="M 74 74 L 20 74 L 20 20"
          stroke="currentColor" strokeWidth={1.5}
          strokeLinecap="round" strokeLinejoin="round" />
  ),
};
