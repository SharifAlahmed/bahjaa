// مختارات الصفحة الرئيسية (bh_site_content، المفتاح home_featured): حتى ٤ ملخصات بترتيب يحدده الأدمن.
// منطق خالص بلا Supabase ليُختبر مباشرة.

export const HOME_FEATURED_KEY = "home_featured";
export const HOME_FEATURED_MAX = 4;

export type HomeFeatured = { summary_ids: string[] };
export const EMPTY_HOME_FEATURED: HomeFeatured = { summary_ids: [] };

export const EYEBROW_LATEST = "أحدث الملخصات";
export const EYEBROW_FEATURED = "مختارات بهجة";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export type FeaturedIssue = { message: string; id?: string };

/** شكل القيمة فقط: مصفوفة معرّفات صالحة، بلا تكرار، حتى ٤، ولا حقول أخرى. وجود الملخصات وحالتها تُفحص على الخادم. */
export function validateFeaturedShape(input: unknown): { ok: true; value: HomeFeatured } | { ok: false; issues: FeaturedIssue[] } {
  const issues: FeaturedIssue[] = [];
  const src = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : null;
  if (!src) return { ok: false, issues: [{ message: "قيمة غير صالحة." }] };
  for (const k of Object.keys(src)) if (k !== "summary_ids") issues.push({ message: `حقل غير معروف: ${k}` });
  const ids = src.summary_ids;
  if (!Array.isArray(ids)) return { ok: false, issues: [...issues, { message: "قائمة المختارات غير صالحة." }] };
  if (ids.length > HOME_FEATURED_MAX) issues.push({ message: `الحد الأقصى ${HOME_FEATURED_MAX === 4 ? "٤" : HOME_FEATURED_MAX} مختارات.` });
  const seen = new Set<string>();
  for (const id of ids) {
    if (typeof id !== "string" || !UUID.test(id)) { issues.push({ message: "معرّف ملخص غير صالح." }); continue; }
    if (seen.has(id)) issues.push({ message: "ملخص مكرر في المختارات.", id });
    seen.add(id);
  }
  return issues.length ? { ok: false, issues } : { ok: true, value: { summary_ids: ids as string[] } };
}

/** المعرّفات المحفوظة كما تُقرأ للعرض العام: أي قيمة غير صالحة = لا مختارات (أي الأحدث تلقائياً) */
export function publicFeaturedIds(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  const res = validateFeaturedShape(value);
  return res.ok ? res.value.summary_ids : [];
}

export type Candidate = { id: string; status: string; archived_at?: string | null };

/**
 * خوارزمية العرض:
 * ١) المختارات بترتيبها، ما دامت موجودة ومنشورة وغير مؤرشفة، بلا تكرار.
 * ٢) ثم الأحدث المنشورة غير المختارة حتى ٤.
 * `newest` مرتبة من الأحدث، ومنشورة فقط؛ `byId` يحوي الملخصات المختارة التي عُثر عليها.
 */
export function resolveFeatured<T extends Candidate>(
  selectedIds: string[], byId: Map<string, T>, newest: T[],
): { items: T[]; manualCount: number } {
  const items: T[] = [];
  const used = new Set<string>();
  for (const id of selectedIds) {
    if (items.length >= HOME_FEATURED_MAX) break;
    const row = byId.get(id);
    if (!row || used.has(id) || row.status !== "published" || row.archived_at) continue;
    items.push(row); used.add(id);
  }
  const manualCount = items.length;
  for (const row of newest) {
    if (items.length >= HOME_FEATURED_MAX) break;
    if (used.has(row.id) || row.status !== "published" || row.archived_at) continue;
    items.push(row); used.add(row.id);
  }
  return { items, manualCount };
}

export const featuredEyebrow = (manualCount: number) => (manualCount > 0 ? EYEBROW_FEATURED : EYEBROW_LATEST);
