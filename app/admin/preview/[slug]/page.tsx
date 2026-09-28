import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import { SummaryReader } from "@/components/summary-reader/summary-reader";
import type { Summary } from "@/lib/types";

export const dynamic = "force-dynamic";

/* معاينة الأدمن: نفس عارض /s/[slug] بالأقسام العشرة كلها، وفوقه شريط صغير
   بالحالة ورابط العودة فقط — لا تصميم معاينة منفصل */
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const email = await getAdminEmail();
  if (!email) notFound();

  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("bh_summaries")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  const s = data as Summary | null;
  if (!s) notFound();

  // اسم القسم ومساره للترويسة والخاتمة — قراءة فقط
  let category: { slug: string; name_ar: string } | null = null;
  if (s.category_id) {
    const { data: cat } = await supabase
      .from("bh_categories")
      .select("slug, name_ar")
      .eq("id", s.category_id)
      .maybeSingle();
    category = (cat as { slug: string; name_ar: string } | null) ?? null;
  }

  return (
    <>
      <div className="sr-admin-bar">
        <div className="sr-wrap sr-admin-bar-in">
          <p>معاينة الأدمن · الحالة: {s.status === "published" ? "منشور" : "مسودة"}</p>
          <Link href="/admin" className="textlink">العودة إلى اللوحة</Link>
        </div>
      </div>
      <SummaryReader
        hero={{
          slug: s.slug,
          titleAr: s.book_title_ar,
          titleEn: s.book_title_en,
          author: s.author,
          coverUrl: s.cover_url,
          readingMinutes: s.reading_minutes,
          rating: s.rating_value,
          category,
        }}
        free={s.content_free || {}}
        full={s.content_full ?? null}
        locked={false}
        access={null}
      />
    </>
  );
}
