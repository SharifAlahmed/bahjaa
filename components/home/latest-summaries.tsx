import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type CategorySlug } from "@/components/bahjaa/cover";
import { SummaryCard } from "@/components/SummaryCard";
import { BookmarkButtons } from "@/components/bahjaa/bookmark-buttons";
import { LIST_COLUMNS, type Category, type SummaryListItem } from "@/lib/types";

/* «ابدأ بما يستحق وقتك» — أحدث ٤ ملخصات منشورة من البيانات.
   id="latest" هدف زر الهيرو، وlatest-summaries باقٍ لروابط التذييل ومكتبتي */
export async function LatestSummaries() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: summaries }, { data: categories }] = await Promise.all([
    supabase
      .from("bh_summaries")
      .select(LIST_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(4),
    supabase.from("bh_categories").select("*").order("sort_order"),
  ]);

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
  const catById = new Map(((categories || []) as Category[]).map((c) => [c.id, c]));

  return (
    <div id="latest" className="home-anchor">
      <section className="hm-latest bh-anchor" id="latest-summaries" aria-labelledby="latest-title">
        <div className="wrap">
          <header className="hm-latest-head">
            <p className="hm-eyebrow">أحدث الملخصات</p>
            <h2 className="h-sec" id="latest-title">ابدأ بما يستحق وقتك</h2>
          </header>

          {list.length === 0 ? (
            <p className="read">أول الملخصات في الطريق.</p>
          ) : (
            <div className="shelf">
              {list.map((s) => {
                const cat = s.category_id ? catById.get(s.category_id) : undefined;
                return (
                  <SummaryCard
                    key={s.id}
                    id={s.id}
                    coverUrl={s.cover_url}
                    publishedAt={s.published_at}
                    slug={s.slug}
                    title={s.book_title_ar}
                    author={s.author || ""}
                    category={(cat?.slug || "leadership") as CategorySlug}
                    categoryLabel={cat?.name_ar || "بهجة"}
                    readingMinutes={s.reading_minutes || 8}
                    promise={s.content_free?.s1?.problem}
                    ctaLabel="استكشف الملخص"
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

          <p className="hm-latest-more">
            <Link href="/categories" className="btn btn-ghost">استكشف الأقسام</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
