import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Cover, type CategorySlug } from "@/components/bahjaa/cover";
import { BookCard } from "@/components/bahjaa/book-card";
import { TrustBar } from "@/components/bahjaa/trust-bar";
import { InsideSummary } from "@/components/bahjaa/inside-summary";
import { CategoryStrip } from "@/components/bahjaa/category-strip";
import { LIST_COLUMNS, type Category, type SummaryListItem } from "@/lib/types";

// تقرأ حالة الجلسة من الكوكيز — يجب أن تُبنى عند كل طلب، بلا تخزين مؤقت
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: summaries }, { data: categories }, { data: tallyRows }] = await Promise.all([
    supabase
      .from("bh_summaries")
      .select(LIST_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(8),
    supabase.from("bh_categories").select("*").order("sort_order"),
    supabase.from("bh_summaries").select("category_id").eq("status", "published"),
  ]);

  const list = (summaries || []) as SummaryListItem[];
  const cats = (categories || []) as Category[];
  const catById = new Map(cats.map((c) => [c.id, c]));

  // عدّاد كل قسم — من البيانات، لا رقم مكتوب بيد
  const tally = new Map<string, number>();
  for (const row of (tallyRows || []) as { category_id: string | null }[]) {
    if (row.category_id) tally.set(row.category_id, (tally.get(row.category_id) || 0) + 1);
  }
  const stripItems = cats.map((c) => ({
    slug: c.slug,
    name: c.name_ar,
    count: tally.get(c.id) || 0,
  }));

  return (
    <>
      {/* الهيرو — يشرح الوعد والمسار في شاشة واحدة.
          الأغلفة من البيانات — أحدث ثلاثة منشورة، لا مختارة يدوياً. */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap hero-split">
          <div className="hero-copy">
            <p className="hero-kicker"><span aria-hidden="true" />منصة عربية تحوّل المعرفة إلى عمل</p>
            <h1 className="h-hero" id="hero-title">
              لا تكتفِ بأن تعرف.
              <span>حوّل ما تقرأ إلى أثر.</span>
            </h1>
            <p className="lede">
              بهجة تعيد بناء أهم الكتب للقائد المشغول، وتحوّل أفكارها إلى خلاصة واضحة
              وخطوة عملية تبدأ بها اليوم.
            </p>

            <div className="actions">
              <Link href="#latest-summaries" className="btn btn-primary">
                ابدأ بملخص عملي
                <span aria-hidden="true">←</span>
              </Link>
              <Link href="#inside-summary" className="btn btn-ghost-light">شاهد كيف تعمل</Link>
            </div>

            <ol className="hero-journey" aria-label="رحلة المعرفة في بهجة">
              <li><span>١</span><strong>افهم</strong></li>
              <li><span>٢</span><strong>استخرج</strong></li>
              <li><span>٣</span><strong>طبّق</strong></li>
              <li><span>٤</span><strong>قِس</strong></li>
            </ol>
          </div>

          {list.length > 0 && (
            <div className="hero-visual" aria-label="أحدث ملخصات بهجة">
              <p className="hero-visual-label">ابدأ من كتاب يشبه سؤالك اليوم</p>
              <div className="hero-shelf" aria-hidden="true">
              {list.slice(0, 3).map((s, i) => {
                const cat = s.category_id ? catById.get(s.category_id) : undefined;
                return (
                  <div className={`hs-slot hs-${i}`} key={s.id}>
                    <Cover
                      title={s.book_title_ar}
                      slug={s.slug}
                      category={(cat?.slug || "leadership") as CategorySlug}
                      categoryLabel={cat?.name_ar || "بهجة"}
                      coverUrl={s.cover_url}
                      priority={i === 0}
                    />
                  </div>
                );
              })}
              </div>
              <div className="hero-visual-note">
                <span aria-hidden="true">✓</span>
                <p><strong>أكثر من ملخص.</strong> فكرة واضحة، أداة عملية، وخطوة قابلة للقياس.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* تصفّح حسب القسم — قبل الحقائق: القارئ يبحث عن مجاله أولاً */}
      <section className="wrap" aria-label="الأقسام">
        <CategoryStrip items={stripItems} />
      </section>

      {/* شريط الحقائق — دُمج مع شريط القيمة الذي كان داخل الهيرو.
          كانا يكرّران «٤ أقسام مجاناً»، وكانا عائلة تخطيط واحدة مرّتين. */}
      <section className="wrap" aria-label="ما يحتويه كل ملخص">
        <TrustBar />
      </section>

      {/* ماذا ستجد داخل كل ملخص؟ */}
      <InsideSummary />

      {/* أحدث الملخصات */}
      <section className="wrap section-block" id="latest-summaries" aria-labelledby="latest-title">
        {/* اللافتة باقية: تسمّي القسم فعلاً. قاعدة EYEBROW RESTRAINT مكتوبة
            ضد لافتات زخرفية فوق كل قسم في صفحات الهبوط التسويقية. */}
        <p className="eyebrow">أحدث الملخصات</p>
        <h2 className="h-sec" id="latest-title" style={{ marginTop: 14 }}>
          ابدأ من الكتاب الذي يشبه سؤالك اليوم
        </h2>
        <hr className="rule" style={{ margin: "34px 0 44px" }} />

        {list.length === 0 ? (
          <p className="read">أول الملخصات في الطريق.</p>
        ) : (
          <div className="shelf">
            {list.map((s, i) => {
              const cat = s.category_id ? catById.get(s.category_id) : undefined;
              return (
                <BookCard
                  key={s.id}
                  coverUrl={s.cover_url}
                  publishedAt={s.published_at}
                  priority={i === 0}
                  slug={s.slug}
                  title={s.book_title_ar}
                  author={s.author || ""}
                  category={(cat?.slug || "leadership") as CategorySlug}
                  categoryLabel={cat?.name_ar || "بهجة"}
                  readingMinutes={s.reading_minutes || 8}
                  promise={s.content_free?.s1?.problem}
                />
              );
            })}
          </div>
        )}

        <p style={{ marginTop: 40 }}>
          <Link href="/categories" className="textlink">تصفّح كل الأقسام</Link>
        </p>
      </section>
    </>
  );
}
