// components/bahjaa/hero-section.tsx — مساحة العمل المعرفية · V3
//
// Sprint 1 · سبتمبر ٢٠٢٦:
// رحلة التحويل انتقلت إلى عمود النص (تُقرأ أولاً RTL).
// رفّ الأغلفة الثلاثة استُبدل بمساحة عمل معرفية: واجهة قراءة CSS
// + كتاب خلفي + كتاب أمامي بطل + بطاقتان عائمتان بلا أرقام مختلقة.
import Link from 'next/link'
import { Cover, type CategorySlug } from './cover'
import { MotifThread } from './motif'
import { UnderstandIcon, ExtractIcon, ApplyIcon, BusinessIcon, ArrowIcon } from './icons'
import type { Category, SummaryListItem } from '@/lib/types'

const FLOW = [
  { key: 'book',    icon: UnderstandIcon, label: 'كتاب' },
  { key: 'extract', icon: ExtractIcon,    label: 'أفكار' },
  { key: 'apply',   icon: ApplyIcon,      label: 'خطة' },
  { key: 'measure', icon: BusinessIcon,   label: 'أثر' },
] as const

export function HeroSection({
  list,
  catById,
}: {
  list: SummaryListItem[]
  catById: Map<string, Category>
}) {
  const featured = list[0]
  const second   = list[1]

  const catFor = (s: SummaryListItem | undefined) =>
    s?.category_id ? catById.get(s.category_id) : undefined

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap hero-split">

        {/* ══ عمود النص (يمين في RTL) ══ */}
        <div className="hero-copy">
          <p className="eyebrow">منصة بهجة للمعرفة التطبيقية</p>
          <h1 className="h-hero" id="hero-title">نحوّل المعرفة إلى أثر</h1>
          <p className="lede">
            نأخذ أهم ما في الكتب والمحتوى المعرفي، ونحوّله إلى فهم واضح وأفكار عملية
            وخطوات قابلة للتطبيق.
          </p>

          {/* رحلة التحويل — مرئية أولاً، قبل أزرار CTA */}
          <ol
            className="hero-flow hero-flow-copy"
            aria-label="من الكتاب إلى الأثر"
          >
            {FLOW.map((f, i) => {
              const Icon = f.icon
              return (
                <li className="hero-flow-node" key={f.key}>
                  <span className="hero-flow-icon"><Icon width={18} height={18} /></span>
                  <span className="hero-flow-label">{f.label}</span>
                  {i < FLOW.length - 1 ? (
                    <span className="hero-flow-arrow" aria-hidden="true">
                      <ArrowIcon width={12} height={12} />
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ol>

          {/* زر أخضر واحد في هذه المنطقة */}
          <div className="actions">
            <Link href="#latest-summaries" className="btn btn-primary">استكشف بهجة</Link>
            <Link href="#knowledge-journey" className="btn btn-ghost-light">كيف تعمل بهجة؟</Link>
          </div>
        </div>

        {/* ══ مساحة العمل المعرفية (يسار في RTL) ══ */}
        {list.length > 0 && (
          <div className="hero-visual" aria-hidden="true">
            <div className="hw-workspace">

              {/* واجهة القراءة — هيكل CSS مجرّد، لا بيانات */}
              <div className="hw-interface">
                <div className="hw-iface-topbar">
                  <span className="hw-iface-brand">بهجة</span>
                  <span className="hw-iface-divider" />
                  <span className="hw-iface-subtitle">ملخص معرفي</span>
                </div>
                <div className="hw-iface-tabs">
                  <span className="hw-iface-tab hw-tab-active">أهم الأفكار</span>
                  <span className="hw-iface-tab">مسار التطبيق</span>
                  <span className="hw-iface-tab">التقييم</span>
                </div>
                <div className="hw-iface-body">
                  <span className="hw-iface-lbl">الفكرة المحورية</span>
                  <div className="hw-iface-lines">
                    <span className="hw-iface-line" style={{width:'88%'}} />
                    <span className="hw-iface-line" style={{width:'74%'}} />
                    <span className="hw-iface-line" style={{width:'56%'}} />
                  </div>
                </div>
              </div>

              {/* كتاب خلفي — z:1 خافت مائل */}
              {second && (
                <div className="hw-book-bg">
                  <Cover
                    title={second.book_title_ar}
                    slug={second.slug}
                    category={(catFor(second)?.slug || 'leadership') as CategorySlug}
                    categoryLabel={catFor(second)?.name_ar || 'بهجة'}
                    coverUrl={second.cover_url}
                  />
                </div>
              )}

              {/* كتاب أمامي — البطل z:4 */}
              <div className="hw-book-fg">
                <Cover
                  title={featured.book_title_ar}
                  slug={featured.slug}
                  category={(catFor(featured)?.slug || 'leadership') as CategorySlug}
                  categoryLabel={catFor(featured)?.name_ar || 'بهجة'}
                  coverUrl={featured.cover_url}
                  priority
                />
              </div>

              {/* بطاقة أ — تسمية هيكلية، لا رقم */}
              <div className="hw-card hw-card-a">
                <span className="hw-card-icon"><ExtractIcon width={14} height={14} /></span>
                <span className="hw-card-lbl">أفكار رئيسية</span>
              </div>

              {/* بطاقة ب */}
              <div className="hw-card hw-card-b">
                <span className="hw-card-icon"><ApplyIcon width={14} height={14} /></span>
                <span className="hw-card-lbl">مسار التطبيق</span>
              </div>

              {/* موتيف زخرفي */}
              <div className="hw-motif">
                <MotifThread width={58} height={58} />
              </div>

            </div>
          </div>
        )}
      </div>
    </section>
  )
}
