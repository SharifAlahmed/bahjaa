// components/bahjaa/cover.tsx — الغلاف التوليدي: لون القسم + اسم الكتاب + سطر التسمية.
// لا صور كتب، لا تراخيص. نفس المنطق المستخدم في scripts/generate-covers.mjs.

export const CATEGORY_COLORS = {
  leadership:       '#085041',
  entrepreneurship: '#A8432B',
  productivity:     '#1D9E75',
  strategy:         '#1F3A5F',
  teams:            '#6B4A7E',
  business:         '#B07D3A',
} as const

export type CategorySlug = keyof typeof CATEGORY_COLORS

/** 46px لكلمتين · 30px لعنوان طويل — التدرّج محسوب على عدد الحروف لا الكلمات. */
export function coverTitleClass(title: string): 'lg' | 'md' | 'sm' {
  const len = title.trim().length
  if (len <= 14) return 'lg'
  if (len <= 20) return 'md'
  return 'sm'
}

type Props = {
  title: string
  category: CategorySlug
  categoryLabel: string
  className?: string
}

export function Cover({ title, category, categoryLabel, className = '' }: Props) {
  return (
    <div
      className={`cover ${className}`}
      style={{ ['--cat' as string]: CATEGORY_COLORS[category] }}
    >
      <div className="cover-rule" />
      <span className={`cover-title ${coverTitleClass(title)}`}>{title}</span>
      <span className="cover-label">بهجة · {categoryLabel}</span>
    </div>
  )
}
