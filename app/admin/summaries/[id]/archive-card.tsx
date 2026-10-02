"use client";

// الأرشفة: المسار الآمن للإزالة — لا يُحذف شيء، ويمكن التراجع عنها. الحذف النهائي يبقى في منطقة الخطر.
import { useState, useTransition } from "react";
import { archiveSummary, unarchiveSummary } from "@/app/admin/actions";

export function ArchiveCard({
  summaryId, title, isLive, archived,
}: { summaryId: string; title: string; isLive: boolean; archived: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function run(action: (id: string) => Promise<{ ok: true } | { ok: false; message: string }>, done: string) {
    setError("");
    start(async () => {
      const res = await action(summaryId);
      if (res.ok) window.location.assign(`/admin/summaries/${summaryId}?done=${done}`);
      else setError(res.message);
    });
  }

  return (
    <div className="adm-editor adm-history-wrap">
      <section className="adm-card" id="sec-archive" tabIndex={-1} aria-labelledby="sec-archive-h">
        <header className="adm-card-head">
          <h2 id="sec-archive-h">الأرشفة</h2>
        </header>
        {archived ? (
          <>
            <p className="adm-archive-note">
              «{title}» مؤرشف: لا يظهر للعموم ولا في القائمة الحالية، ولا يمكن تحريره أو نشره أو تمييزه قبل إلغاء الأرشفة.
              إلغاء الأرشفة يعيده ملخصاً غير منشور — لا ينشره.
            </p>
            {error ? <p className="adm-notice" role="alert">{error}</p> : null}
            <div className="adm-actions adm-danger-actions">
              <button type="button" className="adm-btn adm-btn-primary" disabled={pending} onClick={() => run(unarchiveSummary, "unarchived")}>
                {pending ? "جارٍ إلغاء الأرشفة…" : "إلغاء الأرشفة"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="adm-archive-note">
              الأرشفة هي الطريقة الآمنة لإزالة ملخص من العمل: يخرج من القائمة الحالية ويظهر تحت «مؤرشف» فقط، ولا يُحذف
              شيء (النص، الغلاف، سجل النسخ، التعديلات غير المنشورة، والإشارات المرجعية). يمكن إلغاء الأرشفة في أي وقت.
            </p>
            {error ? <p className="adm-notice" role="alert">{error}</p> : null}
            {confirming ? (
              <div className="adm-confirm" role="alertdialog" aria-label="تأكيد الأرشفة">
                <p>أرشفة «{title}»؟</p>
                <p className="adm-notice-sub">
                  {isLive ? "هذا الملخص منشور الآن: تتوقف صفحته العامة فوراً ويختفي من القوائم العامة. " : ""}
                  التغييرات غير المحفوظة في هذه الصفحة ستضيع.
                </p>
                <div className="adm-actions">
                  <button type="button" className="adm-btn adm-btn-danger" disabled={pending} onClick={() => run(archiveSummary, "archived")}>
                    {pending ? "جارٍ الأرشفة…" : isLive ? "نعم، ألغِ النشر وأرشف" : "نعم، أرشف"}
                  </button>
                  <button type="button" className="adm-btn" disabled={pending} onClick={() => setConfirming(false)}>إلغاء</button>
                </div>
              </div>
            ) : (
              <div className="adm-actions adm-danger-actions">
                <button type="button" className="adm-btn" disabled={pending} onClick={() => setConfirming(true)}>أرشفة</button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
