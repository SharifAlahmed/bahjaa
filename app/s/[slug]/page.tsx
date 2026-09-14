import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Cover, type CategorySlug } from "@/components/bahjaa/cover";
import { SummaryToc } from "@/components/bahjaa/summary-toc";
import { readingLabel } from "@/components/bahjaa/format";
import SummaryFree from "@/components/summary-free";
import SummaryFull from "@/components/summary-full";
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
async function getSummary(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const columns = user
    ? "id, slug, book_title_ar, book_title_en, author, cover_url, category_id, reading_minutes, status, published_at, content_free, content_full"
    : "id, slug, book_title_ar, book_title_en, author, cover_url, category_id, reading_minutes, status, published_at, content_free";

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

  return { summary, category, isLoggedIn: !!user };
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
    openGraph: {
      title: `ملخص كتاب ${summary.book_title_ar}`,
      description: desc.slice(0, 160),
      images: summary.cover_url ? [summary.cover_url] : undefined,
    },
  };
}

export default async function SummaryPage({ params }: Props) {
  const { slug } = await params;
  const { summary, category, isLoggedIn } = await getSummary(slug);
  if (!summary) notFound();

  return (
    <article className="wrap summary-page">
      {/* الترويسة */}
      <header className="book-head">
        <Cover
          title={summary.book_title_ar}
          category={(category?.slug || "leadership") as CategorySlug}
          categoryLabel={category?.name_ar || "بهجة"}
        />

        <div className="min-w-0">
          {category && <p className="eyebrow">{category.name_ar}</p>}
          <h1 className="h-sec book-title">{summary.book_title_ar}</h1>
          {summary.book_title_en && (
            <p className="meta" dir="ltr" style={{ textAlign: "right", marginTop: 8 }}>
              {summary.book_title_en}
            </p>
          )}

          <dl className="book-meta">
            <div className="bm">
              <dt className="bm-label">قراءة</dt>
              <dd className="bm-value">{readingLabel(summary.reading_minutes || 8).replace("قراءة ", "")}</dd>
            </div>
            {summary.author && (
              <div className="bm">
                <dt className="bm-label">المؤلف</dt>
                <dd className="bm-value">{summary.author}</dd>
              </div>
            )}
            <div className="bm">
              <dt className="bm-label">الوصول</dt>
              <dd className="bm-value">
                {isLoggedIn ? "الملخص كاملاً مفتوح لك" : "أول ٤ أقسام مفتوحة مجاناً"}
              </dd>
            </div>
            <div className="bm">
              <dt className="bm-label">الإعداد</dt>
              <dd className="bm-value">فريق بهجة</dd>
            </div>
          </dl>

          <SummaryToc locked={!isLoggedIn} />
        </div>
      </header>

      {/* الأقسام 1-4 — للجميع */}
      <SummaryFree c={summary.content_free || {}} />

      {/* الأقسام 5-10 — للمسجّلين */}
      {isLoggedIn && summary.content_full ? (
        <SummaryFull c={summary.content_full} />
      ) : (
        <Paywall slug={summary.slug} />
      )}

      <p className="summary-foot meta">
        إعداد فريق بهجة · منصة بهجة للمعرفة التطبيقية ·{" "}
        <Link href="/categories" className="textlink">تصفّح ملخصات أخرى</Link>
      </p>
    </article>
  );
}
