import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SummaryCard } from "@/components/SummaryCard";
import { BookmarkButtons } from "@/components/bahjaa/bookmark-buttons";
import { type CategorySlug } from "@/components/bahjaa/cover";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "مكتبتي — بهجة" };

type BookmarkRow = {
  status: "want_to_read" | "liked";
  bh_summaries: {
    id: string;
    slug: string;
    book_title_ar: string;
    author: string | null;
    cover_url: string | null;
    reading_minutes: number | null;
    category_id: string | null;
    bh_categories: { name_ar: string; slug: string } | null;
  };
};

export default async function MyLibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("bh_bookmarks")
    .select(`
      status,
      bh_summaries!inner(
        id, slug, book_title_ar, author, cover_url, reading_minutes, category_id,
        bh_categories(name_ar, slug)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (data || []) as unknown as BookmarkRow[];
  const toRead = rows.filter((r) => r.status === "want_to_read");
  const liked = rows.filter((r) => r.status === "liked");

  function renderGrid(items: BookmarkRow[]) {
    if (items.length === 0) {
      return <p className="read" style={{ color: "var(--ink-soft)" }}>لا يوجد كتب هنا بعد.</p>;
    }
    return (
      <div className="shelf">
        {items.map(({ status, bh_summaries: s }) => {
          const cat = s.bh_categories;
          return (
            <SummaryCard
              key={s.id}
              id={s.id}
              slug={s.slug}
              title={s.book_title_ar}
              author={s.author || ""}
              category={(cat?.slug || "leadership") as CategorySlug}
              categoryLabel={cat?.name_ar || "بهجة"}
              readingMinutes={s.reading_minutes || 8}
              coverUrl={s.cover_url}
              bookmarkSlot={
                <BookmarkButtons summaryId={s.id} initialStatus={status} />
              }
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="wrap section-block">
      <p className="eyebrow">حسابي</p>
      <h1 className="h-sec" style={{ marginTop: 14 }}>مكتبتي</h1>
      <p className="meta" style={{ marginTop: 8, marginBottom: 48 }}>
        {rows.length === 0
          ? "لم تحفظ أي كتاب بعد"
          : `${rows.length} كتاب محفوظ`}
      </p>

      <section aria-labelledby="to-read-title">
        <div className="library-section-head">
          <h2 className="h-sub" id="to-read-title">
            <span className="library-icon">🔖</span>
            أريد قراءتها
            {toRead.length > 0 && (
              <span className="library-count">{toRead.length}</span>
            )}
          </h2>
        </div>
        {renderGrid(toRead)}
      </section>

      <hr className="rule" style={{ margin: "52px 0" }} />

      <section aria-labelledby="liked-title">
        <div className="library-section-head">
          <h2 className="h-sub" id="liked-title">
            <span className="library-icon">❤️</span>
            أعجبني
            {liked.length > 0 && (
              <span className="library-count">{liked.length}</span>
            )}
          </h2>
        </div>
        {renderGrid(liked)}
      </section>

      {rows.length === 0 && (
        <p style={{ marginTop: 40 }}>
          <Link href="/#latest-summaries" className="textlink">
            تصفّح الملخصات وابدأ بحفظ ما يعجبك
          </Link>
        </p>
      )}
    </div>
  );
}
