// components/SummaryCard.tsx — بطاقة ملخص بغلاف ثلاثي الأبعاد
// يحلّ محلّ components/bahjaa/book-card.tsx في الشبكة الجديدة.
import Link from "next/link";
import type { ReactNode } from "react";

import { BookCover } from "./BookCover";
import { readingLabel, toArabicDigits } from "./bahjaa/format";
import type { CategorySlug } from "./bahjaa/cover";

type Props = {
  id: string;
  slug: string;
  title: string;
  author?: string;
  category?: CategorySlug;
  categoryLabel?: string;
  readingMinutes?: number;
  coverUrl?: string | null;
  priority?: boolean;
  publishedAt?: string | null;
  rating?: number | null;
  promise?: string;
  featured?: boolean;
  bookmarkSlot?: ReactNode;
};

export function SummaryCard({
  id: _id,
  slug,
  title,
  author,
  category = "leadership",
  categoryLabel = "بهجة",
  readingMinutes = 8,
  coverUrl,
  priority,
  publishedAt: _publishedAt,
  rating,
  promise,
  featured: _featured,
  bookmarkSlot,
}: Props) {
  return (
    <article className="sc">
      {/* رابط شفاف يغطي البطاقة — تحت أزرار الحفظ */}
      <Link
        className="sc-link"
        href={`/s/${slug}`}
        aria-label={`اقرأ ملخص: ${title}`}
      />

      <div className="sc-cover-wrap" aria-hidden="true">
        <BookCover
          title={title}
          coverUrl={coverUrl}
          size="card"
          priority={priority}
          slug={slug}
          category={category}
          categoryLabel={categoryLabel}
        />
      </div>

      <h3 className="h-sub sc-title" aria-hidden="true">{title}</h3>
      {author && <p className="author sc-author" aria-hidden="true">{author}</p>}
      <p className="meta sc-facts" aria-hidden="true">
        {categoryLabel} · {readingLabel(readingMinutes)}
      </p>
      {typeof rating === "number" && (
        <p className="rating-line" aria-hidden="true">
          <span className="rating-num">{toArabicDigits(rating)}</span>
          <span className="rating-of">من ١٠</span>
          <span className="rating-lbl">تقييم بهجة للقيمة</span>
        </p>
      )}
      {promise && (
        <p className="promise sc-promise" aria-hidden="true">{promise}</p>
      )}

      {bookmarkSlot}
    </article>
  );
}
