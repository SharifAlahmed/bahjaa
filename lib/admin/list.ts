// قائمة الأدمن: حالة كل ملخص، البحث، والفلاتر. منطق خالص ليُختبر مباشرة.

export type ListRow = {
  id: string;
  slug: string;
  book_title_ar: string;
  book_title_en: string | null;
  author: string | null;
  status: "draft" | "published";
  first_published_at: string | null;
  archived_at: string | null;
  /** له تعديلات غير منشورة في bh_summary_drafts */
  hasPendingEdits: boolean;
};

/** حالة واحدة لكل ملخص */
export type SummaryState = "published" | "never_published" | "unpublished" | "archived";

export type ListFilter = "current" | "published" | "never_published" | "unpublished" | "pending" | "archived";

export const FILTERS: { id: ListFilter; label: string }[] = [
  { id: "current", label: "الحالي" },
  { id: "published", label: "منشور" },
  { id: "never_published", label: "مسودة لم تُنشر" },
  { id: "unpublished", label: "غير منشور حالياً" },
  { id: "pending", label: "لديه تعديلات غير منشورة" },
  { id: "archived", label: "مؤرشف" },
];

export const STATE_LABEL: Record<SummaryState, string> = {
  published: "منشور",
  never_published: "مسودة لم تُنشر",
  unpublished: "غير منشور حالياً",
  archived: "مؤرشف",
};

export function summaryState(row: Pick<ListRow, "status" | "first_published_at" | "archived_at">): SummaryState {
  if (row.archived_at) return "archived";
  if (row.status === "published") return "published";
  return row.first_published_at ? "unpublished" : "never_published";
}

/** المؤرشف لا يظهر إلا تحت «مؤرشف»؛ كل فلتر آخر يستثنيه */
export function matchesFilter(row: ListRow, filter: ListFilter): boolean {
  const state = summaryState(row);
  if (filter === "archived") return state === "archived";
  if (state === "archived") return false;
  if (filter === "current") return true;
  if (filter === "pending") return row.hasPendingEdits;
  return state === filter;
}

/** تطبيع للبحث: بلا تشكيل ولا تطويل، وتوحيد أشكال الألف والهاء/التاء المربوطة والياء، وأحرف لاتينية صغيرة */
export function normalizeForSearch(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** كل كلمات البحث يجب أن تظهر في العنوان العربي أو الإنجليزي أو المؤلف أو المسار */
export function matchesSearch(row: ListRow, query: string): boolean {
  const words = normalizeForSearch(query).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalizeForSearch([row.book_title_ar, row.book_title_en ?? "", row.author ?? "", row.slug].join(" "));
  return words.every((w) => haystack.includes(w));
}

export function filterRows<T extends ListRow>(rows: T[], filter: ListFilter, query: string): T[] {
  return rows.filter((r) => matchesFilter(r, filter) && matchesSearch(r, query));
}

export function filterCounts(rows: ListRow[]): Record<ListFilter, number> {
  const counts = { current: 0, published: 0, never_published: 0, unpublished: 0, pending: 0, archived: 0 };
  for (const r of rows) for (const f of FILTERS) if (matchesFilter(r, f.id)) counts[f.id] += 1;
  return counts;
}

export const ARCHIVED_MESSAGE = "هذا الملخص مؤرشف. ألغِ الأرشفة أولاً.";
