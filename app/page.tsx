import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type CategorySlug } from "@/components/bahjaa/cover";
import { BookCard } from "@/components/bahjaa/book-card";

import { CategoryStrip } from "@/components/bahjaa/category-strip";
import { HeroSection } from "@/components/bahjaa/hero-section";
import { KnowledgeJourney } from "@/components/bahjaa/knowledge-journey";
import { VisualCTA } from "@/components/bahjaa/visual-cta";
import { WhyBahjaa } from "@/components/bahjaa/why-bahjaa";
import { AudienceSection } from "@/components/bahjaa/audience-section";
import { FinalCTA } from "@/components/bahjaa/final-cta";
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
  const totalPublished = (tallyRows || []).length;

  return (
    <>
      {/* الهيرو — اللوحة الداكنة الوحيدة في هذه الصفحة.
          الأغلفة من البيانات — أحدث ثلاثة منشورة، لا مختارة يدوياً. */}
      <HeroSection />

      {/* شريط الاكتشاف — مباشرة بعد الهيرو، الأقسام الحقيقية فقط */}
      <section className="wrap" aria-label="اكتشف حسب القسم">
        <CategoryStrip items={stripItems} total={totalPublished} />
      </section>

      {/* رحلة المعرفة — المكوّن التوقيعي: افهم، استخرج، طبّق، قِس */}
      <KnowledgeJourney />

      {/* أحدث الملخصات */}
      <section className="wrap section-block bh-anchor" id="latest-summaries" aria-labelledby="latest-title">
        <p className="eyebrow">اكتشف ما يستحق وقتك</p>
        <h2 className="h-sec" id="latest-title" style={{ marginTop: 14 }}>
          أفكار مختارة من الكتب، مصمَّمة لتساعدك على الفهم والتطبيق
        </h2>
        <hr className="rule" style={{ margin: "26px 0 36px" }} />

        {list.length === 0 ? (
          <p className="read">أول الملخصات في الطريق.</p>
        ) : (
          <div className="shelf shelf-featured">
            {list.map((s, i) => {
              const cat = s.category_id ? catById.get(s.category_id) : undefined;
              return (
                <BookCard
                  key={s.id}
                  coverUrl={s.cover_url}
                  publishedAt={s.published_at}
                  priority={i === 0}
                  featured={i === 0}
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

      {/* بانر بصري — راحة بصرية بعد شبكة البطاقات */}
      <VisualCTA />

      {/* لماذا بهجة */}
      <WhyBahjaa />

      {/* لمن بهجة — إثبات بلا أرقام مختلَقة */}
      <AudienceSection />

      {/* الإغلاق القوي */}
      <FinalCTA />
    </>
  );
}
