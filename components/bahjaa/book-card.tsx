// components/bahjaa/book-card.tsx — البطاقة كلها رابط واحد قابل للنقر
import Link from 'next/link'
import { Cover, type CategorySlug } from './cover'
import { ArrowIcon } from './icons'
import { readingLabel } from './format'

type Props = {
  slug: string
  title: string
  author: string
  category: CategorySlug
  categoryLabel: string
  readingMinutes: number
  coverUrl?: string | null
  /** أولوية التحميل — للبطاقة الأولى في الصفحة فقط */
  priority?: boolean
  /** تاريخ النشر — منه وحده تُشتقّ شارة «جديد» */
  publishedAt?: string | null
  /** وعد بسطر واحد: الفائدة لا الوصف */
  promise?: string
}

/** «جديد» = نُشر خلال ٢١ يوماً. لا شارة أخرى: «الأكثر قراءة» تحتاج
    بيانات قراءة حقيقية لا نملكها بعد، فلا نخترعها. */
function isNew(publishedAt?: string | null): boolean {
  if (!publishedAt) return false
  const days = (Date.now() - new Date(publishedAt).getTime()) / 86_400_000
  return days >= 0 && days <= 21
}

export function BookCard({ slug, title, author, category, categoryLabel, readingMinutes, coverUrl, priority, publishedAt, promise }: Props) {
  const fresh = isNew(publishedAt)
  return (
    <Link className="book-card" href={`/s/${slug}`}>
      <div className="cover-wrap">
        <Cover title={title} slug={slug} category={category} categoryLabel={categoryLabel} coverUrl={coverUrl} priority={priority} />
        {fresh ? <span className="cover-badge">جديد</span> : null}
      </div>
      <h3 className="h-sub">{title}</h3>
      {author ? <p className="author">{author}</p> : null}
      <p className="meta facts">{categoryLabel} · {readingLabel(readingMinutes)}</p>
      {promise ? <p className="promise">{promise}</p> : null}
      <span className="go">ابدأ القراءة <ArrowIcon width={18} height={18} /></span>
    </Link>
  )
}
