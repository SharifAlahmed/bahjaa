"use client";

// منطقة الخطر: الحذف النهائي لا يتم بنقرة واحدة — يتطلب كتابة المسار (slug) حرفياً ثم التأكيد.
import { useState, useTransition } from "react";
import { deleteSummaryPermanently } from "./actions";

export function DangerZone({
  summaryId, slug, title, isLive,
}: { summaryId: string; slug: string; title: string; isLive: boolean }) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const matches = typed.trim() === slug;

  function onDelete() {
    if (!matches) return;
    setError("");
    start(async () => {
      const res = await deleteSummaryPermanently(summaryId, typed.trim());
      if (res.ok) window.location.assign("/admin?deleted=1");
      else setError(res.message);
    });
  }

  return (
    <div className="adm-editor adm-history-wrap adm-danger-wrap">
      <section className="adm-card adm-danger" id="sec-danger" tabIndex={-1} aria-labelledby="sec-danger-h">
        <header className="adm-card-head">
          <h2 id="sec-danger-h">منطقة الخطر</h2>
        </header>
        <p className="adm-danger-lead">حذف «{title}» نهائياً</p>
        <ul className="adm-danger-list">
          <li>يُزال الملخص من الموقع ومن لوحة التحكم{isLive ? "، وهو منشور الآن ويراه القرّاء" : ""}.</li>
          <li>قد تُحذف نهائياً إشاراته المرجعية المحفوظة في مكتبات القرّاء، ولا تعود باسترجاع الملخص.</li>
          <li>لا يمكن التراجع عن الحذف من هذه الصفحة.</li>
        </ul>

        <div className="adm-field">
          <label className="adm-label" htmlFor="danger-slug">
            للتأكيد اكتب مسار الملخص حرفياً: <span dir="ltr" className="adm-danger-slug">{slug}</span>
          </label>
          <input
            id="danger-slug" className="adm-input" dir="ltr" autoComplete="off" spellCheck={false}
            value={typed} onChange={(e) => setTyped(e.target.value)} disabled={pending}
          />
        </div>
        {error ? <p className="adm-notice" role="alert">{error}</p> : null}
        <div className="adm-actions adm-danger-actions">
          <button type="button" className="adm-btn adm-btn-danger" onClick={onDelete} disabled={!matches || pending}>
            {pending ? "جارٍ الحذف…" : "حذف الملخص نهائياً"}
          </button>
        </div>
      </section>
    </div>
  );
}
