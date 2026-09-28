import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CategoryRow, CATEGORY_OUTCOMES } from "@/components/bahjaa/category-row";
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
      <section className="wrap cats-intro">
        <p className="eyebrow">ستة أقسام</p>
        <h1 className="h-sec cats-title">
          اختر القسم الذي يشبه سؤالك هذا الأسبوع
        </h1>
        <p className="read col cats-lede">
          كل قسم يجمع الكتب التي تعالج نوعاً واحداً من الأسئلة. الأقسام الأربعة الأولى من كل
          ملخص مفتوحة بلا تسجيل.
        </p>
        <p className="cats-note">ابدأ بالسؤال الذي يشغلك، لا باسم الكتاب الذي تبحث عنه.</p>
      </section>

      <nav className="wrap cats-list bh-anchor" id="categories" aria-label="أقسام المكتبة">
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

      {/* اللوحة الداكنة الوحيدة في هذه الصفحة: خاتمة تحريرية موجزة */}
      <section className="wrap cats-close" aria-labelledby="cats-close-title">
        <div className="dark-panel">
          <h2 className="statement" id="cats-close-title">
            لا تعرف من أين تبدأ؟
            <br />
            ابدأ بالسؤال الأقرب إليك.
          </h2>
          <p className="cats-close-sub">كل قسم هو نقطة بداية لمسار معرفة يمكنك استخدامه.</p>
        </div>
      </section>
    </>
  );
}
