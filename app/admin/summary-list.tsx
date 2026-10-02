"use client";

// قائمة الملخصات في لوحة التحكم: بحث، فلاتر حالة، وإجراءات كل صف.
// ما يوقف الظهور للعموم (إلغاء النشر، أرشفة منشور) لا يتم إلا بعد تأكيد صريح.
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toArabicNumerals } from "@/lib/site.config";
import {
  FILTERS, STATE_LABEL, filterCounts, filterRows, summaryState,
  type ListFilter, type ListRow, type SummaryState,
} from "@/lib/admin/list";
import {
  archiveSummary, publishSummary, setFeatured, unarchiveSummary, unpublishSummary, unsetFeatured,
  type ListActionResult,
} from "./actions";

export type AdminRow = ListRow & { is_featured: boolean; cover_url: string | null; categoryName: string | null };

type Confirming = { id: string; kind: "unpublish" | "archive" } | null;

const TONE: Record<SummaryState, string | undefined> = {
  published: "live", never_published: undefined, unpublished: "off", archived: "off",
};

export function SummaryList({ rows }: { rows: AdminRow[] }) {
  const [filter, setFilter] = useState<ListFilter>("current");
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState<Confirming>(null);
  const [error, setError] = useState<{ id: string; text: string } | null>(null);
  const [pending, start] = useTransition();

  const counts = useMemo(() => filterCounts(rows), [rows]);
  const shown = useMemo(() => filterRows(rows, filter, query), [rows, filter, query]);

  function run(id: string, action: (id: string) => Promise<ListActionResult>) {
    setError(null);
    start(async () => {
      const res = await action(id);
      setConfirming(null);
      if (!res.ok) setError({ id, text: res.message });
    });
  }

  return (
    <section className="adm-list" aria-label="الملخصات">
      <div className="adm-list-tools">
        <label className="adm-label" htmlFor="adm-search">بحث</label>
        <input
          id="adm-search" type="search" className="adm-input" autoComplete="off"
          placeholder="العنوان، المؤلف، أو المسار"
          value={query} onChange={(e) => setQuery(e.target.value)}
        />
        <div className="adm-filters" role="group" aria-label="فلاتر الحالة">
          {FILTERS.map((f) => (
            <button
              key={f.id} type="button" className="adm-filter" aria-pressed={filter === f.id}
              onClick={() => { setFilter(f.id); setConfirming(null); }}
            >
              {f.label} <span className="adm-filter-count">{toArabicNumerals(counts[f.id])}</span>
            </button>
          ))}
        </div>
        <p className="adm-hint" role="status">
          {shown.length === 0 ? "لا نتائج." : `${toArabicNumerals(shown.length)} من ${toArabicNumerals(counts[filter])}`}
          {filter !== "archived" && counts.archived > 0 ? " · المؤرشف لا يظهر هنا." : ""}
        </p>
      </div>

      {shown.length === 0 ? (
        <div className="bh-card p-6 text-center">
          <p className="bh-sub">{query ? "لا ملخص يطابق البحث في هذا الفلتر." : "لا ملخصات في هذا الفلتر."}</p>
        </div>
      ) : (
        <ul className="adm-rows bh-card">
          {shown.map((r) => {
            const state = summaryState(r);
            const archived = state === "archived";
            const isConfirming = confirming?.id === r.id ? confirming.kind : null;
            return (
              <li key={r.id} className="adm-row">
                <div className="adm-row-main">
                  <p className="adm-row-title">{r.book_title_ar}</p>
                  <p className="adm-row-meta">{[r.author, r.categoryName, `/s/${r.slug}`].filter(Boolean).join(" · ")}</p>
                  <p className="adm-row-chips">
                    <span className="adm-chip" data-tone={TONE[state]}>{STATE_LABEL[state]}</span>
                    {state === "unpublished" ? <span className="adm-chip">سبق نشره</span> : null}
                    {archived && r.first_published_at ? <span className="adm-chip">سبق نشره</span> : null}
                    {r.hasPendingEdits ? <span className="adm-chip" data-tone="pending">لديه تعديلات غير منشورة</span> : null}
                    {r.is_featured ? <span className="adm-chip">★ مميّز</span> : null}
                    {r.cover_url ? <span className="adm-chip">غلاف ✓</span> : null}
                  </p>
                </div>

                <div className="adm-row-actions">
                  <Link href={`/admin/summaries/${r.id}`} className="adm-btn adm-btn-sm">{archived ? "فتح" : "تحرير"}</Link>
                  <Link href={`/admin/preview/${r.slug}`} className="adm-btn adm-btn-sm">معاينة</Link>

                  {state === "published" ? (
                    <form action={r.is_featured ? unsetFeatured.bind(null, r.id, r.slug) : setFeatured.bind(null, r.id, r.slug)}>
                      <button className="adm-btn adm-btn-sm" disabled={pending}>{r.is_featured ? "★ إلغاء التمييز" : "☆ ميّز"}</button>
                    </form>
                  ) : null}

                  {state === "never_published" || state === "unpublished" ? (
                    <form action={publishSummary.bind(null, r.id, r.slug)}>
                      <button className="adm-btn adm-btn-sm adm-btn-primary" disabled={pending}>نشر</button>
                    </form>
                  ) : null}

                  {state === "published" ? (
                    <button type="button" className="adm-btn adm-btn-sm" disabled={pending} onClick={() => setConfirming({ id: r.id, kind: "unpublish" })}>
                      إلغاء النشر
                    </button>
                  ) : null}

                  {archived ? (
                    <button type="button" className="adm-btn adm-btn-sm adm-btn-primary" disabled={pending} onClick={() => run(r.id, unarchiveSummary)}>
                      {pending ? "…" : "إلغاء الأرشفة"}
                    </button>
                  ) : (
                    <button type="button" className="adm-btn adm-btn-sm" disabled={pending} onClick={() => setConfirming({ id: r.id, kind: "archive" })}>
                      أرشفة
                    </button>
                  )}
                </div>

                {isConfirming === "unpublish" ? (
                  <div className="adm-confirm" role="alertdialog" aria-label="تأكيد إلغاء النشر">
                    <p>إلغاء نشر «{r.book_title_ar}»؟</p>
                    <p className="adm-notice-sub">
                      تتوقف صفحته العامة فوراً ويختفي من القوائم العامة. الإشارات المرجعية المحفوظة لدى القرّاء تبقى،
                      والمحتوى لا يتغيّر. إعادة النشر إجراء منفصل.
                    </p>
                    <div className="adm-actions">
                      <button type="button" className="adm-btn adm-btn-danger" disabled={pending} onClick={() => run(r.id, unpublishSummary)}>
                        {pending ? "جارٍ إلغاء النشر…" : "نعم، ألغِ النشر"}
                      </button>
                      <button type="button" className="adm-btn" disabled={pending} onClick={() => setConfirming(null)}>إلغاء</button>
                    </div>
                  </div>
                ) : null}

                {isConfirming === "archive" ? (
                  <div className="adm-confirm" role="alertdialog" aria-label="تأكيد الأرشفة">
                    <p>أرشفة «{r.book_title_ar}»؟</p>
                    <p className="adm-notice-sub">
                      {state === "published"
                        ? "هذا الملخص منشور الآن: تتوقف صفحته العامة فوراً ويختفي من القوائم العامة. "
                        : ""}
                      يخرج من القائمة الحالية ويظهر تحت «مؤرشف» فقط. لا يُحذف شيء: النص والغلاف وسجل النسخ
                      والتعديلات غير المنشورة والإشارات المرجعية تبقى. يمكن إلغاء الأرشفة في أي وقت.
                    </p>
                    <div className="adm-actions">
                      <button type="button" className="adm-btn adm-btn-danger" disabled={pending} onClick={() => run(r.id, archiveSummary)}>
                        {pending ? "جارٍ الأرشفة…" : state === "published" ? "نعم، ألغِ النشر وأرشف" : "نعم، أرشف"}
                      </button>
                      <button type="button" className="adm-btn" disabled={pending} onClick={() => setConfirming(null)}>إلغاء</button>
                    </div>
                  </div>
                ) : null}

                {error?.id === r.id ? <p className="adm-notice" role="alert">{error.text}</p> : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
