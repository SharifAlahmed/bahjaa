import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

// تقرأ حالة الجلسة من الكوكيز — يجب أن تُبنى عند كل طلب، بلا تخزين مؤقت
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الأقسام",
  description: "تصفّح ملخصات بهجة حسب المجال: القيادة، ريادة الأعمال، الإنتاجية، الاستراتيجية، الفرق، والمال والأعمال.",
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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="bh-sec-title text-bh-primary-dark">الأقسام</h1>
      <p className="bh-body mt-2 max-w-2xl">
        اختر المجال الذي تحتاجه الآن — لا الذي يبدو مثيراً.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 mt-8">
        {cats.map((c) => (
          <Link
            key={c.id}
            href={`/c/${c.slug}`}
            className="bh-card p-6 hover:border-bh-primary hover:shadow-sm transition group"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="bh-pillar-title text-bh-primary-dark group-hover:text-bh-primary transition">
                {c.name_ar}
              </h2>
              <span className="shrink-0 bh-sec-num text-bh-primary bg-bh-primary-light px-2.5 py-1 rounded-full">
                {tally.get(c.id) || 0}
              </span>
            </div>
            {c.description_ar && <p className="bh-body mt-2">{c.description_ar}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
