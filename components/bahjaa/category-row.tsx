// components/bahjaa/category-row.tsx — صف القسم، بديل بطاقة القسم
import Link from 'next/link'
import { countLabel } from './format'

type Props = { slug: string; name: string; outcome: string; count: number }

export function CategoryRow({ slug, name, outcome, count }: Props) {
  return (
    <Link className="cat-row" href={`/c/${slug}`}>
      <span className="name">{name}</span>
      <span className="outcome">{outcome}</span>
      <span className="count">{countLabel(count)}</span>
      <span className="arrow" aria-hidden="true"><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 6 8 12l6 6" /></svg></span>
    </Link>
  )
}

/** السؤال الذي يحمله القارئ إلى القسم — مفتاحها slug القسم في bh_categories */
export const CATEGORY_OUTCOMES: Record<string, string> = {
  leadership:       'كيف تقود بوضوح عندما تصبح القرارات أصعب؟',
  entrepreneurship: 'كيف تبني شيئًا يريده الناس ويستحق أن ينمو؟',
  productivity:     'كيف تنجز باستمرار دون أن تستنزف نفسك؟',
  strategy:         'كيف ترى الصورة الأكبر قبل أن تختار خطوتك التالية؟',
  teams:            'كيف تبني فريقًا أفضل، وثقافة تساعده على النجاح؟',
  business:         'كيف تتخذ قرارات مالية وتجارية بوعي أكبر؟',
}
