import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CategoryRow, CATEGORY_OUTCOMES } from "@/components/bahjaa/category-row";
import { DarkPanel } from "@/components/bahjaa/dark-panel";
import type { Category } from "@/lib/types";

// تقرأ حالة الجلسة من الكوكيز — يجب أن تُبنى عند كل طلب، بلا تخزين مؤقت
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الأقسام",
  description:
    "تصفّح ملخصات بهجة حسب المجال: القيادة، ريادة الأعمال، الإنتاجية، الاستراتيجية، الفرق، والمال والأعمال.",
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
      <section className="wrap" style={{ paddingBlock: "clamp(48px,7vw,72px) 20px" }}>
        <p className="eyebrow">ستة أقسام</p>
        <h1 className="h-sec" style={{ marginTop: 14, maxWidth: "16ch" }}>
          اختر القسم الذي يشبه سؤالك هذا الأسبوع
        </h1>
        <p className="read col" style={{ marginTop: 20 }}>
          كل قسم يجمع الكتب التي تعالج نوعاً واحداً من الأسئلة. الأقسام الأربعة الأولى من كل
          ملخص مفتوحة بلا تسجيل.
        </p>
      </section>

      <nav className="wrap" style={{ paddingBottom: "clamp(40px,6vw,64px)" }} aria-label="أقسام المكتبة">
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

      {/* اللوحة الداكنة الوحيدة في هذه الصفحة */}
      <section className="wrap" style={{ paddingBottom: "clamp(48px,7vw,72px)" }}>
        <DarkPanel
          eyebrow="وعد بهجة"
          statement="لا نختصر الكتاب — نعيد بناءه، ثم نسلّمك خطوة تطبّقها اليوم"
        />
      </section>
    </>
  );
}
