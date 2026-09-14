import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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

  return { summary: data as unknown as Summary | null, isLoggedIn: !!user };
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
  const { summary, isLoggedIn } = await getSummary(slug);
  if (!summary) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {/* الترويسة */}
      <header className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="shrink-0 w-28 h-40 rounded-xl overflow-hidden bg-bh-primary-light grid place-items-center border border-bh-border">
          {summary.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={summary.cover_url}
              alt={summary.book_title_ar}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-bh-primary font-black text-4xl">ب</span>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="text-3xl font-black leading-[1.45] text-bh-primary-dark">
            {summary.book_title_ar}
          </h1>
          {summary.book_title_en && (
            <p className="bh-sub mt-1 font-medium" dir="ltr" style={{ textAlign: "right" }}>
              {summary.book_title_en}
            </p>
          )}
          {summary.author && <p className="bh-body mt-1">{summary.author}</p>}
          <p className="bh-sub mt-3 text-xs">
            قراءة {summary.reading_minutes || 8} دقائق · إعداد فريق بهجة
          </p>
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

      <div className="mt-12 text-center">
        <Link
          href="/categories"
          className="text-sm font-bold text-bh-primary hover:text-bh-primary-dark transition"
        >
          ← تصفّح ملخصات أخرى
        </Link>
      </div>
    </article>
  );
}
