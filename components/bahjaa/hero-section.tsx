// components/bahjaa/hero-section.tsx — اللوحة الداكنة الوحيدة في الرئيسية.
//
// ليست ثلاثة أغلفة عائمة فقط: الأغلفة (حقيقية، من البيانات) هي مادة خام،
// وتحتها شريط تحويل مصغّر (افهم ← استخرج ← طبّق ← قِس) يقول بصرياً إن
// بهجة لا تكتفي بعرض الكتاب بل تحوّله. نفس أيقونات رحلة المعرفة بالضبط —
// هذا الشريط معاينة صادقة للقسم الكامل أسفل الصفحة، لا رسم مختلَق.
import Link from 'next/link'
import { Cover, type CategorySlug } from './cover'
import { UnderstandIcon, ExtractIcon, ApplyIcon, BusinessIcon, ArrowIcon } from './icons'
import type { Category, SummaryListItem } from '@/lib/types'

const FLOW = [
  { key: 'book', icon: UnderstandIcon, label: 'كتاب' },
  { key: 'extract', icon: ExtractIcon, label: 'أفكار' },
  { key: 'apply', icon: ApplyIcon, label: 'خطة' },
  { key: 'measure', icon: BusinessIcon, label: 'أثر' },
] as const

export function HeroSection({
  list,
  catById,
}: {
  list: SummaryListItem[]
  catById: Map<string, Category>
}) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap hero-split">
        <div className="hero-copy">
          <p className="eyebrow">منصة بهجة للمعرفة التطبيقية</p>
          <h1 className="h-hero" id="hero-title">نحوّل المعرفة إلى أثر</h1>
          {/* ≤ ٢٠ كلمة، ≤ ٤ أسطر — قاعدة 4.7 */}
          <p className="lede">
            نأخذ أهم ما في الكتب والمحتوى المعرفي، ونحوّله إلى فهم واضح وأفكار عملية
            وخطوات قابلة للتطبيق.
          </p>

          {/* زر أخضر واحد في هذه المنطقة */}
          <div className="actions">
            <Link href="#latest-summaries" className="btn btn-primary">استكشف بهجة</Link>
            <Link href="#knowledge-journey" className="btn btn-ghost-light">كيف تعمل بهجة؟</Link>
          </div>
        </div>

        <div className="hero-visual">
          {list.length > 0 && (
            <div className="hero-shelf" aria-hidden="true">
              {list.slice(0, 3).map((s, i) => {
                const cat = s.category_id ? catById.get(s.category_id) : undefined
                return (
                  <div className={`hs-slot hs-${i}`} key={s.id}>
                    <Cover
                      title={s.book_title_ar}
                      slug={s.slug}
                      category={(cat?.slug || 'leadership') as CategorySlug}
                      categoryLabel={cat?.name_ar || 'بهجة'}
                      coverUrl={s.cover_url}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {/* معاينة صادقة لرحلة المعرفة الكاملة أسفل الصفحة — لا رسم شاشة مختلَق */}
          <ol className="hero-flow" aria-label="من الكتاب إلى الأثر: افهم، استخرج، طبّق، قِس">
            {FLOW.map((f, i) => {
              const Icon = f.icon
              return (
                <li className="hero-flow-node" key={f.key}>
                  <span className="hero-flow-icon"><Icon width={18} height={18} /></span>
                  <span className="hero-flow-label">{f.label}</span>
                  {i < FLOW.length - 1 ? (
                    <span className="hero-flow-arrow" aria-hidden="true"><ArrowIcon width={14} height={14} /></span>
                  ) : null}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
