import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type CategorySlug } from "@/components/bahjaa/cover";
import { BookCard } from "@/components/bahjaa/book-card";
import { TrustBar } from "@/components/bahjaa/trust-bar";
import { InsideSummary } from "@/components/bahjaa/inside-summary";
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
          {/* ≤ ٢٠ كلمة، ≤ ٤ أسطر — قاعدة 4.7 */}
          <p className="lede">
            نعيد بناء أهم الكتب للقائد المشغول، ونسلّمه خطوة واحدة يطبّقها الليلة.
          </p>

          {/* زر أخضر واحد في هذه المنطقة */}
          <div className="actions">
            <Link href="#latest-summaries" className="btn btn-primary">استكشف الملخصات</Link>
            <Link href="#inside-summary" className="btn btn-ghost-light">كيف تعمل بهجة؟</Link>
          </div>

        </div>
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
            {list.map((s) => {
              const cat = s.category_id ? catById.get(s.category_id) : undefined;
              return (
                <BookCard
                  key={s.id}
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
