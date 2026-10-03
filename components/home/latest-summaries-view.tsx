import Link from "next/link";
import { type CategorySlug } from "@/components/bahjaa/cover";
import { SummaryCard } from "@/components/SummaryCard";
import { BookmarkButtons } from "@/components/bahjaa/bookmark-buttons";
import type { Category, SummaryListItem } from "@/lib/types";

export type BookmarkStatus = "want_to_read" | "liked";

/* عرض قسم الملخصات في الرئيسية — بلا جلب بيانات، ليُستخدم في الصفحة العامة ومعاينة الأدمن الحية بالمكوّن نفسه.
   البنية والأصناف كما كانت حرفياً. */
export function LatestSummariesView({
  items, categories, bookmarks, eyebrow,
}: {
  items: SummaryListItem[];
  categories: Category[];
  /** null = زائر غير مسجّل (بلا أزرار حفظ) */
  bookmarks: Record<string, BookmarkStatus> | null;
  eyebrow: string;
}) {
  const catById = new Map(categories.map((c) => [c.id, c]));

  return (
    <div id="latest" className="home-anchor">
      <section className="hm-latest bh-anchor" id="latest-summaries" aria-labelledby="latest-title">
        <div className="wrap">
          <header className="hm-latest-head">
            <p className="hm-eyebrow">{eyebrow}</p>
            <h2 className="h-sec" id="latest-title">ابدأ بما يستحق وقتك</h2>
          </header>

          {items.length === 0 ? (
            <p className="read">أول الملخصات في الطريق.</p>
          ) : (
            <div className="shelf">
              {items.map((s) => {
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
                      bookmarks ? (
                        <BookmarkButtons
                          summaryId={s.id}
                          initialStatus={bookmarks[s.id] ?? null}
                        />
                      ) : undefined
                    }
                  />
                );
              })}
            </div>
          )}

          <p className="hm-latest-more">
            <Link href="/categories" className="btn btn-ghost">
              استكشف الأقسام ←
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
