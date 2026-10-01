import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SummaryReader } from "@/components/summary-reader/summary-reader";
import Paywall from "@/components/paywall";
import type { Summary } from "@/lib/types";

// تقرأ حالة الجلسة من الكوكيز — يجب أن تُبنى عند كل طلب، بلا تخزين مؤقت
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

/**
 * ملاحظة أمنية: لا نطلب content_full إلا حين تكون هناك جلسة.
 * وحتى لو طلبناه، قاعدة البيانات تمنع دور anon من قراءة هذا العمود أصلاً.
 * الجدار مطبّق في طبقتين: هنا، وفي Postgres.
 */
async function getSummary(slug: string, includeBookmark = false) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const columns = user
    ? "id, slug, book_title_ar, book_title_en, author, cover_url, category_id, reading_minutes, status, published_at, rating_value, content_free, content_full"
    : "id, slug, book_title_ar, book_title_en, author, cover_url, category_id, reading_minutes, status, published_at, rating_value, content_free";

  const { data } = await supabase
    .from("bh_summaries")
    .select(columns)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  const summary = data as unknown as Summary | null;

  let category: { slug: string; name_ar: string } | null = null;
  if (summary?.category_id) {
    const { data: cat } = await supabase
      .from("bh_categories")
      .select("slug, name_ar")
      .eq("id", summary.category_id)
      .maybeSingle();
    category = (cat as { slug: string; name_ar: string } | null) ?? null;
  }

  let bookmarkStatus: "want_to_read" | "liked" | null = null;
  if (includeBookmark && user && summary) {
    const { data: bookmark } = await supabase
      .from("bh_bookmarks")
      .select("status")
      .eq("user_id", user.id)
      .eq("summary_id", summary.id)
      .maybeSingle();

    if (bookmark?.status === "want_to_read" || bookmark?.status === "liked") {
      bookmarkStatus = bookmark.status;
    }
  }

  return { summary, category, isLoggedIn: !!user, bookmarkStatus };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { summary } = await getSummary(slug);
  if (!summary) return { title: "ملخص غير موجود" };

  const desc =
    summary.content_free?.s1?.core_idea ||
    summary.content_free?.s4?.text ||
    `ملخص بهجة لكتاب ${summary.book_title_ar}`;

  return {
    title: `ملخص كتاب ${summary.book_title_ar}`,
    description: desc.slice(0, 160),
    alternates: { canonical: `/s/${slug}` },
    openGraph: {
      title: `ملخص كتاب ${summary.book_title_ar}`,
      description: desc.slice(0, 160),
      images: summary.cover_url ? [summary.cover_url] : undefined,
    },
  };
}

export default async function SummaryPage({ params }: Props) {
  const { slug } = await params;
  const { summary, category, isLoggedIn, bookmarkStatus } = await getSummary(slug, true);
  if (!summary) notFound();

  // أمان: content_full لا يُطلب أصلاً للزائر (getSummary)، ولا يُمرَّر للعارض إلا بجلسة
  const full = isLoggedIn ? summary.content_full ?? null : null;

  return (
    <>
      <SummaryReader
      hero={{
        slug: summary.slug,
        titleAr: summary.book_title_ar,
        titleEn: summary.book_title_en,
        author: summary.author,
        coverUrl: summary.cover_url,
        readingMinutes: summary.reading_minutes,
        rating: summary.rating_value,
        category,
      }}
      free={summary.content_free || {}}
      full={full}
      locked={!isLoggedIn}
      access={isLoggedIn ? "open" : "partial"}
      gate={isLoggedIn ? null : <Paywall slug={summary.slug} />}
      summaryId={summary.id}
      bookmarkStatus={bookmarkStatus}
      />
    </>
  );
}
