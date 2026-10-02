import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import {
  structuralIssues, toEditorValues, type SectionId, type StoredSummary,
} from "@/lib/admin/summary-content";
import {
  changedSections, contentChangingVersions, planPublish, type EditableContent,
} from "@/lib/admin/publish-flow";
import { EditorForm, type PublishedInfo } from "./editor-form";
import { VersionHistory, type VersionItem } from "./version-history";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تحرير ملخص",
  robots: { index: false, follow: false },
};

type Row = StoredSummary & {
  id: string; status: "draft" | "published";
  first_published_at: string | null; published_at: string | null;
  updated_at: string; cover_url: string | null;
};

type DraftRow = {
  book_title_ar: string; book_title_en: string | null; author: string | null;
  category_id: string | null; reading_minutes: number | null; cover_url: string | null;
  content_free: unknown; content_full: unknown; base_updated_at: string; updated_at: string;
};

type VersionRow = { id: number; reason: "update" | "delete"; created_at: string; created_by: string | null; snapshot: unknown };

const dateFormat = new Intl.DateTimeFormat("ar-u-nu-arab", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bahrain",
});
const fmt = (iso: string | null) => (iso ? dateFormat.format(new Date(iso)) : "—");

/* محرّر الملخصات.
   — لم يُنشر قط: حفظ مباشر على الصف (الخطوة ٢).
   — سبق نشره: كل تعديل في bh_summary_drafts حتى «نشر التعديلات» (الخطوة ٣). */
export default async function SummaryEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ publish?: string; done?: string }>;
}) {
  const email = await getAdminEmail();
  if (!email) notFound();

  const { id } = await params;
  const { publish, done } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("bh_summaries")
    .select(
      "id, slug, book_title_ar, book_title_en, author, category_id, reading_minutes, content_free, content_full, status, first_published_at, published_at, updated_at, cover_url",
    )
    .eq("id", id)
    .maybeSingle();
  const row = data as unknown as Row | null;
  if (!row) notFound();

  const { data: cats } = await supabase
    .from("bh_categories")
    .select("id, name_ar")
    .order("sort_order");
  const categories = (cats || []) as { id: string; name_ar: string }[];

  // ── لم يُنشر قط: مسار الخطوة ٢ كما هو ──
  if (!row.first_published_at) {
    return (
      <EditorForm
        id={row.id}
        initialValues={toEditorValues(row)}
        initialUpdatedAt={row.updated_at}
        categories={categories}
        storedIssues={structuralIssues(row.content_free, row.content_full)}
        publishBlocked={publish === "blocked"}
        published={null}
      />
    );
  }

  // ── سبق نشره: المسودة إن وُجدت، وإلا النسخة الحية (بلا كتابة عند الفتح) ──
  const [{ data: draftData }, { data: versionData }] = await Promise.all([
    supabase
      .from("bh_summary_drafts")
      .select("book_title_ar, book_title_en, author, category_id, reading_minutes, cover_url, content_free, content_full, base_updated_at, updated_at")
      .eq("summary_id", id)
      .maybeSingle(),
    supabase
      .from("bh_summary_versions")
      .select("id, reason, created_at, created_by, snapshot")
      .eq("summary_id", id)
      .gte("created_at", row.first_published_at)
      .order("id", { ascending: false })
      .limit(60),
  ]);
  const draft = draftData as unknown as DraftRow | null;
  // أحدث ٦٠ نسخة، مرتبة تصاعدياً
  const versions = ((versionData || []) as unknown as VersionRow[]).reverse();
  const after = (iso: string, than: string) => Date.parse(iso) > Date.parse(than);

  // النسخ التي غيّر استبدالُها محتوى المحرّر (لا الغلاف وحده)
  const contentVersions = contentChangingVersions(versions, row);
  const lastContentChange = contentVersions.length ? contentVersions[contentVersions.length - 1].created_at : null;

  // هل تغيّر محتوى النسخة الحية بعد بدء المسودة؟ (تنبيه مبكر — القرار الفعلي عند النشر)
  let liveChanged: SectionId[] | null = null;
  if (draft && draft.base_updated_at !== row.updated_at) {
    const base = versions.find((v) => after(v.created_at, draft.base_updated_at))?.snapshot as EditableContent | undefined;
    const plan = planPublish(row, draft, base ?? null);
    if (plan.kind === "conflict") liveChanged = plan.changed;
  }

  const shown: StoredSummary = draft
    ? {
        slug: row.slug,
        book_title_ar: draft.book_title_ar, book_title_en: draft.book_title_en, author: draft.author,
        category_id: draft.category_id, reading_minutes: draft.reading_minutes,
        content_free: draft.content_free, content_full: draft.content_full,
      }
    : row;

  const published: PublishedInfo = {
    isLive: row.status === "published",
    slug: row.slug,
    firstPublished: fmt(row.first_published_at),
    lastPublishedUpdate: fmt(lastContentChange ?? row.published_at ?? row.first_published_at),
    hasDraft: !!draft,
    draftUpdatedAt: draft?.updated_at ?? null,
    liveUpdatedAt: row.updated_at,
    liveChanged,
    done: done === "published" || done === "discarded" || done === "restored" ? done : null,
  };

  const history: VersionItem[] = [...contentVersions].reverse().map((v) => ({
    id: v.id,
    when: fmt(v.created_at),
    by: v.created_by && v.created_by.includes("@") ? v.created_by : "النظام",
    reason: v.reason,
    changed: changedSections(v.snapshot as EditableContent, row),
  }));

  return (
    <>
      <EditorForm
        id={row.id}
        initialValues={toEditorValues(shown)}
        initialUpdatedAt={row.updated_at}
        categories={categories}
        storedIssues={structuralIssues(shown.content_free, shown.content_full)}
        publishBlocked={publish === "blocked"}
        published={published}
      />
      <VersionHistory summaryId={row.id} slug={row.slug} hasDraft={!!draft} items={history} />
    </>
  );
}
