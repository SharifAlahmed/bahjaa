import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import {
  structuralIssues, toEditorValues, validateStored, type StoredSummary,
} from "@/lib/admin/summary-content";
import { EditorForm } from "./editor-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تحرير ملخص",
  robots: { index: false, follow: false },
};

type Row = StoredSummary & {
  id: string; status: "draft" | "published"; first_published_at: string | null; updated_at: string;
};

/* محرّر الملخصات — الخطوة ٢: المسودات التي لم تُنشر قط فقط. المنشور يُحرَّر في الخطوة ٣. */
export default async function SummaryEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ publish?: string }>;
}) {
  const email = await getAdminEmail();
  if (!email) notFound();

  const { id } = await params;
  const { publish } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("bh_summaries")
    .select(
      "id, slug, book_title_ar, book_title_en, author, category_id, reading_minutes, content_free, content_full, status, first_published_at, updated_at",
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

  const everPublished = row.status !== "draft" || !!row.first_published_at;
  if (everPublished) {
    const issues = publish === "blocked" ? validateStored(row, categories.map((c) => c.id)) : [];
    return (
      <div className="adm-editor">
        <div className="adm-card">
          <h1 className="adm-h1">{row.book_title_ar}</h1>
          <p className="adm-hint">
            هذا الملخص نُشر من قبل. تحرير الملخصات المنشورة يأتي في الخطوة التالية من لوحة التحكم.
          </p>
          {issues.length > 0 && (
            <div className="adm-notice" role="alert">
              <p>لم يُنشر الملخص لأن بياناته المخزَّنة لا تجتاز التحقق:</p>
              <ul>
                {issues.map((i) => <li key={i.field + i.message}>{i.message}</li>)}
              </ul>
            </div>
          )}
          <p style={{ marginBlockStart: 16 }}>
            <Link href="/admin" className="adm-btn">العودة إلى اللوحة</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <EditorForm
      id={row.id}
      initialValues={toEditorValues(row)}
      initialUpdatedAt={row.updated_at}
      categories={categories}
      storedIssues={structuralIssues(row.content_free, row.content_full)}
      publishBlocked={publish === "blocked"}
    />
  );
}
