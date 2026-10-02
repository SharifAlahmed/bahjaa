"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import { publishSummary } from "@/app/admin/actions";
import {
  mergeContent, parseEditorValues, sizeIssue, toEditorValues, validateStored, validateValues,
  type EditorValues, type Issue, type SectionId, type StoredSummary,
} from "@/lib/admin/summary-content";
import { changedSections, planPublish, type EditableContent } from "@/lib/admin/publish-flow";

export type SaveResult =
  | { ok: true; updatedAt: string; values: EditorValues }
  | { ok: false; kind: "validation"; issues: Issue[] }
  | { ok: false; kind: "conflict" | "locked" | "error"; message: string };

type LiveRow = StoredSummary & {
  id: string; status: string; first_published_at: string | null; updated_at: string; cover_url: string | null;
};

type DraftRow = {
  summary_id: string;
  book_title_ar: string; book_title_en: string | null; author: string | null;
  category_id: string | null; reading_minutes: number | null; cover_url: string | null;
  content_free: unknown; content_full: unknown;
  base_updated_at: string; updated_at: string;
};

const COLUMNS =
  "id, slug, book_title_ar, book_title_en, author, category_id, reading_minutes, content_free, content_full, status, first_published_at, updated_at, cover_url";
const DRAFT_COLUMNS =
  "summary_id, book_title_ar, book_title_en, author, category_id, reading_minutes, cover_url, content_free, content_full, base_updated_at, updated_at";

async function admin(): Promise<SupabaseClient | null> {
  const email = await getAdminEmail();
  return email ? createClient() : null;
}

async function loadLive(supabase: SupabaseClient, id: string): Promise<LiveRow | null> {
  const { data } = await supabase.from("bh_summaries").select(COLUMNS).eq("id", id).maybeSingle();
  return data as unknown as LiveRow | null;
}

async function loadDraft(supabase: SupabaseClient, id: string): Promise<DraftRow | null> {
  const { data } = await supabase.from("bh_summary_drafts").select(DRAFT_COLUMNS).eq("summary_id", id).maybeSingle();
  return data as unknown as DraftRow | null;
}

async function categoryIds(supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase.from("bh_categories").select("id");
  return ((data || []) as { id: string }[]).map((c) => c.id);
}

/** المسودة بشكل StoredSummary — المسار يبقى مسار النسخة الحية (مقفول) */
function draftAsStored(draft: DraftRow, slug: string): StoredSummary {
  return {
    slug,
    book_title_ar: draft.book_title_ar, book_title_en: draft.book_title_en, author: draft.author,
    category_id: draft.category_id, reading_minutes: draft.reading_minutes,
    content_free: draft.content_free, content_full: draft.content_full,
  };
}

// ══ الخطوة ٢: مسودة لم تُنشر قط — حفظ مباشر على صف bh_summaries ══════════

/** حفظ مسودة لم تُنشر قط — يكتب على صف bh_summaries مباشرة بجلسة الأدمن (بلا مفتاح خدمة).
    مشغّل قاعدة البيانات يحفظ نسخة من المحتوى السابق تلقائياً. */
export async function saveDraftSummary(
  id: string,
  input: unknown,
  expectedUpdatedAt: string,
): Promise<SaveResult> {
  const supabase = await admin();
  if (!supabase) return { ok: false, kind: "error", message: "غير مصرّح." };

  const values = parseEditorValues(input);
  if (!values) return { ok: false, kind: "error", message: "البيانات المرسلة غير صالحة." };

  const row = await loadLive(supabase, id);
  if (!row) return { ok: false, kind: "error", message: "الملخص غير موجود." };

  if (row.status !== "draft" || row.first_published_at)
    return { ok: false, kind: "locked", message: "هذا الملخص نُشر من قبل. تعديلاته تمرّ عبر مسودة ثم نشر." };
  if (row.updated_at !== expectedUpdatedAt)
    return { ok: false, kind: "conflict", message: "تغيّر هذا الملخص بعد فتح المحرّر. أعد تحميل الصفحة قبل الحفظ." };

  const issues = validateValues(values, await categoryIds(supabase));
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
  const savedRow = saved as unknown as LiveRow | null;
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

// ══ الخطوة ٣: ملخص سبق نشره — كل تعديل يذهب إلى bh_summary_drafts ════════
// صف bh_summaries لا يُكتب إلا داخل bh_publish_summary_draft() عند «نشر التعديلات».

export type EditsSaveResult =
  | { ok: true; draftUpdatedAt: string; values: EditorValues }
  | { ok: false; kind: "validation"; issues: Issue[] }
  | { ok: false; kind: "conflict" | "error"; message: string };

/**
 * حفظ تعديلات ملخص سبق نشره في مسودته.
 * أول حفظ ينشئ المسودة وأساسها هو updated_at للنسخة الحية كما حُمّلت مع المحرّر (لا وقت الحفظ).
 * الحفظ التالي يشترط updated_at للمسودة كما حُمّلت (حماية من تبويبين).
 */
export async function saveSummaryEdits(
  id: string,
  input: unknown,
  expected: { draftUpdatedAt: string | null; liveUpdatedAt: string },
): Promise<EditsSaveResult> {
  const supabase = await admin();
  if (!supabase) return { ok: false, kind: "error", message: "غير مصرّح." };

  const parsed = parseEditorValues(input);
  if (!parsed) return { ok: false, kind: "error", message: "البيانات المرسلة غير صالحة." };

  const live = await loadLive(supabase, id);
  if (!live) return { ok: false, kind: "error", message: "الملخص غير موجود." };
  if (!live.first_published_at)
    return { ok: false, kind: "error", message: "هذا الملخص لم يُنشر قط؛ يُحفظ مباشرة كمسودة." };

  // المسار مقفول لكل ما سبق نشره: نتجاهل أي قيمة تصل من المتصفح
  const values: EditorValues = { ...parsed, meta: { ...parsed.meta, slug: live.slug } };

  const draft = await loadDraft(supabase, id);
  if (draft && expected.draftUpdatedAt !== draft.updated_at)
    return { ok: false, kind: "conflict", message: "تغيّرت المسودة في مكان آخر بعد فتح المحرّر. أعد تحميل الصفحة قبل الحفظ." };
  if (!draft && expected.draftUpdatedAt !== null)
    return { ok: false, kind: "conflict", message: "أُزيلت المسودة في مكان آخر. أعد تحميل الصفحة." };
  if (!draft && live.updated_at !== expected.liveUpdatedAt)
    return { ok: false, kind: "conflict", message: "تغيّرت النسخة الحية بعد فتح المحرّر. أعد تحميل الصفحة لتبدأ من النسخة الحالية." };

  const issues = validateValues(values, await categoryIds(supabase));
  const base = draft ?? live;
  const merged = mergeContent(base.content_free, base.content_full, values);
  const size = sizeIssue(merged.content_free, merged.content_full);
  if (size) issues.push(size);
  if (issues.length) return { ok: false, kind: "validation", issues };

  const fields = {
    book_title_ar: values.meta.book_title_ar.trim(),
    book_title_en: values.meta.book_title_en.trim() || null,
    author: values.meta.author.trim() || null,
    category_id: values.meta.category_id,
    reading_minutes: Number(values.meta.reading_minutes),
    content_free: merged.content_free,
    content_full: merged.content_full,
  };

  const write = draft
    ? supabase.from("bh_summary_drafts").update(fields)
        .eq("summary_id", id).eq("updated_at", draft.updated_at)
    : supabase.from("bh_summary_drafts").insert({
        summary_id: id, ...fields,
        cover_url: live.cover_url,
        base_updated_at: expected.liveUpdatedAt,   // الأساس = ما حُمّل مع المحرّر
      });
  const { data: saved, error } = await write.select(DRAFT_COLUMNS).maybeSingle();

  if (error) {
    if (error.code === "23505")
      return { ok: false, kind: "conflict", message: "أُنشئت مسودة لهذا الملخص في مكان آخر. أعد تحميل الصفحة." };
    return { ok: false, kind: "error", message: `تعذّر الحفظ: ${error.message}` };
  }
  const savedDraft = saved as unknown as DraftRow | null;
  if (!savedDraft)
    return { ok: false, kind: "conflict", message: "تغيّرت المسودة أثناء الحفظ. أعد تحميل الصفحة." };

  revalidatePath("/admin");
  return { ok: true, draftUpdatedAt: savedDraft.updated_at, values: toEditorValues(draftAsStored(savedDraft, live.slug)) };
}

export type PublishEditsResult =
  | { ok: true }
  | { ok: false; kind: "validation"; issues: Issue[] }
  /** draftUpdatedAt: توقيت المسودة الحالي — يتغيّر إن أُعيد تأسيسها قبل أن يوقف الحارس النشر */
  | { ok: false; kind: "conflict"; liveUpdatedAt: string; changed: SectionId[]; again: boolean; draftUpdatedAt: string }
  | { ok: false; kind: "stale" | "error"; message: string };

/**
 * نشر تعديلات ملخص سبق نشره.
 * - overwrite = null: النشر العادي. تغيّر غير محتوى المحرّر (غلاف/تمييز/حالة) يُعالَج بإعادة تأسيس
 *   المسودة ثم نشر عادي؛ تغيّر المحتوى نفسه يوقف النشر ويعيد تعارضاً للأدمن.
 * - overwrite = { liveUpdatedAt }: الأدمن اختار صراحةً «نشر تعديلاتي فوق النسخة الحية» بعد أن رأى
 *   النسخة الحية بهذا التوقيت. إن تغيّرت بعده نطلب التأكيد من جديد.
 * في الحالتين يُستدعى bh_publish_summary_draft بلا force: حارس التعارض في قاعدة البيانات يبقى فعّالاً
 * حتى لحظة النشر نفسها، ولا يُكتب فوق تغيير أحدث بصمت.
 */
export async function publishSummaryEdits(
  id: string,
  expectedDraftUpdatedAt: string,
  overwrite: { liveUpdatedAt: string } | null,
): Promise<PublishEditsResult> {
  const supabase = await admin();
  if (!supabase) return { ok: false, kind: "error", message: "غير مصرّح." };

  const live = await loadLive(supabase, id);
  if (!live) return { ok: false, kind: "error", message: "الملخص غير موجود." };
  const draft = await loadDraft(supabase, id);
  if (!draft) return { ok: false, kind: "stale", message: "لا توجد تعديلات غير منشورة. أعد تحميل الصفحة." };
  if (draft.updated_at !== expectedDraftUpdatedAt)
    return { ok: false, kind: "stale", message: "تغيّرت المسودة في مكان آخر. أعد تحميل الصفحة قبل النشر." };

  // نفس تحقق الخطوة ٢: أخطاء الشكل + اكتمال النشر، على المسودة المخزَّنة كما هي
  const issues = validateStored(draftAsStored(draft, live.slug), await categoryIds(supabase));
  if (issues.length) return { ok: false, kind: "validation", issues };

  let rebase: { coverUrl: string | null; baseUpdatedAt: string } | null = null;

  if (overwrite) {
    // قرار صريح بالكتابة فوق النسخة الحية — يسري فقط على النسخة التي رآها الأدمن
    if (live.updated_at !== overwrite.liveUpdatedAt) {
      const changed = await changedSinceBase(supabase, id, draft.base_updated_at, live);
      return { ok: false, kind: "conflict", liveUpdatedAt: live.updated_at, changed, again: true, draftUpdatedAt: draft.updated_at };
    }
    rebase = { coverUrl: live.cover_url, baseUpdatedAt: live.updated_at };
  } else {
    const baseSnapshot = await firstSnapshotAfter(supabase, id, draft.base_updated_at);
    const plan = planPublish(live, draft, baseSnapshot);
    if (plan.kind === "conflict")
      return { ok: false, kind: "conflict", liveUpdatedAt: plan.liveUpdatedAt, changed: plan.changed, again: false, draftUpdatedAt: draft.updated_at };
    if (plan.kind === "rebase") rebase = { coverUrl: plan.coverUrl, baseUpdatedAt: plan.baseUpdatedAt };
  }

  if (rebase) {
    const { data: rebased, error } = await supabase
      .from("bh_summary_drafts")
      .update({ cover_url: rebase.coverUrl, base_updated_at: rebase.baseUpdatedAt })
      .eq("summary_id", id)
      .eq("updated_at", draft.updated_at)
      .select("summary_id")
      .maybeSingle();
    if (error) return { ok: false, kind: "error", message: `تعذّر تجهيز المسودة للنشر: ${error.message}` };
    if (!rebased) return { ok: false, kind: "stale", message: "تغيّرت المسودة أثناء النشر. أعد تحميل الصفحة." };
  }

  // النشر الذرّي: لقطة للنسخة الحية (بالمشغّل) + استبدال المحتوى + حذف المسودة، في معاملة واحدة
  const { error: rpcError } = await supabase.rpc("bh_publish_summary_draft", { p_summary_id: id, p_force: false });
  if (rpcError) {
    if (rpcError.code === "40001") {
      // تغيّرت النسخة الحية بين الفحص والنشر: الحارس أوقفنا. نعيد التعارض بحالته الجديدة.
      const fresh = await loadLive(supabase, id);
      const freshDraft = await loadDraft(supabase, id);
      if (!fresh || !freshDraft) return { ok: false, kind: "stale", message: "تغيّر الملخص أثناء النشر. أعد تحميل الصفحة." };
      // أساس المسودة أُعيد تأسيسه قبل أن يوقفنا الحارس، فنقارن بما كان عليه محتوى النسخة الحية حينها
      const changed = changedSections(live, fresh);
      return {
        ok: false, kind: "conflict", liveUpdatedAt: fresh.updated_at, changed, again: !!overwrite,
        draftUpdatedAt: freshDraft.updated_at,
      };
    }
    return { ok: false, kind: "error", message: `تعذّر النشر: ${rpcError.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath(`/s/${live.slug}`);
  return { ok: true };
}

/** لقطة أقدم نسخة سُجّلت بعد بدء المسودة = حالة النسخة الحية عند بدء المسودة */
async function firstSnapshotAfter(supabase: SupabaseClient, id: string, baseUpdatedAt: string): Promise<EditableContent | null> {
  const { data } = await supabase
    .from("bh_summary_versions")
    .select("snapshot")
    .eq("summary_id", id)
    .gt("created_at", baseUpdatedAt)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();
  return ((data as { snapshot: unknown } | null)?.snapshot as EditableContent | undefined) ?? null;
}

async function changedSinceBase(supabase: SupabaseClient, id: string, baseUpdatedAt: string, live: LiveRow): Promise<SectionId[]> {
  const base = await firstSnapshotAfter(supabase, id, baseUpdatedAt);
  if (!base) return [];
  const plan = planPublish(live, { base_updated_at: baseUpdatedAt, cover_url: live.cover_url }, base);
  return plan.kind === "conflict" ? plan.changed : [];
}

/** التراجع عن التعديلات غير المنشورة: حذف صف المسودة فقط. النسخة الحية لا تُمس. */
export async function discardSummaryEdits(id: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await admin();
  if (!supabase) return { ok: false, message: "غير مصرّح." };
  const { error } = await supabase.from("bh_summary_drafts").delete().eq("summary_id", id);
  if (error) return { ok: false, message: `تعذّر التراجع: ${error.message}` };
  revalidatePath("/admin");
  return { ok: true };
}

export type RestoreResult =
  | { ok: true }
  | { ok: false; kind: "draft_exists" }
  | { ok: false; kind: "error"; message: string };

/**
 * استرجاع نسخة سابقة: تُحمَّل في المسودة فقط ولا تُنشر.
 * إن وُجدت مسودة لا تُستبدل إلا بتأكيد صريح (replaceExistingDraft).
 */
export async function restoreSummaryVersion(
  id: string,
  versionId: number,
  replaceExistingDraft: boolean,
): Promise<RestoreResult> {
  const supabase = await admin();
  if (!supabase) return { ok: false, kind: "error", message: "غير مصرّح." };

  // النسخة يجب أن تخص هذا الملخص نفسه
  const { data: version } = await supabase
    .from("bh_summary_versions").select("id, summary_id").eq("id", versionId).maybeSingle();
  if (!version || (version as { summary_id: string }).summary_id !== id)
    return { ok: false, kind: "error", message: "النسخة غير موجودة لهذا الملخص." };

  const { error } = await supabase.rpc("bh_restore_summary_version", {
    p_version_id: versionId,
    p_replace_existing_draft: replaceExistingDraft,
  });
  if (error) {
    // الدالة ترفض الكتابة فوق مسودة موجودة برسالة محددة (غير قيود الجدول التي تحمل الرمز نفسه)
    if (error.code === "23514" && error.message.includes("unpublished changes")) return { ok: false, kind: "draft_exists" };
    return { ok: false, kind: "error", message: `تعذّر الاسترجاع: ${error.message}` };
  }
  revalidatePath("/admin");
  return { ok: true };
}
