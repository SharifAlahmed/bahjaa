import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type CategorySlug } from "@/components/bahjaa/cover";
import { BookCard } from "@/components/bahjaa/book-card";
import { BookmarkButtons } from "@/components/bahjaa/bookmark-buttons";

import { CategoryStrip } from "@/components/bahjaa/category-strip";
import { HeroSection } from "@/components/bahjaa/hero-section";
import { KnowledgeJourney } from "@/components/bahjaa/knowledge-journey";
import { VisualCTA } from "@/components/bahjaa/visual-cta";
import { PromoBanner } from "@/components/bahjaa/promo-banner";
import { WhyBahjaa } from "@/components/bahjaa/why-bahjaa";
import { AudienceSection } from "@/components/bahjaa/audience-section";
import { FinalCTA } from "@/components/bahjaa/final-cta";
import { LIST_COLUMNS, type Category, type SummaryListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  // جلب bookmarks للمستخدم المسجّل فقط — منفصل عن Promise.all لتجنّب تعارض الأنواع
  const bmMap = new Map<string, "want_to_read" | "liked">();
  if (user) {
    const { data: bms } = await supabase
      .from("bh_bookmarks")
      .select("summary_id, status")
      .eq("user_id", user.id);
    for (const b of (bms ?? []) as Array<{ summary_id: string; status: "want_to_read" | "liked" }>) {
      bmMap.set(b.summary_id, b.status);
    }
  }

  const list = (summaries || []) as SummaryListItem[];
  const cats = (categories || []) as Category[];
  const catById = new Map(cats.map((c) => [c.id, c]));

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
      <HeroSection />

      <section className="wrap" aria-label="اكتشف حسب القسم">
        <CategoryStrip items={stripItems} total={totalPublished} />
      </section>

      <KnowledgeJourney />
      <PromoBanner />

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
                  id={s.id}
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
                  bookmarkSlot={
                    <BookmarkButtons
                      summaryId={s.id}
                      initialStatus={bmMap.get(s.id) ?? null}
                    />
                  }
                />
              );
            })}
          </div>
        )}

        <p style={{ marginTop: 40 }}>
          <Link href="/categories" className="textlink">تصفّح كل الأقسام</Link>
        </p>
      </section>

      <VisualCTA />
      <WhyBahjaa />
      <AudienceSection />
      <FinalCTA />
    </>
  );
}
