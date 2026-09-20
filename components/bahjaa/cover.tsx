// components/bahjaa/cover.tsx — الغلاف التوليدي: لا صور كتب ولا تراخيص.
//
// المرحلة ٥ — «الخَتْم»: الحقل من أحد سطحَي اللوحة الداكنين، والتمييز بين الكتب
// يحمله خَتْم نجمي مولّد من معرّف الكتاب، لا لون كامل ولا حرف أول.
// القيم كلها من app/globals.css — لا قيمة hex في هذا الملف.

import Image from "next/image";
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
function localCoverFor(slug: string): string | null {
  const key = slug.toLowerCase();
  const covers: Record<string, string> = {
    "atomic-habits": "/covers/atomic-habits.png",
    "good-to-great": "/covers/good-to-great.png",
    "lean-startup": "/covers/lean-startup.png",
    "napoleon-hill": "/covers/napoleon-hill.png",
    "psychology-of-money": "/covers/psychology-of-money.png",
    "seven-habits": "/covers/seven-habits.png",
    "win-friends": "/covers/win-friends.png",
    "winning": "/covers/winning.png",
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

  const resolvedCoverUrl = coverUrl || localCoverFor(slug);

  // ── غلاف مصوَّر: نسبة ٢:٣ كأغلفة الكتب المطبوعة،
  //    والخَتْم ينكمش إلى علامة ركن بدل أن يملأ الحقل.
  if (resolvedCoverUrl) {
    return (
      <div className={`cover cover-photo ${className}`} style={style}>
        <Image
          src={resolvedCoverUrl}
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
