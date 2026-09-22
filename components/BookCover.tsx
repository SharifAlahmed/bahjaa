// components/BookCover.tsx — غلاف كتاب ثلاثي الأبعاد (خاصية CSS فقط)
// ثلاثة أحجام: card · hero · lg. احتياط خطّي حين لا يوجد coverUrl.
// كل ألوان الغلاف الاحتياطي مشتقة من رموز @theme — لا hex هنا.
import Image from "next/image";

import { CoverSeal, coverTitleClass, categoryVars } from "./bahjaa/cover";
import type { CategorySlug } from "./bahjaa/cover";

export type BookCoverSize = "card" | "hero" | "lg";

type Props = {
  title: string;
  author?: string | null;
  coverUrl?: string | null;
  size?: BookCoverSize;
  priority?: boolean;
  slug?: string;
  category?: CategorySlug;
  categoryLabel?: string;
};

/** أحجام كل صنف — تُضبط بـ CSS عبر --bk-w و --bk-h */
const SIZE_CLASS: Record<BookCoverSize, string> = {
  card: "bk bk-card",
  hero: "bk bk-hero",
  lg:   "bk bk-lg",
};

export function BookCover({
  title,
  coverUrl,
  size = "card",
  priority = false,
  slug = "x",
  category = "leadership",
  categoryLabel = "بهجة",
}: Props) {
  const { field, accent } = categoryVars(category);
  const catStyle = {
    ["--cat" as string]: field,
    ["--cat-accent" as string]: accent,
  } as React.CSSProperties;

  return (
    <div className={SIZE_CLASS[size]} style={catStyle}>
      {/* الغطاء الداخلي — يحتوي الصورة أو الاحتياط */}
      <div className="bk-inner">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={`غلاف كتاب ${title}`}
            fill
            sizes="(max-width:640px) 50vw, (max-width:960px) 34vw, 280px"
            className="bk-img"
            priority={priority}
          />
        ) : (
          <div className="bk-fallback">
            <CoverSeal slug={slug} />
            <div className="bk-foot">
              <div className="bk-rule" />
              <span className={`bk-title ${coverTitleClass(title)}`}>{title}</span>
              <span className="bk-label">بهجة · {categoryLabel}</span>
            </div>
          </div>
        )}

        {/* بريق قطري — يعطي إحساساً بعمق السطح اللامع */}
        <span className="bk-shine" aria-hidden="true" />
      </div>

      {/* شريط أوراق الكتاب على الجانب الخارجي */}
      <span className="bk-pages" aria-hidden="true" />
    </div>
  );
}
