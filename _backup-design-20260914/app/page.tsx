import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SummaryCard from "@/components/summary-card";
import { LIST_COLUMNS, type Category, type SummaryListItem } from "@/lib/types";

// تقرأ حالة الجلسة من الكوكيز — يجب أن تُبنى عند كل طلب، بلا تخزين مؤقت
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: summaries }, { data: categories }] = await Promise.all([
    supabase
      .from("bh_summaries")
      .select(LIST_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(9),
    supabase.from("bh_categories").select("*").order("sort_order"),
  ]);

  const list = (summaries || []) as SummaryListItem[];
  const cats = (categories || []) as Category[];

  return (
    <>
      {/* البطل */}
      <section className="border-b border-bh-border bg-bh-surface">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24 text-center">
          <p className="inline-block bh-sec-num text-bh-primary bg-bh-primary-light px-3 py-1 rounded-full mb-5">
            للقادة ورواد الأعمال العرب
          </p>
          <h1 className="text-3xl sm:text-5xl font-black leading-[1.35] text-bh-primary-dark">
            لا تملك وقتاً لـ 300 صفحة —
            <br className="hidden sm:block" /> لكنك تحتاج ما فيها.
          </h1>
          <p className="bh-body mt-6 max-w-2xl mx-auto text-base">
            بهجة ليست ملخصات. إنها إعادة بناء للكتاب بعقل القائد المشغول: تفهم الكتاب كاملاً
            في دقائق، وتخرج بخطوة واحدة تطبّقها اليوم قبل أن تنام.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/categories"
              className="px-6 py-3 rounded-xl bg-bh-primary text-white font-bold hover:bg-bh-primary-dark transition"
            >
              تصفّح الأقسام
            </Link>
            {!user && (
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl border border-bh-border bg-bh-surface font-bold text-bh-primary-dark hover:bg-bh-bg transition"
              >
                افتح الملخصات كاملة
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* أحدث الملخصات */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 className="bh-sec-title text-bh-primary-dark">أحدث الملخصات</h2>
          <Link
            href="/categories"
            className="text-sm font-bold text-bh-primary hover:text-bh-primary-dark transition shrink-0"
          >
            كل الأقسام ←
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="bh-card p-10 text-center">
            <p className="bh-card-label mb-2">لا توجد ملخصات منشورة بعد</p>
            <p className="bh-sub">أول الملخصات في الطريق.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((s) => (
              <SummaryCard key={s.id} s={s} />
            ))}
          </div>
        )}
      </section>

      {/* الأقسام */}
      {cats.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-14">
          <h2 className="bh-sec-title text-bh-primary-dark mb-6">الأقسام</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {cats.map((c) => (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className="bh-card p-5 hover:border-bh-primary transition"
              >
                <h3 className="bh-pillar-title text-bh-primary-dark">{c.name_ar}</h3>
                {c.description_ar && <p className="bh-sub mt-1">{c.description_ar}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
