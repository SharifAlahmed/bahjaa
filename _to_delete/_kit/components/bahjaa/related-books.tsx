// components/bahjaa/related-books.tsx — «تابع القراءة»
import Link from 'next/link'
import { Cover, type CategorySlug } from './cover'
import { ArrowIcon } from './icons'
import { readingLabel } from './format'

export type RelatedBook = {
  slug: string
  title: string
  author: string
  category: CategorySlug
  categoryLabel: string
  readingMinutes: number
}

export function RelatedBooks({ books }: { books: RelatedBook[] }) {
  if (!books.length) return null
  return (
    <section className="section-block" aria-labelledby="related-title">
      <p className="eyebrow">تابع القراءة</p>
      <h2 className="h-sec" id="related-title" style={{ marginTop: 14 }}>كتب تكمل الفكرة من زاوية أخرى</h2>
      <hr className="rule" style={{ margin: '26px 0 36px' }} />
      <div className="related">
        {books.map((b) => (
          <Link className="rel-card" href={`/s/${b.slug}`} key={b.slug}>
            <Cover title={b.title} category={b.category} categoryLabel={b.categoryLabel} />
            <div>
              <h3>{b.title}</h3>
              <p className="author">{b.author}</p>
              <p className="meta facts">{b.categoryLabel} · {readingLabel(b.readingMinutes)}</p>
              <span className="go">اقرأ الملخص <ArrowIcon width={16} height={16} /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
