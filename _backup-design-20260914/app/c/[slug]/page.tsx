import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SummaryCard from "@/components/summary-card";
import { LIST_COLUMNS, type Category, type SummaryListItem } from "@/lib/types";

// تقرأ حالة الجلسة من الكوكيز — يجب أن تُبنى عند كل طلب، بلا تخزين مؤقت
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getCategory(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bh_categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data as Category | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCategory(slug);
  if (!c) return { title: "قسم غير موجود" };
  return {
    title: c.name_ar,
    description: c.description_ar || `ملخصات بهجة في ${c.name_ar}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("bh_summaries")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .eq("category_id", category.id)
    .order("published_at", { ascending: false });

  const list = (data || []) as SummaryListItem[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="bh-sec-title text-bh-primary-dark">{category.name_ar}</h1>
      {category.description_ar && (
        <p className="bh-body mt-2 max-w-2xl">{category.description_ar}</p>
      )}

      {list.length === 0 ? (
        <div className="bh-card p-10 text-center mt-8">
          <p className="bh-card-label mb-2">لا توجد ملخصات في هذا القسم بعد</p>
          <p className="bh-sub">نعمل عليها.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 mt-8">
          {list.map((s) => (
            <SummaryCard key={s.id} s={s} />
          ))}
        </div>
      )}
    </div>
  );
}
