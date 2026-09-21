// components/bahjaa/book-card.tsx — البطاقة مع دعم أزرار الحفظ
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Cover, type CategorySlug } from './cover'
import { ArrowIcon } from './icons'
import { readingLabel, toArabicDigits } from './format'

type Props = {
  id: string
  slug: string
  title: string
  author: string
  category: CategorySlug
  categoryLabel: string
  readingMinutes: number
  coverUrl?: string | null
  priority?: boolean
  publishedAt?: string | null
  rating?: number | null
  promise?: string
  featured?: boolean
  /** slot لأزرار الحفظ — يُمرَّر من الصفحة الأم كـ <BookmarkButtons /> */
  bookmarkSlot?: ReactNode
}

function isNew(publishedAt?: string | null): boolean {
  if (!publishedAt) return false
  const days = (Date.now() - new Date(publishedAt).getTime()) / 86_400_000
  return days >= 0 && days <= 21
}

export function BookCard({
  id: _id, slug, title, author, category, categoryLabel,
  readingMinutes, coverUrl, priority, publishedAt,
  rating, promise, featured, bookmarkSlot
}: Props) {
  const fresh = isNew(publishedAt)
  return (
    <article className="book-card">
      {/* رابط شفاف يغطي البطاقة كلها — يبقى تحت أزرار الحفظ */}
      <Link className="book-card-link" href={`/s/${slug}`} aria-label={`اقرأ ملخص: ${title}`} />

      <div className="cover-wrap" aria-hidden="true">
        <Cover
          title={title} slug={slug} category={category}
          categoryLabel={categoryLabel} coverUrl={coverUrl} priority={priority}
        />
        {fresh ? <span className="cover-badge">جديد</span> : null}
      </div>

      {featured ? <p className="eyebrow" style={{ marginTop: 22 }} aria-hidden="true">أحدث إضافة</p> : null}
      <h3 className="h-sub" aria-hidden="true">{title}</h3>
      {author ? <p className="author" aria-hidden="true">{author}</p> : null}
      <p className="meta facts" aria-hidden="true">{categoryLabel} · {readingLabel(readingMinutes)}</p>
      {typeof rating === 'number' ? (
        <p className="rating-line" aria-hidden="true">
          <span className="rating-num">{toArabicDigits(rating)}</span>
          <span className="rating-of">من ١٠</span>
          <span className="rating-lbl">تقييم بهجة للقيمة</span>
        </p>
      ) : null}
      {promise ? <p className="promise" aria-hidden="true">{promise}</p> : null}
      <span className="go" aria-hidden="true">ابدأ القراءة <ArrowIcon width={18} height={18} /></span>

      {/* أزرار الحفظ — فوق رابط الغطاء عبر z-index */}
      {bookmarkSlot}
    </article>
  )
}
