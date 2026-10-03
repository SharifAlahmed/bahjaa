"use client";

// محرّر بانر الصفحة الرئيسية: مسودة ← معاينة ← نشر. لا شيء يصل إلى الصفحة العامة قبل «نشر».
// المعاينة الحية تحت النموذج هي مكوّن HomeBanner الحقيقي نفسه.
import { useEffect, useMemo, useState, useTransition } from "react";
import { HomeBanner } from "@/components/home/home-banner";
import { MediaUploader } from "@/components/admin/media-uploader";
import { COVER_BUCKET, coverPublicUrl } from "@/lib/admin/cover";
import { randomSuffix, uniqueObjectName, type ImageRules } from "@/lib/admin/media";
import { createClient } from "@/lib/supabase/client";
import {
  HOME_BANNER_LIMITS, HOME_BANNER_MEDIA_FOLDER, validateHomeBanner, type BannerIssue, type HomeBanner as HomeBannerValue,
} from "@/lib/site/home-banner";
import { discardHomeBannerDraft, publishHomeBanner, restoreHomeBannerVersion, saveHomeBannerDraft } from "./actions";

export type BannerVersionItem = { id: number; when: string; by: string };

const BANNER_IMAGE_RULES: ImageRules = {
  mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxBytes: 3 * 1024 * 1024,
  minWidth: 800,
  minHeight: 450,
  aspect: {
    min: 1.3,
    max: 1.9,
    hint: "الصورة ليست أفقية بالقدر المناسب؛ ستُقصّ أطرافها لتملأ مكانها في البانر. يمكنك المتابعة.",
  },
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
type Msg = { tone: "ok" | "error"; text: string } | null;
const DONE: Record<string, string> = {
  published: "نُشر البانر. الصفحة الرئيسية تعرض الآن هذا الإعداد.",
  discarded: "حُذفت المسودة. الصفحة الرئيسية لم تتغيّر.",
  restored: "حُمّلت النسخة السابقة في المسودة. راجعها ثم انشرها — لم يُنشر شيء بعد.",
};

type TextField = keyof typeof HOME_BANNER_LIMITS;
const TEXT_FIELDS: { id: TextField; label: string; hint?: string; multiline?: boolean; dir?: "ltr" }[] = [
  { id: "title", label: "العنوان", hint: "سطر واحد واضح. مطلوب عند الإظهار." },
  { id: "text", label: "النص", hint: "جملة أو جملتان. مطلوب عند الإظهار.", multiline: true },
  { id: "ctaLabel", label: "نص الزر (اختياري)", hint: "يُكتب مع الرابط أو يُترك فارغاً معه." },
  { id: "ctaUrl", label: "رابط الزر (اختياري)", hint: "مسار داخلي مثل /library أو قسم مثل #latest أو رابط https://", dir: "ltr" },
];

export function BannerEditor({
  initialValues, initialDraftUpdatedAt, published, versions, done,
}: {
  initialValues: HomeBannerValue;
  initialDraftUpdatedAt: string | null;
  /** null = لا إعداد منشور (لا بانر في الرئيسية) */
  published: { enabled: boolean; title: string; when: string } | null;
  versions: BannerVersionItem[];
  done: string | null;
}) {
  const [values, setValues] = useState<HomeBannerValue>(initialValues);
  const [baseline, setBaseline] = useState(JSON.stringify(initialValues));
  const [draftUpdatedAt, setDraftUpdatedAt] = useState(initialDraftUpdatedAt);
  const [serverIssues, setServerIssues] = useState<BannerIssue[]>([]);
  const [message, setMessage] = useState<Msg>(done && DONE[done] ? { tone: "ok", text: DONE[done] } : null);
  const [confirming, setConfirming] = useState<"discard" | { restore: number } | null>(null);
  const [pending, start] = useTransition();

  const dirty = JSON.stringify(values) !== baseline;
  const hasDraft = draftUpdatedAt !== null;
  const local = useMemo(() => validateHomeBanner(values, SUPABASE_URL), [values]);
  const issues = local.ok ? serverIssues : local.issues;
  const issueFor = (f: keyof HomeBannerValue) => issues.find((i) => i.field === f)?.message;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function set<K extends keyof HomeBannerValue>(key: K, v: HomeBannerValue[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
    setServerIssues([]);
  }

  function save() {
    if (!local.ok) { setMessage({ tone: "error", text: "لم تُحفظ: صحّح الحقول المعلَّمة أولاً." }); return; }
    setMessage(null);
    start(async () => {
      const res = await saveHomeBannerDraft(values, draftUpdatedAt);
      if (res.ok) {
        setValues(res.value); setBaseline(JSON.stringify(res.value)); setDraftUpdatedAt(res.draftUpdatedAt); setServerIssues([]);
        setMessage({ tone: "ok", text: "حُفظت المسودة. الصفحة الرئيسية لم تتغيّر." });
      } else if (res.kind === "validation") {
        setServerIssues(res.issues); setMessage({ tone: "error", text: "لم تُحفظ: صحّح الحقول المعلَّمة." });
      } else setMessage({ tone: "error", text: res.message });
    });
  }

  function publish() {
    if (!draftUpdatedAt) return;
    setMessage(null);
    start(async () => {
      const res = await publishHomeBanner(draftUpdatedAt);
      if (res.ok) window.location.assign("/admin/site/home-banner?done=published");
      else { if (res.issues) setServerIssues(res.issues); setMessage({ tone: "error", text: res.message }); }
    });
  }

  function discard() {
    setConfirming(null);
    start(async () => {
      const res = await discardHomeBannerDraft();
      if (res.ok) window.location.assign("/admin/site/home-banner?done=discarded");
      else setMessage({ tone: "error", text: res.message });
    });
  }

  function restore(id: number, replace: boolean) {
    start(async () => {
      const res = await restoreHomeBannerVersion(id, replace);
      if (res.ok) window.location.assign("/admin/site/home-banner?done=restored");
      else if (res.kind === "draft_exists") setConfirming({ restore: id });
      else setMessage({ tone: "error", text: res.message });
    });
  }

  async function uploadImage(file: File): Promise<string | null> {
    const path = `${HOME_BANNER_MEDIA_FOLDER}/${uniqueObjectName(file.type, Date.now(), randomSuffix(crypto.getRandomValues(new Uint8Array(8))))}`;
    // رفع مباشر بجلسة الأدمن؛ لا استبدال لملف موجود أبداً. الصورة تدخل المسودة فقط — لا تُنشر قبل «نشر».
    const { error } = await createClient().storage.from(COVER_BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type, cacheControl: "31536000" });
    if (error) return `فشل رفع الصورة: ${error.message}`;
    set("imageUrl", coverPublicUrl(SUPABASE_URL, path));
    setMessage({ tone: "ok", text: "رُفعت الصورة وأُضيفت إلى التعديلات. احفظ المسودة لتثبيتها." });
    return null;
  }

  const publishDisabled = pending || dirty || !hasDraft || !local.ok;
  const actions = (
    <div className="adm-actions">
      <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={pending || (!dirty && hasDraft)}>حفظ المسودة</button>
      <a className="adm-btn" href="/admin/site/home-banner/preview" target="_blank" rel="noreferrer"
         aria-disabled={dirty || pending || !hasDraft} title={dirty ? "احفظ التغييرات أولاً" : !hasDraft ? "لا توجد مسودة محفوظة" : undefined}>
        معاينة
      </a>
      <button type="button" className="adm-btn" onClick={publish} disabled={publishDisabled}
              title={dirty ? "احفظ التغييرات أولاً" : !hasDraft ? "لا توجد مسودة محفوظة" : undefined}>
        {pending ? "…" : "نشر"}
      </button>
    </div>
  );

  const publishedChip = !published
    ? "المنشور: لا بانر"
    : published.enabled ? `المنشور: ظاهر · ${published.when}` : `المنشور: معطّل (مخفي) · ${published.when}`;

  return (
    <div className="adm-editor">
      <div className="adm-top">
        <div className="adm-bar">
          <div className="adm-bar-title">
            <p className="adm-bar-meta">
              <a href="/admin" className="textlink">اللوحة</a>
              <span className="adm-chip" data-tone="live">{publishedChip}</span>
              <span className="adm-chip" data-tone={hasDraft ? "pending" : undefined}>{hasDraft ? "لديه مسودة غير منشورة" : "لا مسودة"}</span>
            </p>
            <h1>بانر الصفحة الرئيسية</h1>
          </div>
          <span className="adm-state" role="status">{dirty ? "تغييرات غير محفوظة" : hasDraft ? "المسودة محفوظة" : "لا تغييرات"}</span>
          {actions}
        </div>
        {message ? <p className={message.tone === "ok" ? "adm-flash" : "adm-notice"} role={message.tone === "ok" ? "status" : "alert"}>{message.text}</p> : null}
      </div>

      <p className="adm-flash">
        بطاقة واحدة تظهر تحت قسم الافتتاح مباشرة، فقط عندما تكون «ظاهرة» ومنشورة. التعطيل يخفيها ويحفظ محتواها كما هو.
        التعديلات تُحفظ في مسودة ولا تظهر في الصفحة الرئيسية قبل «نشر».
      </p>

      <section className="adm-card" aria-labelledby="banner-visibility-h">
        <header className="adm-card-head"><h2 id="banner-visibility-h">الإظهار</h2></header>
        <label className="adm-check" htmlFor="banner-enabled">
          <input id="banner-enabled" type="checkbox" checked={values.enabled} onChange={(e) => set("enabled", e.target.checked)} />
          <span>إظهار البانر في الصفحة الرئيسية</span>
        </label>
        <p className="adm-hint">
          {values.enabled
            ? "بعد النشر سيظهر البانر تحت قسم الافتتاح."
            : "معطّل: لن يظهر شيء في الصفحة الرئيسية، ولن تتغيّر مسافاتها. المحتوى أدناه يبقى محفوظاً."}
        </p>
      </section>

      <section className="adm-card" aria-labelledby="banner-fields-h">
        <header className="adm-card-head"><h2 id="banner-fields-h">النص والزر</h2></header>
        {TEXT_FIELDS.map((f) => {
          const err = issueFor(f.id);
          const common = {
            id: `banner-${f.id}`, value: values[f.id], dir: f.dir, maxLength: HOME_BANNER_LIMITS[f.id],
            "aria-invalid": err ? true : undefined,
            onChange: (e: { target: { value: string } }) => set(f.id, e.target.value),
          };
          return (
            <div className="adm-field" key={f.id}>
              <label className="adm-label" htmlFor={common.id}>{f.label}</label>
              {f.multiline ? <textarea className="adm-textarea" rows={3} {...common} /> : <input className="adm-input" {...common} />}
              {f.hint ? <p className="adm-hint">{f.hint}</p> : null}
              {err ? <p className="adm-error" role="alert">{err}</p> : null}
            </div>
          );
        })}
      </section>

      <section className="adm-card" aria-labelledby="banner-image-h">
        <header className="adm-card-head"><h2 id="banner-image-h">الصورة (اختيارية)</h2></header>
        <p className="adm-hint">
          {values.imageUrl ? "صورة مرفوعة من المحرّر." : "بلا صورة: يظهر البانر نصاً فقط."} أي صورة جديدة تدخل المسودة فقط، والصور السابقة تبقى محفوظة.
        </p>
        {values.imageUrl ? (
          <div className="adm-actions" style={{ marginBlockStart: 10 }}>
            <button type="button" className="adm-btn" disabled={pending} onClick={() => set("imageUrl", null)}>إزالة الصورة من البانر</button>
          </div>
        ) : null}
        {issueFor("imageUrl") ? <p className="adm-error" role="alert">{issueFor("imageUrl")}</p> : null}
        <MediaUploader
          inputId="banner-image"
          label={values.imageUrl ? "استبدال الصورة" : "إضافة صورة"}
          hint="JPG أو PNG أو WebP · ٣ ميغابايت كحد أقصى · العرض ٨٠٠ والارتفاع ٤٥٠ بكسل على الأقل · الأفضل صورة أفقية."
          rules={BANNER_IMAGE_RULES}
          confirmLabel="استخدم هذه الصورة في المسودة"
          confirmNote="ستُرفع الصورة وتُضاف إلى التعديلات. لا تظهر في الصفحة الرئيسية قبل حفظ المسودة ثم «نشر»."
          busy={pending}
          previewClassName="adm-media-preview adm-hero-media-preview"
          onConfirm={uploadImage}
        />
        <div className="adm-field">
          <label className="adm-label" htmlFor="banner-imageAlt">النص البديل للصورة</label>
          <input id="banner-imageAlt" className="adm-input" value={values.imageAlt} maxLength={HOME_BANNER_LIMITS.imageAlt}
                 aria-invalid={issueFor("imageAlt") ? true : undefined} onChange={(e) => set("imageAlt", e.target.value)} />
          <p className="adm-hint">وصف قصير لما في الصورة لمن لا يراها. مطلوب عند وجود صورة.</p>
          {issueFor("imageAlt") ? <p className="adm-error" role="alert">{issueFor("imageAlt")}</p> : null}
        </div>
      </section>

      <section className="adm-card" aria-labelledby="banner-actions-h">
        <header className="adm-card-head"><h2 id="banner-actions-h">الحفظ والنشر</h2></header>
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

      <section className="adm-card" aria-labelledby="banner-history-h">
        <header className="adm-card-head"><h2 id="banner-history-h">سجل النسخ</h2></header>
        <p className="adm-hint">كل سطر إعداد كان منشوراً ثم استُبدل. الاسترجاع يحمّله في المسودة لتراجعه — لا ينشره.</p>
        {versions.length === 0 ? (
          <p className="adm-hint">لا نسخ سابقة بعد.</p>
        ) : (
          <ul className="adm-history">
            {versions.map((v) => (
              <li key={v.id} className="adm-history-item">
                <div className="adm-history-main">
                  <p className="adm-history-when">استُبدلت في {v.when}</p>
                  <p className="adm-history-meta">بواسطة {v.by}</p>
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
                    <a className="adm-btn adm-btn-sm" href={`/admin/site/home-banner/preview?version=${v.id}`} target="_blank" rel="noreferrer">معاينة</a>
                    <button type="button" className="adm-btn adm-btn-sm" disabled={pending}
                            onClick={() => (hasDraft ? setConfirming({ restore: v.id }) : restore(v.id, false))}>
                      استرجاع إلى المسودة
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="adm-hero-live" aria-label="معاينة حية للبانر بالقيم الحالية في النموذج">
        <p className="adm-label adm-hero-live-label">
          معاينة حية (بالقيم الحالية في النموذج، قبل الحفظ){values.enabled ? "" : " — البانر معطّل فلن يظهر في الصفحة الرئيسية، وهذا شكله عند الإظهار"}
        </p>
        <div className="adm-hero-live-frame">
          {values.title || values.text || values.imageUrl
            ? <HomeBanner banner={{ ...(local.ok ? local.value : values), enabled: true }} />
            : <p className="adm-hint" style={{ padding: 16 }}>اكتب العنوان والنص لتظهر المعاينة.</p>}
        </div>
      </section>
    </div>
  );
}
