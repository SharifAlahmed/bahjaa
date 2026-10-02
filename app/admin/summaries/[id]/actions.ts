"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import { publishSummary } from "@/app/admin/actions";
import {
  mergeContent, parseEditorValues, sizeIssue, toEditorValues, validateValues,
  type EditorValues, type Issue, type StoredSummary,
} from "@/lib/admin/summary-content";

export type SaveResult =
  | { ok: true; updatedAt: string; values: EditorValues }
  | { ok: false; kind: "validation"; issues: Issue[] }
  | { ok: false; kind: "conflict" | "locked" | "error"; message: string };

type DraftRow = StoredSummary & {
  id: string; status: string; first_published_at: string | null; updated_at: string;
};

const COLUMNS =
  "id, slug, book_title_ar, book_title_en, author, category_id, reading_minutes, content_free, content_full, status, first_published_at, updated_at";

/** حفظ مسودة لم تُنشر قط — يكتب على صف bh_summaries مباشرة بجلسة الأدمن (بلا مفتاح خدمة).
    مشغّل قاعدة البيانات يحفظ نسخة من المحتوى السابق تلقائياً. */
export async function saveDraftSummary(
  id: string,
  input: unknown,
  expectedUpdatedAt: string,
): Promise<SaveResult> {
  const email = await getAdminEmail();
  if (!email) return { ok: false, kind: "error", message: "غير مصرّح." };

  const values = parseEditorValues(input);
  if (!values) return { ok: false, kind: "error", message: "البيانات المرسلة غير صالحة." };

  const supabase = await createClient();
  const { data, error } = await supabase.from("bh_summaries").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) return { ok: false, kind: "error", message: `تعذّر قراءة الملخص: ${error.message}` };
  const row = data as unknown as DraftRow | null;
  if (!row) return { ok: false, kind: "error", message: "الملخص غير موجود." };

  if (row.status !== "draft" || row.first_published_at)
    return { ok: false, kind: "locked", message: "هذا الملخص نُشر من قبل. تحرير المنشور غير متاح في هذه الخطوة." };
  if (row.updated_at !== expectedUpdatedAt)
    return { ok: false, kind: "conflict", message: "تغيّر هذا الملخص بعد فتح المحرّر. أعد تحميل الصفحة قبل الحفظ." };

  const { data: cats } = await supabase.from("bh_categories").select("id");
  const categoryIds = ((cats || []) as { id: string }[]).map((c) => c.id);

  const issues = validateValues(values, categoryIds);
  const merged = mergeContent(row.content_free, row.content_full, values);
  const size = sizeIssue(merged.content_free, merged.content_full);
  if (size) issues.push(size);
  if (issues.length) return { ok: false, kind: "validation", issues };

  const { data: saved, error: saveError } = await supabase
    .from("bh_summaries")
    .update({
      slug: values.meta.slug,
      book_title_ar: values.meta.book_title_ar.trim(),
      book_title_en: values.meta.book_title_en.trim() || null,
      author: values.meta.author.trim() || null,
      category_id: values.meta.category_id,
      reading_minutes: Number(values.meta.reading_minutes),
      content_free: merged.content_free,
      content_full: merged.content_full,
    })
    .eq("id", id)
    .eq("status", "draft")
    .is("first_published_at", null)
    .eq("updated_at", expectedUpdatedAt)
    .select(COLUMNS)
    .maybeSingle();

  if (saveError) {
    if (saveError.code === "23505")
      return {
        ok: false, kind: "validation",
        issues: [{ field: "meta.slug", section: "basic", message: "هذا المسار مستخدم لملخص آخر." }],
      };
    return { ok: false, kind: "error", message: `تعذّر الحفظ: ${saveError.message}` };
  }
  const savedRow = saved as unknown as DraftRow | null;
  if (!savedRow)
    return { ok: false, kind: "conflict", message: "تغيّر هذا الملخص أثناء الحفظ. أعد تحميل الصفحة." };

  revalidatePath("/admin");
  return { ok: true, updatedAt: savedRow.updated_at, values: toEditorValues(savedRow) };
}

/** النشر من المحرّر: نفس إجراء النشر (بتحققه من الصف المخزَّن) ثم العودة إلى اللوحة */
export async function publishFromEditor(id: string, slug: string) {
  await publishSummary(id, slug);
  redirect("/admin");
}
