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
  /** وعد بسطر واحد: الفائدة لا الوصف */
  promise?: string
}

export function BookCard({ slug, title, author, category, categoryLabel, readingMinutes, promise }: Props) {
  return (
    <Link className="book-card" href={`/s/${slug}`}>
      <Cover title={title} category={category} categoryLabel={categoryLabel} />
      <h3 className="h-sub">{title}</h3>
      <p className="author">{author}</p>
      <p className="meta facts">{categoryLabel} · {readingLabel(readingMinutes)}</p>
      {promise ? <p className="promise">{promise}</p> : null}
      <span className="go">ابدأ القراءة <ArrowIcon width={18} height={18} /></span>
    </Link>
  )
}
