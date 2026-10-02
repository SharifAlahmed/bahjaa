"use client";

// لوحة الغلاف: تقرأ وتكتب الغلاف الحالي على صف الملخص مباشرة — مستقلة عن مسودة تعديلات النص.
import { useState, useTransition } from "react";
import { MediaUploader } from "@/components/admin/media-uploader";
import { COVER_BUCKET, COVER_RULES, coverObjectPath, coverPublicUrl } from "@/lib/admin/cover";
import { randomSuffix } from "@/lib/admin/media";
import { createClient } from "@/lib/supabase/client";
import { setSummaryCover } from "./actions";

/** يُبلَّغ به المحرّر ليحدّث توقيت الصف المتوقع، فلا يُحسب تغيير الغلاف تعارضاً عند حفظ النص */
export const SUMMARY_TOUCHED_EVENT = "bh:summary-touched";

type Confirming = { kind: "remove" } | { kind: "reuse"; url: string } | null;

export function CoverPanel({
  summaryId, isLive, hasTextDraft, initialCoverUrl, initialPrevious,
}: {
  summaryId: string;
  /** منشور ويراه القرّاء الآن */
  isLive: boolean;
  hasTextDraft: boolean;
  initialCoverUrl: string | null;
  initialPrevious: string[];
}) {
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl);
  const [previous, setPrevious] = useState(initialPrevious);
  const [confirming, setConfirming] = useState<Confirming>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();

  /** يطبّق الغلاف على الصف ثم يحدّث اللوحة. يعيد رسالة الخطأ أو null */
  async function apply(next: string | null, done: string): Promise<string | null> {
    const res = await setSummaryCover(summaryId, next);
    if (!res.ok) return res.message;
    const old = coverUrl;
    setCoverUrl(res.coverUrl);
    setPrevious((list) => [...(old && old !== res.coverUrl ? [old] : []), ...list.filter((u) => u !== res.coverUrl && u !== old)]);
    setConfirming(null);
    setMessage({ tone: "ok", text: done });
    window.dispatchEvent(new CustomEvent(SUMMARY_TOUCHED_EVENT, { detail: { updatedAt: res.updatedAt } }));
    return null;
  }

  async function uploadAndApply(file: File): Promise<string | null> {
    setMessage(null);
    const objectPath = coverObjectPath(summaryId, file.type, Date.now(), randomSuffix(crypto.getRandomValues(new Uint8Array(8))));
    // رفع مباشر من المتصفح بجلسة الأدمن؛ upsert:false فلا يُستبدل ملف موجود أبداً
    const { error } = await createClient().storage.from(COVER_BUCKET)
      .upload(objectPath, file, { upsert: false, contentType: file.type, cacheControl: "31536000" });
    if (error) return `فشل رفع الغلاف: ${error.message}`;
    return apply(
      coverPublicUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!, objectPath),
      isLive ? "استُبدل الغلاف، وهو ظاهر للقرّاء الآن." : "حُفظ الغلاف على المسودة.",
    );
  }

  function run(next: string | null, done: string) {
    setMessage(null);
    start(async () => {
      const failure = await apply(next, done);
      if (failure) setMessage({ tone: "error", text: failure });
    });
  }

  const liveNote = isLive ? " التغيير يظهر للقرّاء فوراً." : "";
  return (
    <div className="adm-editor adm-history-wrap">
      <section className="adm-card" id="sec-cover" tabIndex={-1} aria-labelledby="sec-cover-h">
        <header className="adm-card-head">
          <h2 id="sec-cover-h">الغلاف</h2>
        </header>
        <p className="adm-hint">
          {isLive
            ? "الغلاف يُدار مباشرة على النسخة الحية، ومستقل عن تعديلات النص."
            : "الغلاف يُحفظ على هذا الملخص مباشرة، ومستقل عن حفظ النص."}
          {hasTextDraft ? " تعديلات النص غير المنشورة لا تغيّر الغلاف: عند نشرها يبقى الغلاف الحالي كما هو." : ""}
        </p>
        {message ? (
          <p className={message.tone === "ok" ? "adm-flash" : "adm-notice"} role={message.tone === "ok" ? "status" : "alert"}>{message.text}</p>
        ) : null}

        <div className="adm-cover-current">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="adm-cover-thumb" src={coverUrl} alt="الغلاف الحالي" />
          ) : (
            <div className="adm-cover-thumb adm-cover-empty" aria-hidden="true">بلا غلاف</div>
          )}
          <div className="adm-cover-current-body">
            <p className="adm-label">{coverUrl ? "الغلاف الحالي" : "لا يوجد غلاف مرفوع"}</p>
            <p className="adm-hint">
              {coverUrl
                ? (isLive ? "هذا ما يراه القرّاء في الموقع الآن." : "يظهر في المعاينة الآن، وللقرّاء عند النشر.")
                : "يُعرض الغلاف التوليدي (العنوان والمؤلف وأيقونة القسم) تلقائياً."}
            </p>
            {coverUrl && confirming?.kind !== "remove" ? (
              <div className="adm-actions">
                <button type="button" className="adm-btn adm-btn-danger" disabled={pending} onClick={() => setConfirming({ kind: "remove" })}>
                  إزالة الغلاف
                </button>
              </div>
            ) : null}
            {confirming?.kind === "remove" ? (
              <div className="adm-confirm" role="alertdialog" aria-label="تأكيد إزالة الغلاف">
                <p>إزالة الغلاف والعودة إلى الغلاف التوليدي؟{liveNote} يبقى الغلاف في «الأغلفة السابقة».</p>
                <div className="adm-actions">
                  <button
                    type="button" className="adm-btn adm-btn-danger" disabled={pending}
                    onClick={() => run(null, isLive ? "أُزيل الغلاف. يُعرض الغلاف التوليدي للقرّاء الآن." : "أُزيل الغلاف من المسودة.")}
                  >
                    {pending ? "جارٍ الإزالة…" : "نعم، أزل الغلاف"}
                  </button>
                  <button type="button" className="adm-btn" disabled={pending} onClick={() => setConfirming(null)}>إلغاء</button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <MediaUploader
          inputId="cover-file"
          label={coverUrl ? "استبدال الغلاف" : "رفع غلاف"}
          hint="JPG أو PNG أو WebP · ٢ ميغابايت كحد أقصى · العرض ٤٠٠ والارتفاع ٦٠٠ بكسل على الأقل · الأفضل غلاف طولي بنسبة اثنين إلى ثلاثة."
          rules={COVER_RULES}
          confirmLabel={isLive ? "نعم، اعتمد هذا الغلاف للنسخة الحية" : "اعتمد هذا الغلاف"}
          confirmNote={
            isLive
              ? "سيُرفع هذا الغلاف ويظهر للقرّاء فوراً. الغلاف الحالي يبقى في «الأغلفة السابقة»."
              : "سيُرفع هذا الغلاف ويُحفظ على المسودة."
          }
          busy={pending}
          previewClassName="adm-cover-thumb"
          onConfirm={uploadAndApply}
        />

        {previous.length ? (
          <div className="adm-cover-previous">
            <p className="adm-label">الأغلفة السابقة</p>
            <p className="adm-hint">استخدام غلاف سابق يغيّر الغلاف فقط — لا يسترجع نص الملخص.</p>
            <ul className="adm-cover-list">
              {previous.map((url) => (
                <li key={url} className="adm-cover-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="adm-cover-thumb" src={url} alt="غلاف سابق" loading="lazy" />
                  {confirming?.kind === "reuse" && confirming.url === url ? (
                    <div className="adm-confirm" role="alertdialog" aria-label="تأكيد استخدام غلاف سابق">
                      <p>استخدام هذا الغلاف بدل الحالي؟{liveNote}</p>
                      <div className="adm-actions">
                        <button
                          type="button" className="adm-btn adm-btn-primary" disabled={pending}
                          onClick={() => run(url, isLive ? "اعتُمد الغلاف السابق، وهو ظاهر للقرّاء الآن." : "اعتُمد الغلاف السابق على المسودة.")}
                        >
                          {pending ? "جارٍ التطبيق…" : "نعم، استخدمه"}
                        </button>
                        <button type="button" className="adm-btn" disabled={pending} onClick={() => setConfirming(null)}>إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" className="adm-btn adm-btn-sm" disabled={pending} onClick={() => setConfirming({ kind: "reuse", url })}>
                      استخدام هذا الغلاف
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
