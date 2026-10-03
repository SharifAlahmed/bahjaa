import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import { SummaryList, type AdminRow } from "./summary-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "لوحة التحكم",
  robots: { index: false, follow: false },
};

type Row = {
  id: string;
  slug: string;
  book_title_ar: string;
  book_title_en: string | null;
  author: string | null;
  status: "draft" | "published";
  created_at: string;
  is_featured: boolean;
  first_published_at: string | null;
  archived_at: string | null;
  cover_url: string | null;
  bh_categories: { name_ar: string } | null;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { deleted } = await searchParams;
  const email = await getAdminEmail();

  if (!email) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="bh-card p-8">
          <h1 className="bh-sec-title text-brand-dark">لوحة التحكم</h1>
          <p className="bh-body mt-3">
            هذه الصفحة للأدمن فقط. سجّل الدخول بإيميل الأدمن.
          </p>
          <Link
            href="/login?next=/admin"
            className="inline-block mt-6 px-6 py-3 rounded-xl bg-brand-ink text-white font-bold hover:bg-brand-dark transition"
          >
            دخول
          </Link>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("bh_summaries")
    .select(
      "id, slug, book_title_ar, book_title_en, author, status, created_at, is_featured, first_published_at, archived_at, cover_url, bh_categories(name_ar)"
    )
    .order("created_at", { ascending: false });

  // الملخصات التي لها تعديلات غير منشورة (مسودة في bh_summary_drafts)
  const { data: pending } = await supabase.from("bh_summary_drafts").select("summary_id");
  const pendingIds = new Set(((pending || []) as { summary_id: string }[]).map((p) => p.summary_id));

  const rows: AdminRow[] = ((data || []) as unknown as Row[]).map((r) => ({
    id: r.id, slug: r.slug, book_title_ar: r.book_title_ar, book_title_en: r.book_title_en, author: r.author,
    status: r.status, first_published_at: r.first_published_at, archived_at: r.archived_at,
    is_featured: r.is_featured, cover_url: r.cover_url,
    categoryName: r.bh_categories?.name_ar ?? null,
    hasPendingEdits: pendingIds.has(r.id),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div>
        <h1 className="bh-sec-title text-brand-dark">لوحة التحكم</h1>
        <p className="bh-sub mt-1">{email}</p>
      </div>

      <div className="bh-card p-5 mt-6 bg-surface border-brand-ink">
        <p className="bh-card-label mb-1">كيف تضيف ملخصاً</p>
        <p className="bh-body">
          أرسل لكلود: «لخّص وانشر كتاب [الاسم]». سيصل هنا كمسودة خلال دقائق، تراجعه وتضغط
          نشر. لا حاجة لأي تحرير في المتصفح.
        </p>
      </div>

      <div className="bh-card p-5 mt-4">
        <p className="bh-card-label mb-1">محتوى الصفحة الرئيسية</p>
        <p className="bh-body">
          <Link href="/admin/site/home-hero" className="textlink">تحرير قسم الافتتاح</Link> — النصوص والأزرار والصورة.
          {" · "}<Link href="/admin/site/home-featured" className="textlink">المختارات</Link> — حتى ٤ ملخصات بالترتيب. كلاهما عبر مسودة ثم نشر.
        </p>
      </div>

      {deleted ? (
        <div className="bh-card p-4 mt-6" role="status">
          <p className="bh-body">حُذف الملخص نهائياً.</p>
        </div>
      ) : null}

      <SummaryList rows={rows} />
    </div>
  );
}
