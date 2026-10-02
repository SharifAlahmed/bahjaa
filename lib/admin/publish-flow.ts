// lib/admin/publish-flow.ts — منطق تحرير الملخصات المنشورة (Admin v1 · الخطوة ٣)
// دوال نقية بلا قاعدة بيانات: مقارنة المحتوى، وقرار النشر عند تغيّر النسخة الحية.
// تُستخدم في server actions وفي اختبارات المنطق بالكود نفسه.
import type { SectionId, StoredSummary } from "./summary-content";

type Json = Record<string, unknown>;

/** ما يتحكم فيه المحرّر. الغلاف والتمييز والحالة والمسار خارج هذه القائمة. */
export type EditableContent = Pick<
  StoredSummary,
  "book_title_ar" | "book_title_en" | "author" | "category_id" | "reading_minutes" | "content_free" | "content_full"
>;

const META_KEYS = ["book_title_ar", "book_title_en", "author", "category_id", "reading_minutes"] as const;
const FREE_SECTIONS = ["s1", "s2", "s3", "s4"] as const;
const FULL_SECTIONS = ["s5", "s6", "s7", "s8", "s9", "s10"] as const;

const isObj = (v: unknown): v is Json => !!v && typeof v === "object" && !Array.isArray(v);
const obj = (v: unknown): Json => (isObj(v) ? v : {});

/** JSON بترتيب مفاتيح ثابت — للمقارنة بصرف النظر عن ترتيب المفاتيح */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (isObj(value))
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
  return JSON.stringify(value ?? null);
}

/** الأقسام التي تختلف بين نسختين (المعلومات الأساسية + الأقسام ١–١٠ + أي مفتاح إضافي) */
export function changedSections(a: EditableContent, b: EditableContent): SectionId[] {
  const out: SectionId[] = [];
  const row = (x: EditableContent) => x as unknown as Json;
  if (META_KEYS.some((k) => stableStringify(row(a)[k]) !== stableStringify(row(b)[k]))) out.push("basic");
  const af = obj(a.content_free), bf = obj(b.content_free), au = obj(a.content_full), bu = obj(b.content_full);
  for (const s of FREE_SECTIONS) if (stableStringify(af[s]) !== stableStringify(bf[s])) out.push(s);
  for (const s of FULL_SECTIONS) if (stableStringify(au[s]) !== stableStringify(bu[s])) out.push(s);
  return out;
}

/** هل المحتوى الذي يتحكم فيه المحرّر متطابق تماماً؟ (يشمل أي مفاتيح إضافية داخل JSON) */
export function sameEditableContent(a: EditableContent, b: EditableContent): boolean {
  const row = (x: EditableContent) => x as unknown as Json;
  return (
    META_KEYS.every((k) => stableStringify(row(a)[k]) === stableStringify(row(b)[k])) &&
    stableStringify(a.content_free) === stableStringify(b.content_free) &&
    stableStringify(a.content_full) === stableStringify(b.content_full)
  );
}

export type LiveState = EditableContent & { updated_at: string; cover_url: string | null };
export type DraftState = { base_updated_at: string; cover_url: string | null };

export type PublishPlan =
  /** النسخة الحية كما كانت عند بدء المسودة — انشر مباشرة */
  | { kind: "publish" }
  /** تغيّر شيء خارج محتوى المحرّر (غلاف، تمييز، حالة…): حدّث الغلاف وأساس المسودة ثم انشر بلا force */
  | { kind: "rebase"; coverUrl: string | null; baseUpdatedAt: string }
  /** تغيّر محتوى النسخة الحية نفسه — لا نشر بلا قرار صريح من الأدمن */
  | { kind: "conflict"; liveUpdatedAt: string; changed: SectionId[] };

/**
 * قرار النشر.
 * baseSnapshot = لقطة أقدم نسخة سُجّلت بعد بدء المسودة (أي حالة النسخة الحية عند بدء المسودة)،
 * أو null إن لم تُسجَّل أي نسخة بعدها (لم يتغيّر محتوى ولا غلاف).
 */
export function planPublish(
  live: LiveState,
  draft: DraftState,
  baseSnapshot: EditableContent | null,
): PublishPlan {
  const liveMoved = live.updated_at !== draft.base_updated_at;
  if (liveMoved && baseSnapshot && !sameEditableContent(baseSnapshot, live)) {
    return { kind: "conflict", liveUpdatedAt: live.updated_at, changed: changedSections(baseSnapshot, live) };
  }
  // النشر لا يغيّر الغلاف في هذه الخطوة: نطابق غلاف المسودة مع الحي دائماً قبل النشر
  if (liveMoved || draft.cover_url !== live.cover_url) {
    return { kind: "rebase", coverUrl: live.cover_url, baseUpdatedAt: live.updated_at };
  }
  return { kind: "publish" };
}

export type VersionLike = { id: number; created_at: string; snapshot: unknown };

/**
 * لكل نسخة في السجل (مرتبة تصاعدياً): هل غيّر الاستبدال الذي أنشأها محتوى المحرّر؟
 * «الحالة بعد» النسخة i هي لقطة النسخة i+1، أو النسخة الحية للأخيرة.
 */
export function contentChangingVersions<T extends VersionLike>(ascending: T[], live: EditableContent): T[] {
  return ascending.filter((v, i) => {
    const after = i + 1 < ascending.length ? (ascending[i + 1].snapshot as EditableContent) : live;
    return !sameEditableContent(v.snapshot as EditableContent, after);
  });
}
