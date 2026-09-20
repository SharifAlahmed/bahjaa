// components/bahjaa/category-strip.tsx — شريط الاكتشاف بعد الهيرو مباشرة.
//
// الأقسام الستة الحقيقية فقط، بأيقونات، على هيئة رقائق (chips) قابلة
// للسحب أفقياً على الجوال. لا نوع محتوى وهمي: كل خانة هنا رابط حقيقي
// إلى صفحة قسم فيها ملخصات فعلاً. العدّاد من البيانات لا من تقدير.
import Link from 'next/link'
import { countLabel } from './format'
import type { CategorySlug } from './cover'
import {
  LeadershipIcon, EntrepreneurshipIcon, ProductivityIcon,
  StrategyIcon, TeamsIcon, BusinessIcon, BookmarkIcon,
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

export function CategoryStrip({ items, total }: { items: StripItem[]; total: number }) {
  if (!items.length) return null
  return (
    <nav className="discovery-bar" aria-label="اكتشف حسب القسم">
      <ul className="discovery-scroll">
        <li>
          <Link className="discovery-chip discovery-chip-all" href="/categories">
            <BookmarkIcon width={20} height={20} />
            <span className="chip-name">كل الملخصات</span>
            <span className="chip-count">{countLabel(total)}</span>
          </Link>
        </li>
        {items.map((c) => {
          const Icon = ICONS[c.slug as CategorySlug] ?? BusinessIcon
          return (
            <li key={c.slug}>
              <Link className="discovery-chip" href={`/c/${c.slug}`}>
                <Icon width={20} height={20} />
                <span className="chip-name">{c.name}</span>
                <span className="chip-count">{countLabel(c.count)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
