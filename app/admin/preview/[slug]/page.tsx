import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import { SummaryReader } from "@/components/summary-reader/summary-reader";
import type { ContentFree, ContentFull, Summary } from "@/lib/types";

export const dynamic = "force-dynamic";

type Row = Summary & { first_published_at: string | null };

/** الحقول التي قد تأتي من المسودة أو من نسخة سابقة بدل النسخة الحية */
type Shown = {
  book_title_ar: string; book_title_en: string | null; author: string | null;
  category_id: string | null; reading_minutes: number | null; cover_url: string | null;
  content_free: ContentFree; content_full: ContentFull | null;
};

const dateFormat = new Intl.DateTimeFormat("ar-u-nu-arab", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bahrain",
});

/* معاينة الأدمن: نفس عارض /s/[slug] بالأقسام العشرة كلها، وفوقه شريط صغير بالحالة — لا تصميم معاينة منفصل.
   — الافتراضي: التعديلات غير المنشورة إن وُجدت، وإلا النسخة الحية.
   — ?v=live: النسخة الحية دائماً.
   — ?version=<id>: نسخة سابقة من السجل (تخص هذا الملخص نفسه فقط). */
export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ v?: string; version?: string }>;
}) {
  const email = await getAdminEmail();
  if (!email) notFound();

  const { slug } = await params;
  const { v, version } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("bh_summaries")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  const s = data as Row | null;
  if (!s) notFound();

  const live: Shown = {
    book_title_ar: s.book_title_ar, book_title_en: s.book_title_en, author: s.author,
    category_id: s.category_id, reading_minutes: s.reading_minutes, cover_url: s.cover_url,
    content_free: s.content_free || {}, content_full: s.content_full ?? null,
  };
  let shown = live;
  let mode: "live" | "draft" | "version" = "live";
  let label = `الحالة: ${s.status === "published" ? "منشور" : "مسودة"}`;
  let hasDraft = false;

  if (version !== undefined) {
    // نسخة سابقة: يجب أن تكون رقماً صحيحاً وأن تخص هذا الملخص نفسه
    if (!/^\d+$/.test(version)) notFound();
    const { data: ver } = await supabase
      .from("bh_summary_versions")
      .select("id, summary_id, created_at, snapshot")
      .eq("id", Number(version))
      .maybeSingle();
    const row = ver as { summary_id: string; created_at: string; snapshot: Partial<Shown> } | null;
    if (!row || row.summary_id !== s.id) notFound();
    const snap = row.snapshot;
    shown = {
      book_title_ar: snap.book_title_ar ?? "", book_title_en: snap.book_title_en ?? null, author: snap.author ?? null,
      category_id: snap.category_id ?? null, reading_minutes: snap.reading_minutes ?? null, cover_url: snap.cover_url ?? null,
      content_free: snap.content_free || {}, content_full: snap.content_full ?? null,
    };
    mode = "version";
    label = `نسخة سابقة · استُبدلت في ${dateFormat.format(new Date(row.created_at))} · غير منشورة`;
  } else if (s.first_published_at) {
    const { data: draft } = await supabase
      .from("bh_summary_drafts")
      .select("book_title_ar, book_title_en, author, category_id, reading_minutes, cover_url, content_free, content_full")
      .eq("summary_id", s.id)
      .maybeSingle();
    const d = draft as Shown | null;
    hasDraft = !!d;
    if (d && v !== "live") {
      shown = { ...d, content_free: d.content_free || {}, content_full: d.content_full ?? null };
      mode = "draft";
      label = "تعديلات غير منشورة · النسخة الحية لم تتغيّر";
    } else if (d) {
      label = "النسخة الحية الحالية · توجد تعديلات غير منشورة";
    }
  }

  // اسم القسم ومساره للترويسة والخاتمة — قراءة فقط
  let category: { slug: string; name_ar: string } | null = null;
  if (shown.category_id) {
    const { data: cat } = await supabase
      .from("bh_categories")
      .select("slug, name_ar")
      .eq("id", shown.category_id)
      .maybeSingle();
    category = (cat as { slug: string; name_ar: string } | null) ?? null;
  }

  // نسخة محلية من s10.value: التقييم الظاهر في الترويسة يتبع ما يُعرض، لا النسخة الحية
  const rating =
    mode === "live" ? s.rating_value : typeof shown.content_full?.s10?.value === "number" ? shown.content_full.s10.value : null;

  return (
    <>
      <div className="sr-admin-bar">
        <div className="sr-wrap sr-admin-bar-in">
          <p>معاينة الأدمن · {label}</p>
          <p className="sr-admin-links">
            {mode === "draft" ? <Link href={`/admin/preview/${s.slug}?v=live`} className="textlink">عرض النسخة الحية</Link> : null}
            {mode !== "draft" && hasDraft ? <Link href={`/admin/preview/${s.slug}`} className="textlink">عرض التعديلات</Link> : null}
            {mode === "version" ? <Link href={`/admin/preview/${s.slug}?v=live`} className="textlink">عرض النسخة الحية</Link> : null}
            <Link href={`/admin/summaries/${s.id}`} className="textlink">المحرّر</Link>
            <Link href="/admin" className="textlink">اللوحة</Link>
          </p>
        </div>
      </div>
      <SummaryReader
        hero={{
          slug: s.slug,
          titleAr: shown.book_title_ar,
          titleEn: shown.book_title_en,
          author: shown.author,
          coverUrl: shown.cover_url,
          readingMinutes: shown.reading_minutes,
          rating,
          category,
        }}
        free={shown.content_free}
        full={shown.content_full}
        locked={false}
        access={null}
        trackProgress={false}
      />
    </>
  );
}
