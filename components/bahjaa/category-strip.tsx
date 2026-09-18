// components/bahjaa/category-strip.tsx — الأقسام الستة بأيقونات.
//
// العدّاد من البيانات لا من تقدير، وصيغته عربية سليمة عبر countLabel.
import Link from 'next/link'
import { countLabel } from './format'
import type { CategorySlug } from './cover'
import {
  LeadershipIcon, EntrepreneurshipIcon, ProductivityIcon,
  StrategyIcon, TeamsIcon, BusinessIcon,
} from './icons'

const ICONS = {
  leadership: LeadershipIcon,
  entrepreneurship: EntrepreneurshipIcon,
  productivity: ProductivityIcon,
  strategy: StrategyIcon,
  teams: TeamsIcon,
  business: BusinessIcon,
} as const

export type StripItem = { slug: string; name: string; count: number }

export function CategoryStrip({ items }: { items: StripItem[] }) {
  if (!items.length) return null
  return (
    <nav className="cat-strip" aria-label="تصفّح حسب القسم">
      {items.map((c) => {
        const Icon = ICONS[c.slug as CategorySlug] ?? BusinessIcon
        return (
          <Link className="cat-cell" href={`/c/${c.slug}`} key={c.slug}>
            <Icon width={24} height={24} />
            <span className="cat-name">{c.name}</span>
            <span className="cat-count">{countLabel(c.count)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
