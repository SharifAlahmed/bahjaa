import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import {
  publishSummary,
  unpublishSummary,
  setFeatured,
  unsetFeatured,
} from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "لوحة التحكم",
  robots: { index: false, follow: false },
};

type Row = {
  id: string;
  slug: string;
  book_title_ar: string;
  author: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  is_featured: boolean;
  first_published_at: string | null;
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
      "id, slug, book_title_ar, author, status, published_at, created_at, is_featured, first_published_at, cover_url, bh_categories(name_ar)"
    )
    .order("created_at", { ascending: false });

  const rows = (data || []) as unknown as Row[];

  // الملخصات التي لها تعديلات غير منشورة (مسودة في bh_summary_drafts)
  const { data: pending } = await supabase.from("bh_summary_drafts").select("summary_id");
  const pendingIds = new Set(((pending || []) as { summary_id: string }[]).map((p) => p.summary_id));
  const drafts = rows.filter((r) => r.status === "draft");
  const published = rows.filter((r) => r.status === "published");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="bh-sec-title text-brand-dark">لوحة التحكم</h1>
          <p className="bh-sub mt-1">{email}</p>
        </div>
        <div className="flex gap-3">
          <Stat label="مسودات" value={drafts.length} />
          <Stat label="منشور" value={published.length} />
        </div>
      </div>

      <div className="bh-card p-5 mt-6 bg-surface border-brand-ink">
        <p className="bh-card-label mb-1">كيف تضيف ملخصاً</p>
        <p className="bh-body">
          أرسل لكلود: «لخّص وانشر كتاب [الاسم]». سيصل هنا كمسودة خلال دقائق، تراجعه وتضغط
          نشر. لا حاجة لأي تحرير في المتصفح.
        </p>
      </div>

      {deleted ? (
        <div className="bh-card p-4 mt-6" role="status">
          <p className="bh-body">حُذف الملخص نهائياً.</p>
        </div>
      ) : null}

      <Group title="المسودات — بانتظار مراجعتك" rows={drafts} pendingIds={pendingIds} empty="لا توجد مسودات." />
      <Group title="المنشور" rows={published} pendingIds={pendingIds} empty="لم تنشر شيئاً بعد." />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bh-card px-4 py-2 text-center">
      <p className="font-black text-xl text-brand-ink tabular-nums">{value}</p>
      <p className="bh-sub text-xs">{label}</p>
    </div>
  );
}

function Group({ title, rows, pendingIds, empty }: { title: string; rows: Row[]; pendingIds: Set<string>; empty: string }) {
  return (
    <section className="mt-10">
      <h2 className="bh-pillar-title text-brand-dark mb-3">{title}</h2>
      {rows.length === 0 ? (
        <div className="bh-card p-6 text-center">
          <p className="bh-sub">{empty}</p>
        </div>
      ) : (
        <div className="bh-card divide-y divide-border">
          {rows.map((r) => (
            <div key={r.id} className="p-4">
              {/* الصف الأول: العنوان + أزرار النشر والحذف */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="bh-pillar-title text-brand-dark truncate">
                    {r.book_title_ar}
                  </p>
                  <p className="bh-sub text-xs truncate">
                    {[r.author, r.bh_categories?.name_ar, `/s/${r.slug}`]
                      .filter(Boolean)
                      .join(" · ")}
                    {pendingIds.has(r.id) && (
                      <span style={{ color: "var(--color-accent-ink)", marginInlineStart: 6, fontWeight: 700 }}>
                        · تعديلات غير منشورة
                      </span>
                    )}
                    {r.status === "draft" && r.first_published_at && (
                      <span style={{ marginInlineStart: 6 }}>· سبق نشره</span>
                    )}
                    {r.cover_url && (
                      <span
                        style={{ color: "var(--color-brand-primary)", marginInlineStart: 6 }}
                      >
                        · غلاف ✓
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* تحرير — المسودة تُحفظ مباشرة؛ ما سبق نشره يمرّ عبر مسودة ثم «نشر التعديلات» */}
                  <Link
                    href={`/admin/summaries/${r.id}`}
                    className="px-3 py-1.5 rounded-lg border border-border text-sm font-bold text-ink-soft hover:bg-background transition"
                  >
                    تحرير
                  </Link>

                  <Link
                    href={`/admin/preview/${r.slug}`}
                    className="px-3 py-1.5 rounded-lg border border-border text-sm font-bold text-ink-soft hover:bg-background transition"
                  >
                    معاينة
                  </Link>

                  {/* زر التمييز — للمنشور فقط */}
                  {r.status === "published" && (
                    <form
                      action={
                        r.is_featured
                          ? unsetFeatured.bind(null, r.id, r.slug)
                          : setFeatured.bind(null, r.id, r.slug)
                      }
                    >
                      <button
                        className="px-3 py-1.5 rounded-lg border text-sm font-bold transition"
                        style={
                          r.is_featured
                            ? {
                                background: "var(--color-accent-gold)",
                                color: "var(--color-surface)",
                                borderColor: "var(--color-accent-gold)",
                              }
                            : {
                                borderColor: "var(--color-border)",
                                color: "var(--color-ink-soft)",
                              }
                        }
                      >
                        {r.is_featured ? "★ مميّز" : "☆ ميّز"}
                      </button>
                    </form>
                  )}

                  {r.status === "draft" ? (
                    <form action={publishSummary.bind(null, r.id, r.slug)}>
                      <button className="px-3 py-1.5 rounded-lg bg-brand-ink text-white text-sm font-bold hover:bg-brand-dark transition">
                        نشر
                      </button>
                    </form>
                  ) : (
                    <form action={unpublishSummary.bind(null, r.id, r.slug)}>
                      <button className="px-3 py-1.5 rounded-lg border border-border text-sm font-bold text-ink-soft hover:bg-background transition">
                        إخفاء
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
