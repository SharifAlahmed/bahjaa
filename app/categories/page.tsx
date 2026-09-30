import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CategoryRow, CATEGORY_OUTCOMES } from "@/components/bahjaa/category-row";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الأقسام",
  description:
    "استكشف أقسام بهجة في القيادة، ريادة الأعمال، الإنتاجية، الاستراتيجية، الفرق، والمال والأعمال.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: counts }] = await Promise.all([
    supabase.from("bh_categories").select("*").order("sort_order"),
    supabase.from("bh_summaries").select("category_id").eq("status", "published"),
  ]);

  const cats = (categories || []) as Category[];
  const tally = new Map<string, number>();
  for (const row of (counts || []) as { category_id: string | null }[]) {
    if (row.category_id) tally.set(row.category_id, (tally.get(row.category_id) || 0) + 1);
  }

  return (
    <>
      <section className="wrap cats-intro cats-intro-v2">
        <p className="eyebrow">الأقسام</p>
        <h1 className="h-sec cats-title">ابدأ بالسؤال الذي يشغلك الآن</h1>
        <p className="read col cats-lede">
          اختر المجال الأقرب لما تحاول فهمه أو تحسينه، ثم ابدأ بالمعرفة التي تساعدك
          على اتخاذ خطوة أفضل.
        </p>
        <p className="cats-note">لا تبدأ باسم الكتاب؛ ابدأ بما تريد أن تفهمه أو تغيّره.</p>
      </section>

      <nav
        className="wrap cats-list cats-card-grid bh-anchor"
        id="categories"
        aria-label="أقسام بهجة"
      >
        {cats.map((c) => (
          <CategoryRow
            key={c.id}
            slug={c.slug}
            name={c.name_ar}
            outcome={CATEGORY_OUTCOMES[c.slug] || c.description_ar || ""}
            count={tally.get(c.id) || 0}
          />
        ))}
      </nav>
    </>
  );
}
