import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SummaryCard } from "@/components/SummaryCard";
import { BookmarkButtons } from "@/components/bahjaa/bookmark-buttons";
import { type CategorySlug } from "@/components/bahjaa/cover";
import { countLabel } from "@/components/bahjaa/format";
import { categoryQuestion } from "@/lib/category-presentation";
import { LIST_COLUMNS, type Category, type SummaryListItem } from "@/lib/types";

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
    alternates: { canonical: `/c/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // أعلى تقييم قيمة في بهجة هو نقطة البداية. عند غياب التقييم نرجع للأحدث.
  const { data } = await supabase
    .from("bh_summaries")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .eq("category_id", category.id)
    .order("rating_value", { ascending: false, nullsFirst: false })
    .order("published_at", { ascending: false });

  const list = (data || []) as SummaryListItem[];
  const [featured, ...rest] = list;
  const catSlug = category.slug as CategorySlug;
  const question = categoryQuestion(category.slug, category.name_ar, category.description_ar);

  const bmMap = new Map<string, "want_to_read" | "liked">();
  if (user) {
    const { data: bms } = await supabase
      .from("bh_bookmarks")
      .select("summary_id, status")
      .eq("user_id", user.id);
    for (const b of (bms ?? []) as Array<{ summary_id: string; status: "want_to_read" | "liked" }>) {
      bmMap.set(b.summary_id, b.status);
    }
  }

  const card = (s: SummaryListItem, priority = false) => (
    <SummaryCard
      key={s.id}
      id={s.id}
      coverUrl={s.cover_url}
      publishedAt={s.published_at}
      rating={s.rating_value}
      priority={priority}
      slug={s.slug}
      title={s.book_title_ar}
      author={s.author || ""}
      category={catSlug}
      categoryLabel={category.name_ar}
      readingMinutes={s.reading_minutes || 8}
      promise={s.content_free?.s1?.problem}
      bookmarkSlot={
        <BookmarkButtons
          summaryId={s.id}
          initialStatus={bmMap.get(s.id) ?? null}
        />
      }
    />
  );

  return (
    <main className="category-page">
      <section className="wrap category-hero">
        <Link href="/categories" className="category-back">الأقسام</Link>
        <p className="eyebrow">قسم {category.name_ar}</p>
        <h1 className="category-title">{category.name_ar}</h1>
        <p className="category-question">{question}</p>
        {category.description_ar && category.description_ar !== question && (
          <p className="category-description">{category.description_ar}</p>
        )}
        <p className="category-meta">{countLabel(list.length)}</p>
      </section>

      {list.length === 0 ? (
        <section className="wrap category-empty">
          <h2>قريبًا في {category.name_ar}</h2>
          <p>نعمل على إضافة معرفة منتقاة لهذا القسم.</p>
          <Link href="/categories" className="textlink">تصفّح الأقسام الأخرى</Link>
        </section>
      ) : (
        <>
          <section className="category-start">
            <div className="wrap category-start-grid">
              <div className="category-start-copy">
                <p className="eyebrow">ابدأ من هنا</p>
                <h2>نقطة بداية واحدة، بدل أن تحتار بين كل الخيارات.</h2>
                <p>
                  {typeof featured.rating_value === "number"
                    ? "اخترنا لك الملخص الأعلى تقييمًا للقيمة في هذا القسم ليكون مدخلًا عمليًا للبدء."
                    : "اخترنا لك نقطة بداية تساعدك على الدخول إلى هذا القسم قبل استكشاف بقية الملخصات."}
                </p>
                <span className="category-open-note">يمكنك قراءة الأقسام الأربعة الأولى من الملخص بلا تسجيل.</span>
              </div>
              <div className="category-start-card">{card(featured, true)}</div>
            </div>
          </section>

          {rest.length > 0 && (
            <section className="wrap category-library">
              <div className="category-library-head">
                <div>
                  <p className="eyebrow">للتعمّق أكثر</p>
                  <h2>استكشف بقية ملخصات {category.name_ar}</h2>
                </div>
                <p>{countLabel(rest.length)}</p>
              </div>
              <div className="shelf">
                {rest.map((s) => card(s))}
              </div>
            </section>
          )}

          <div className="wrap category-footer-link">
            <Link href="/categories" className="textlink">العودة إلى كل الأقسام</Link>
          </div>
        </>
      )}
    </main>
  );
}
