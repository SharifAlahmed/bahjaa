"use client";

// محرّر مختارات الرئيسية: حتى ٤ ملخصات بترتيب الأدمن، ثم الأحدث تلقائياً. مسودة ← معاينة ← نشر.
// المعاينة الحية هي قسم الرئيسية الحقيقي نفسه بالبطاقات نفسها.
import { useEffect, useMemo, useState, useTransition } from "react";
import { LatestSummariesView } from "@/components/home/latest-summaries-view";
import { normalizeForSearch } from "@/lib/admin/list";
import { toArabicNumerals } from "@/lib/site.config";
import {
  HOME_FEATURED_MAX, featuredEyebrow, resolveFeatured, validateFeaturedShape, type FeaturedIssue,
} from "@/lib/site/home-featured";
import type { Category, SummaryListItem } from "@/lib/types";
import { discardHomeFeaturedDraft, publishHomeFeatured, restoreHomeFeaturedVersion, saveHomeFeaturedDraft } from "./actions";

export type FeaturedVersionItem = { id: number; when: string; by: string; count: number };

type Msg = { tone: "ok" | "error"; text: string } | null;
const DONE: Record<string, string> = {
  published: "نُشرت المختارات. الصفحة الرئيسية تعرضها الآن.",
  discarded: "حُذفت المسودة. الصفحة الرئيسية لم تتغيّر.",
  restored: "حُمّلت النسخة السابقة في المسودة. راجعها ثم انشرها — لم يُنشر شيء بعد.",
};

export function FeaturedEditor({
  initialIds, initialDraftUpdatedAt, publishedCount, publishedWhen, pool, categories, versions, done,
}: {
  initialIds: string[];
  initialDraftUpdatedAt: string | null;
  /** null = لا إعداد منشور (الأحدث تلقائياً) */
  publishedCount: number | null;
  publishedWhen: string | null;
  /** الملخصات المنشورة غير المؤرشفة، من الأحدث */
  pool: SummaryListItem[];
  categories: Category[];
  versions: FeaturedVersionItem[];
  done: string | null;
}) {
  const [ids, setIds] = useState<string[]>(initialIds);
  const [baseline, setBaseline] = useState(JSON.stringify(initialIds));
  const [draftUpdatedAt, setDraftUpdatedAt] = useState(initialDraftUpdatedAt);
  const [query, setQuery] = useState("");
  const [serverIssues, setServerIssues] = useState<FeaturedIssue[]>([]);
  const [message, setMessage] = useState<Msg>(done && DONE[done] ? { tone: "ok", text: DONE[done] } : null);
  const [confirming, setConfirming] = useState<"discard" | { restore: number } | null>(null);
  const [pending, start] = useTransition();

  const byId = useMemo(() => new Map(pool.map((s) => [s.id, s])), [pool]);
  const dirty = JSON.stringify(ids) !== baseline;
  const hasDraft = draftUpdatedAt !== null;
  const shape = validateFeaturedShape({ summary_ids: ids });
  const full = ids.length >= HOME_FEATURED_MAX;

  // المعاينة الحية: الخوارزمية نفسها التي تعرض الصفحة العامة
  const preview = useMemo(() => {
    const cand = (s: SummaryListItem) => ({ ...s, status: "published" });
    const res = resolveFeatured(ids, new Map(pool.map((s) => [s.id, cand(s)])), pool.map(cand));
    return { items: res.items.map(({ status: _s, ...s }) => s as SummaryListItem), eyebrow: featuredEyebrow(res.manualCount) };
  }, [ids, pool]);

  const results = useMemo(() => {
    const words = normalizeForSearch(query).split(" ").filter(Boolean);
    return pool.filter((s) => {
      if (ids.includes(s.id)) return false;
      if (!words.length) return true;
      const hay = normalizeForSearch([s.book_title_ar, s.book_title_en ?? "", s.author ?? "", s.slug].join(" "));
      return words.every((w) => hay.includes(w));
    });
  }, [query, pool, ids]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const change = (next: string[]) => { setIds(next); setServerIssues([]); };
  const move = (i: number, j: number) => { const next = [...ids]; [next[i], next[j]] = [next[j], next[i]]; change(next); };

  function save() {
    if (!shape.ok) { setMessage({ tone: "error", text: "لم تُحفظ: راجع المختارات." }); return; }
    setMessage(null);
    start(async () => {
      const res = await saveHomeFeaturedDraft({ summary_ids: ids }, draftUpdatedAt);
      if (res.ok) {
        setIds(res.value.summary_ids); setBaseline(JSON.stringify(res.value.summary_ids)); setDraftUpdatedAt(res.draftUpdatedAt); setServerIssues([]);
        setMessage({ tone: "ok", text: "حُفظت المسودة. الصفحة الرئيسية لم تتغيّر." });
      } else if (res.kind === "validation") {
        setServerIssues(res.issues); setMessage({ tone: "error", text: "لم تُحفظ: بعض المختارات غير صالحة." });
      } else setMessage({ tone: "error", text: res.message });
    });
  }
  function publish() {
    if (!draftUpdatedAt) return;
    setMessage(null);
    start(async () => {
      const res = await publishHomeFeatured(draftUpdatedAt);
      if (res.ok) window.location.assign("/admin/site/home-featured?done=published");
      else { if (res.issues) setServerIssues(res.issues); setMessage({ tone: "error", text: res.message }); }
    });
  }
  function discard() {
    setConfirming(null);
    start(async () => {
      const res = await discardHomeFeaturedDraft();
      if (res.ok) window.location.assign("/admin/site/home-featured?done=discarded");
      else setMessage({ tone: "error", text: res.message });
    });
  }
  function restore(id: number, replace: boolean) {
    start(async () => {
      const res = await restoreHomeFeaturedVersion(id, replace);
      if (res.ok) window.location.assign("/admin/site/home-featured?done=restored");
      else if (res.kind === "draft_exists") setConfirming({ restore: id });
      else setMessage({ tone: "error", text: res.message });
    });
  }

  // أول حفظ مسموح ولو طابقت القيم المنشور/الافتراضي (لا مسودة بعد)
  const saveDisabled = pending || (!dirty && hasDraft) || !shape.ok;
  const publishDisabled = pending || dirty || !hasDraft || !shape.ok;
  const actions = (
    <div className="adm-actions">
      <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={saveDisabled}>حفظ المسودة</button>
      <a className="adm-btn" href="/admin/site/home-featured/preview" target="_blank" rel="noreferrer"
         aria-disabled={dirty || pending || !hasDraft} title={dirty ? "احفظ التغييرات أولاً" : !hasDraft ? "لا توجد مسودة محفوظة" : undefined}>
        معاينة
      </a>
      <button type="button" className="adm-btn" onClick={publish} disabled={publishDisabled}
              title={dirty ? "احفظ التغييرات أولاً" : !hasDraft ? "لا توجد مسودة محفوظة" : undefined}>
        {pending ? "…" : "نشر"}
      </button>
    </div>
  );
  const issueText = (id?: string) => serverIssues.filter((i) => i.id === id).map((i) => i.message).join(" ");

  return (
    <div className="adm-editor">
      <div className="adm-top">
        <div className="adm-bar">
          <div className="adm-bar-title">
            <p className="adm-bar-meta">
              <a href="/admin" className="textlink">اللوحة</a>
              <span className="adm-chip" data-tone="live">
                {publishedCount === null || publishedCount === 0
                  ? "المنشور: الأحدث تلقائياً"
                  : `المنشور: ${toArabicNumerals(publishedCount)} مختارات${publishedWhen ? ` · ${publishedWhen}` : ""}`}
              </span>
              <span className="adm-chip" data-tone={hasDraft ? "pending" : undefined}>{hasDraft ? "لديه مسودة غير منشورة" : "لا مسودة"}</span>
            </p>
            <h1>مختارات الصفحة الرئيسية</h1>
          </div>
          <span className="adm-state" role="status">{dirty ? "تغييرات غير محفوظة" : hasDraft ? "المسودة محفوظة" : "لا تغييرات"}</span>
          {actions}
        </div>
        {message ? <p className={message.tone === "ok" ? "adm-flash" : "adm-notice"} role={message.tone === "ok" ? "status" : "alert"}>{message.text}</p> : null}
      </div>

      <p className="adm-flash">
        اختر حتى ٤ ملخصات منشورة بالترتيب الذي تريده. ما يتبقى من الأماكن الأربعة يُكمَل تلقائياً بأحدث الملخصات.
        بلا مختارات يبقى القسم كما هو الآن: «أحدث الملخصات». مع مختارات يصبح عنوانه «مختارات بهجة». لا شيء يظهر قبل «نشر».
      </p>
      {serverIssues.filter((i) => !i.id).map((i, n) => <p key={n} className="adm-notice" role="alert">{i.message}</p>)}

      <section className="adm-card" aria-labelledby="feat-picked-h">
        <header className="adm-card-head"><h2 id="feat-picked-h">المختارات ({toArabicNumerals(ids.length)} من ٤)</h2></header>
        {ids.length === 0 ? (
          <p className="adm-hint">لا مختارات — يعرض القسم أحدث ٤ ملخصات تلقائياً.</p>
        ) : (
          <ol className="adm-feat-list">
            {ids.map((id, i) => {
              const s = byId.get(id);
              const err = issueText(id);
              return (
                <li key={id} className="adm-feat-item">
                  <span className="adm-feat-rank">{toArabicNumerals(i + 1)}</span>
                  <div className="adm-feat-main">
                    <p className="adm-row-title">{s ? s.book_title_ar : "ملخص لم يعد منشوراً"}</p>
                    <p className="adm-row-meta">{s ? [s.author, `/s/${s.slug}`].filter(Boolean).join(" · ") : "سيُستبعد ويُكمَل مكانه بالأحدث."}</p>
                    {err ? <p className="adm-error" role="alert">{err}</p> : null}
                  </div>
                  <div className="adm-actions">
                    <button type="button" className="adm-btn adm-btn-sm" disabled={pending || i === 0} onClick={() => move(i, i - 1)} aria-label={`تقديم ${s?.book_title_ar ?? ""}`}>↑</button>
                    <button type="button" className="adm-btn adm-btn-sm" disabled={pending || i === ids.length - 1} onClick={() => move(i, i + 1)} aria-label={`تأخير ${s?.book_title_ar ?? ""}`}>↓</button>
                    <button type="button" className="adm-btn adm-btn-sm adm-btn-danger" disabled={pending} onClick={() => change(ids.filter((x) => x !== id))}>إزالة</button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="adm-card" aria-labelledby="feat-add-h">
        <header className="adm-card-head"><h2 id="feat-add-h">إضافة ملخص</h2></header>
        <label className="adm-label" htmlFor="feat-search">بحث في الملخصات المنشورة</label>
        <input id="feat-search" type="search" className="adm-input" autoComplete="off" placeholder="العنوان، المؤلف، أو المسار"
               value={query} onChange={(e) => setQuery(e.target.value)} />
        {full ? <p className="adm-hint">اكتملت المختارات (٤). أزل واحداً لإضافة غيره.</p> : null}
        <ul className="adm-feat-results">
          {results.slice(0, 12).map((s) => (
            <li key={s.id} className="adm-feat-item">
              <div className="adm-feat-main">
                <p className="adm-row-title">{s.book_title_ar}</p>
                <p className="adm-row-meta">{[s.author, `/s/${s.slug}`].filter(Boolean).join(" · ")}</p>
              </div>
              <button type="button" className="adm-btn adm-btn-sm" disabled={pending || full} onClick={() => change([...ids, s.id])}>إضافة</button>
            </li>
          ))}
          {results.length === 0 ? <li className="adm-hint">لا نتائج.</li> : null}
        </ul>
      </section>

      <section className="adm-card" aria-labelledby="feat-actions-h">
        <header className="adm-card-head"><h2 id="feat-actions-h">الحفظ والنشر</h2></header>
        {actions}
        {hasDraft ? (
          confirming === "discard" ? (
            <div className="adm-confirm" role="alertdialog" aria-label="تأكيد حذف المسودة">
              <p>حذف المسودة؟ الصفحة الرئيسية تبقى كما هي.</p>
              <div className="adm-actions">
                <button type="button" className="adm-btn adm-btn-danger" disabled={pending} onClick={discard}>نعم، احذف المسودة</button>
                <button type="button" className="adm-btn" disabled={pending} onClick={() => setConfirming(null)}>إلغاء</button>
              </div>
            </div>
          ) : (
            <div className="adm-discard">
              <button type="button" className="adm-btn adm-btn-danger" disabled={pending} onClick={() => setConfirming("discard")}>التراجع عن المسودة</button>
            </div>
          )
        ) : null}
      </section>

      <section className="adm-card" aria-labelledby="feat-history-h">
        <header className="adm-card-head"><h2 id="feat-history-h">سجل النسخ</h2></header>
        <p className="adm-hint">كل سطر إعداد كان منشوراً ثم استُبدل. الاسترجاع يحمّله في المسودة لتراجعه — لا ينشره.</p>
        {versions.length === 0 ? <p className="adm-hint">لا نسخ سابقة بعد.</p> : (
          <ul className="adm-history">
            {versions.map((v) => (
              <li key={v.id} className="adm-history-item">
                <div className="adm-history-main">
                  <p className="adm-history-when">استُبدلت في {v.when}</p>
                  <p className="adm-history-meta">بواسطة {v.by} · {v.count ? `${toArabicNumerals(v.count)} مختارات` : "الأحدث تلقائياً"}</p>
                </div>
                {typeof confirming === "object" && confirming?.restore === v.id ? (
                  <div className="adm-confirm" role="alertdialog" aria-label="تأكيد الاسترجاع">
                    <p>لديك مسودة غير منشورة. استرجاع هذه النسخة سيستبدلها.</p>
                    <div className="adm-actions">
                      <button type="button" className="adm-btn adm-btn-danger" disabled={pending} onClick={() => restore(v.id, true)}>نعم، استبدل المسودة</button>
                      <button type="button" className="adm-btn" disabled={pending} onClick={() => setConfirming(null)}>إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <div className="adm-actions">
                    <a className="adm-btn adm-btn-sm" href={`/admin/site/home-featured/preview?version=${v.id}`} target="_blank" rel="noreferrer">معاينة</a>
                    <button type="button" className="adm-btn adm-btn-sm" disabled={pending}
                            onClick={() => (hasDraft ? setConfirming({ restore: v.id }) : restore(v.id, false))}>استرجاع إلى المسودة</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="adm-hero-live" aria-label="معاينة حية لقسم الملخصات بالمختارات الحالية في النموذج">
        <p className="adm-label adm-hero-live-label">معاينة حية (بالمختارات الحالية، قبل الحفظ)</p>
        <div className="adm-hero-live-frame">
          <LatestSummariesView items={preview.items} categories={categories} bookmarks={null} eyebrow={preview.eyebrow} />
        </div>
      </section>
    </div>
  );
}
