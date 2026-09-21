import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookCard } from "@/components/bahjaa/book-card";
import { BookmarkButtons } from "@/components/bahjaa/bookmark-buttons";
import { type CategorySlug } from "@/components/bahjaa/cover";
import { countLabel } from "@/components/bahjaa/format";
import { LIST_COLUMNS, type Category, type SummaryListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getCategory(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bh_categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data as Category | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCategory(slug);
  if (!c) return { title: "قسم غير موجود" };
  return {
    title: c.name_ar,
    description: c.description_ar || `ملخصات بهجة في ${c.name_ar}`,
    alternates: { canonical: `/c/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data }, { data: bookmarkRows }] = await Promise.all([
    supabase
      .from("bh_summaries")
      .select(LIST_COLUMNS)
      .eq("status", "published")
      .eq("category_id", category.id)
      .order("published_at", { ascending: false }),
    user
      ? supabase.from("bh_bookmarks").select("summary_id, status").eq("user_id", user.id)
      : Promise.resolve({ data: [] }),
  ]);

  const list = (data || []) as SummaryListItem[];
  const catSlug = category.slug as CategorySlug;

  const bmMap = new Map<string, "want_to_read" | "liked">(
    ((bookmarkRows || []) as { summary_id: string; status: "want_to_read" | "liked" }[])
      .map((b) => [b.summary_id, b.status])
  );

  return (
    <div className="wrap section-block">
      <p className="eyebrow">قسم</p>
      <h1 className="h-sec" style={{ marginTop: 14, maxWidth: "18ch" }}>
        {category.name_ar}
      </h1>
      {category.description_ar && (
        <p className="read col" style={{ marginTop: 20 }}>{category.description_ar}</p>
      )}
      <p className="meta" style={{ marginTop: 18 }}>
        {countLabel(list.length)} · الأقسام الأربعة الأولى من كل ملخص مفتوحة بلا تسجيل
      </p>

      <hr className="rule" style={{ margin: "34px 0 44px" }} />

      {list.length === 0 ? (
        <>
          <p className="read">لا ملخصات في هذا القسم بعد — نعمل عليها.</p>
          <p style={{ marginTop: 24 }}>
            <Link href="/categories" className="textlink">تصفّح الأقسام الأخرى</Link>
          </p>
        </>
      ) : (
        <>
          <div className="shelf">
            {list.map((s, i) => (
              <BookCard
                key={s.id}
                id={s.id}
                coverUrl={s.cover_url}
                publishedAt={s.published_at}
                rating={s.rating_value}
                priority={i === 0}
                slug={s.slug}
                title={s.book_title_ar}
                author={s.author || ""}
                category={catSlug}
                categoryLabel={category.name_ar}
                readingMinutes={s.reading_minutes || 8}
                promise={s.content_free?.s1?.problem}
                bookmarkSlot={
                  <BookmarkButtons
                    summaryId={s.id}
                    initialStatus={bmMap.get(s.id) ?? null}
                  />
                }
              />
            ))}
          </div>
          <p style={{ marginTop: 40 }}>
            <Link href="/categories" className="textlink">تصفّح كل الأقسام</Link>
          </p>
        </>
      )}
    </div>
  );
}
