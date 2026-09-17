import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Cover, type CategorySlug } from "@/components/bahjaa/cover";
import { TrustBar } from "@/components/bahjaa/trust-bar";
import { InsideSummary } from "@/components/bahjaa/inside-summary";
import { ArrowIcon } from "@/components/bahjaa/icons";
import { readingLabel } from "@/components/bahjaa/format";
import { LIST_COLUMNS, type Category, type SummaryListItem } from "@/lib/types";

// تقرأ حالة الجلسة من الكوكيز — يجب أن تُبنى عند كل طلب، بلا تخزين مؤقت
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: summaries }, { data: categories }] = await Promise.all([
    supabase
      .from("bh_summaries")
      .select(LIST_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(8),
    supabase.from("bh_categories").select("*").order("sort_order"),
  ]);

  const list = (summaries || []) as SummaryListItem[];
  const cats = (categories || []) as Category[];
  const catById = new Map(cats.map((c) => [c.id, c]));

  return (
    <>
      {/* الهيرو — اللوحة الداكنة الوحيدة في هذه الصفحة */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap">
          <p className="eyebrow">منصة بهجة للمعرفة التطبيقية</p>
          <h1 className="h-hero" id="hero-title">نحوّل المعرفة إلى أثر</h1>
          <p className="lede">
            ملخصات عملية تعيد بناء أهم الكتب للقائد المشغول: الفكرة المحورية، والمحاور،
            والاقتباسات، والفخاخ التي يجب الانتباه لها.
          </p>
          <p className="promise">اقرأ الخلاصة في دقائق، ثم اخرج بخطوة واحدة تطبّقها اليوم.</p>

          {/* زر أخضر واحد في هذه المنطقة */}
          <div className="actions">
            <Link href="#latest-summaries" className="btn btn-primary">استكشف الملخصات</Link>
            <Link href="#inside-summary" className="btn btn-ghost-light">كيف تعمل بهجة؟</Link>
          </div>

          <ul className="value-strip" aria-label="ما يحتويه كل ملخص">
            <li className="vs-item"><div className="vs-num">٧</div><div className="vs-txt">محاور تغطي جوهر الكتاب</div></li>
            <li className="vs-item"><div className="vs-num">٥</div><div className="vs-txt">اقتباسات مع تفسير بهجة</div></li>
            <li className="vs-item"><div className="vs-num">١</div><div className="vs-txt">خطوة عملية تنفّذها اليوم</div></li>
          </ul>
        </div>
      </section>

      {/* شريط الثقة — حقائق منتج فقط */}
      <section className="wrap" aria-label="حقائق البدء">
        <TrustBar />
      </section>

      {/* ماذا ستجد داخل كل ملخص؟ */}
      <InsideSummary />

      {/* أحدث الملخصات */}
      <section className="wrap section-block" id="latest-summaries" aria-labelledby="latest-title">
        <p className="eyebrow">أحدث الملخصات</p>
        <h2 className="h-sec" id="latest-title" style={{ marginTop: 14 }}>
          ابدأ من الكتاب الذي يشبه سؤالك اليوم
        </h2>
        <hr className="rule" style={{ margin: "34px 0 44px" }} />

        {list.length === 0 ? (
          <p className="read">أول الملخصات في الطريق.</p>
        ) : (
          <div className="shelf">
            {list.map((s) => {
              const cat = s.category_id ? catById.get(s.category_id) : undefined;
              const catSlug = (cat?.slug || "leadership") as CategorySlug;
              const catLabel = cat?.name_ar || "بهجة";
              return (
                <Link className="book-card" href={`/s/${s.slug}`} key={s.id}>
                  <Cover title={s.book_title_ar} slug={s.slug} category={catSlug} categoryLabel={catLabel} />
                  <h3 className="h-sub">{s.book_title_ar}</h3>
                  {s.author && <p className="author">{s.author}</p>}
                  <p className="meta facts">
                    {catLabel} · {readingLabel(s.reading_minutes || 8)}
                  </p>
                  {s.content_free?.s1?.problem && (
                    <p className="promise">{s.content_free.s1.problem}</p>
                  )}
                  <span className="go">
                    ابدأ القراءة <ArrowIcon width={18} height={18} />
                  </span>
                </Link>
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
