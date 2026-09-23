import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type CategorySlug } from "@/components/bahjaa/cover";
import { SummaryCard } from "@/components/SummaryCard";
import { BookmarkButtons } from "@/components/bahjaa/bookmark-buttons";
import { LIST_COLUMNS, type Category, type SummaryListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: summaries }, { data: categories }] = await Promise.all([
    supabase
      .from("bh_summaries")
      .select(LIST_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(8),
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
  const cats = (categories || []) as Category[];
  const catById = new Map(cats.map((c) => [c.id, c]));

  return (
    <section
      className="wrap section-block bh-anchor"
      id="latest-summaries"
      aria-labelledby="latest-title"
    >
      <p className="eyebrow">أحدث الملخصات</p>
      <h1 className="h-sec" id="latest-title" style={{ marginTop: 14 }}>
        ملخصات بهجة
      </h1>
      <hr className="rule" style={{ margin: "26px 0 36px" }} />

      {list.length === 0 ? (
        <p className="read">أول الملخصات في الطريق.</p>
      ) : (
        <div className="shelf">
          {list.map((s, i) => {
            const cat = s.category_id ? catById.get(s.category_id) : undefined;
            return (
              <SummaryCard
                key={s.id}
                id={s.id}
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
  );
}
