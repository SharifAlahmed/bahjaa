"use client";

// سجل نسخ ملخص سبق نشره. الاسترجاع يحمّل النسخة في المسودة فقط — لا ينشر شيئاً.
import { useState, useTransition } from "react";
import { SECTIONS, type SectionId } from "@/lib/admin/summary-content";
import { restoreSummaryVersion } from "./actions";

export type VersionItem = {
  id: number;
  /** متى استُبدلت هذه النسخة (منسّق) */
  when: string;
  /** من أجرى التغيير الذي استبدلها */
  by: string;
  reason: "update" | "delete";
  /** الأقسام التي تختلف فيها عن النسخة الحية الحالية */
  changed: SectionId[];
};

const REASON = { update: "تعديل المحتوى", delete: "حذف" } as const;
const title = (id: SectionId) => SECTIONS.find((s) => s.id === id)?.title ?? id;

export function VersionHistory({
  summaryId, slug, hasDraft, items,
}: { summaryId: string; slug: string; hasDraft: boolean; items: VersionItem[] }) {
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function restore(versionId: number, replace: boolean) {
    setError("");
    start(async () => {
      const res = await restoreSummaryVersion(summaryId, versionId, replace);
      if (res.ok) {
        window.location.assign(`/admin/summaries/${summaryId}?done=restored`);
      } else if (res.kind === "draft_exists") {
        setConfirmId(versionId);   // الخادم رفض الكتابة فوق مسودة موجودة: نطلب التأكيد
      } else {
        setError(res.message);
      }
    });
  }

  return (
    <div className="adm-editor adm-history-wrap">
      <section className="adm-card" id="sec-history" tabIndex={-1} aria-labelledby="sec-history-h">
        <header className="adm-card-head">
          <h2 id="sec-history-h">سجل النسخ</h2>
        </header>
        <p className="adm-hint">
          كل سطر نسخة كانت هي الحية ثم استُبدلت. الاسترجاع يحمّل النسخة في المسودة لتراجعها — لا ينشرها.
        </p>
        {error ? <p className="adm-notice" role="alert">{error}</p> : null}

        {items.length === 0 ? (
          <p className="adm-hint">لا نسخ سابقة بعد. تُحفظ نسخة تلقائياً مع كل نشر لتعديلات.</p>
        ) : (
          <ul className="adm-history">
            {items.map((v) => (
              <li key={v.id} className="adm-history-item">
                <div className="adm-history-main">
                  <p className="adm-history-when">استُبدلت في {v.when}</p>
                  <p className="adm-history-meta">بواسطة {v.by} · السبب: {REASON[v.reason]}</p>
                  <p className="adm-history-meta">
                    {v.changed.length
                      ? `تختلف عن النسخة الحية في: ${v.changed.map(title).join("، ")}`
                      : "مطابقة لمحتوى النسخة الحية الحالية"}
                  </p>
                </div>
                {confirmId === v.id ? (
                  <div className="adm-confirm" role="alertdialog" aria-label="تأكيد الاسترجاع">
                    <p>لديك تعديلات غير منشورة. استرجاع هذه النسخة سيستبدلها في المسودة.</p>
                    <div className="adm-actions">
                      <button type="button" className="adm-btn adm-btn-danger" disabled={pending} onClick={() => restore(v.id, true)}>
                        {pending ? "جارٍ الاسترجاع…" : "نعم، استبدل تعديلاتي بهذه النسخة"}
                      </button>
                      <button type="button" className="adm-btn" disabled={pending} onClick={() => setConfirmId(null)}>إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <div className="adm-actions">
                    <a className="adm-btn adm-btn-sm" href={`/admin/preview/${slug}?version=${v.id}`} target="_blank" rel="noreferrer">
                      معاينة
                    </a>
                    <button
                      type="button" className="adm-btn adm-btn-sm" disabled={pending}
                      onClick={() => (hasDraft ? setConfirmId(v.id) : restore(v.id, false))}
                    >
                      استرجاع إلى المسودة
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
