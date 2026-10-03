"use client";

// محرّر Hero الصفحة الرئيسية: مسودة ← معاينة ← نشر. لا شيء يصل إلى الصفحة العامة قبل «نشر».
// المعاينة الحية تحت النموذج هي مكوّن Hero الحقيقي نفسه.
import { useEffect, useMemo, useState, useTransition } from "react";
import { Hero } from "@/components/home/hero";
import { MediaUploader } from "@/components/admin/media-uploader";
import { COVER_BUCKET, coverPublicUrl } from "@/lib/admin/cover";
import { randomSuffix, uniqueObjectName, type ImageRules } from "@/lib/admin/media";
import { createClient } from "@/lib/supabase/client";
import {
  HOME_HERO_FIELDS, HOME_HERO_MEDIA_FOLDER, validateHomeHero, type HeroIssue, type HomeHero,
} from "@/lib/site/home-hero";
import { discardHomeHeroDraft, publishHomeHero, restoreHomeHeroVersion, saveHomeHeroDraft } from "./actions";

export type HeroVersionItem = { id: number; when: string; by: string };

const HERO_IMAGE_RULES: ImageRules = {
  mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxBytes: 3 * 1024 * 1024,
  minWidth: 860,
  minHeight: 560,
  aspect: {
    min: 1.2,
    max: 1.7,
    hint: "شكل الصورة بعيد عن نسبة صورة قسم الافتتاح الحالية (أعرض من ارتفاعها بنحو مرة ونصف)، وقد يتغيّر ارتفاع قسم الافتتاح. يمكنك المتابعة.",
  },
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
type Msg = { tone: "ok" | "error"; text: string } | null;
const DONE: Record<string, string> = {
  published: "نُشر قسم الافتتاح. الصفحة الرئيسية تعرض الآن هذه القيم.",
  discarded: "حُذفت المسودة. الصفحة الرئيسية لم تتغيّر.",
  restored: "حُمّلت النسخة السابقة في المسودة. راجعها ثم انشرها — لم يُنشر شيء بعد.",
};

export function HeroEditor({
  initialValues, initialDraftUpdatedAt, publishedSource, publishedWhen, versions, done,
}: {
  initialValues: HomeHero;
  initialDraftUpdatedAt: string | null;
  /** "default" = لا إعداد منشور (تُعرض قيم الكود) ؛ "custom" = إعداد منشور من المحرّر */
  publishedSource: "default" | "custom";
  publishedWhen: string | null;
  versions: HeroVersionItem[];
  done: string | null;
}) {
  const [values, setValues] = useState<HomeHero>(initialValues);
  const [baseline, setBaseline] = useState(JSON.stringify(initialValues));
  const [draftUpdatedAt, setDraftUpdatedAt] = useState(initialDraftUpdatedAt);
  const [serverIssues, setServerIssues] = useState<HeroIssue[]>([]);
  const [message, setMessage] = useState<Msg>(done && DONE[done] ? { tone: "ok", text: DONE[done] } : null);
  const [confirming, setConfirming] = useState<"discard" | { restore: number } | null>(null);
  const [pending, start] = useTransition();

  const dirty = JSON.stringify(values) !== baseline;
  const hasDraft = draftUpdatedAt !== null;
  const local = useMemo(() => validateHomeHero(values, SUPABASE_URL), [values]);
  const issues = local.ok ? serverIssues : local.issues;
  const issueFor = (f: keyof HomeHero) => issues.find((i) => i.field === f)?.message;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function set<K extends keyof HomeHero>(key: K, v: HomeHero[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
    setServerIssues([]);
  }

  function save() {
    if (!local.ok) { setMessage({ tone: "error", text: "لم تُحفظ: صحّح الحقول المعلَّمة أولاً." }); return; }
    setMessage(null);
    start(async () => {
      const res = await saveHomeHeroDraft(values, draftUpdatedAt);
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
      const res = await publishHomeHero(draftUpdatedAt);
      if (res.ok) window.location.assign("/admin/site/home-hero?done=published");
      else { if (res.issues) setServerIssues(res.issues); setMessage({ tone: "error", text: res.message }); }
    });
  }

  function discard() {
    setConfirming(null);
    start(async () => {
      const res = await discardHomeHeroDraft();
      if (res.ok) window.location.assign("/admin/site/home-hero?done=discarded");
      else setMessage({ tone: "error", text: res.message });
    });
  }

  function restore(id: number, replace: boolean) {
    start(async () => {
      const res = await restoreHomeHeroVersion(id, replace);
      if (res.ok) window.location.assign("/admin/site/home-hero?done=restored");
      else if (res.kind === "draft_exists") setConfirming({ restore: id });
      else setMessage({ tone: "error", text: res.message });
    });
  }

  async function uploadImage(file: File): Promise<string | null> {
    const path = `${HOME_HERO_MEDIA_FOLDER}/${uniqueObjectName(file.type, Date.now(), randomSuffix(crypto.getRandomValues(new Uint8Array(8))))}`;
    // رفع مباشر بجلسة الأدمن؛ لا استبدال لملف موجود أبداً. الصورة تدخل المسودة فقط — لا تُنشر قبل «نشر».
    const { error } = await createClient().storage.from(COVER_BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type, cacheControl: "31536000" });
    if (error) return `فشل رفع الصورة: ${error.message}`;
    set("image_url", coverPublicUrl(SUPABASE_URL, path));
    setMessage({ tone: "ok", text: "رُفعت الصورة وأُضيفت إلى التعديلات. احفظ المسودة لتثبيتها." });
    return null;
  }

  const publishDisabled = pending || dirty || !hasDraft || !local.ok;
  const actions = (
    <div className="adm-actions">
      <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={pending || !dirty}>حفظ المسودة</button>
      <a className="adm-btn" href="/admin/site/home-hero/preview" target="_blank" rel="noreferrer"
         aria-disabled={dirty || pending || !hasDraft} title={dirty ? "احفظ التغييرات أولاً" : !hasDraft ? "لا توجد مسودة محفوظة" : undefined}>
        معاينة
      </a>
      <button type="button" className="adm-btn" onClick={publish} disabled={publishDisabled}
              title={dirty ? "احفظ التغييرات أولاً" : !hasDraft ? "لا توجد مسودة محفوظة" : undefined}>
        {pending ? "…" : "نشر"}
      </button>
    </div>
  );

  return (
    <div className="adm-editor">
      <div className="adm-top">
        <div className="adm-bar">
          <div className="adm-bar-title">
            <p className="adm-bar-meta">
              <a href="/admin" className="textlink">اللوحة</a>
              <span className="adm-chip" data-tone="live">
                {publishedSource === "default" ? "المنشور: قسم الافتتاح الأصلي (من الكود)" : `المنشور: إعداد محفوظ${publishedWhen ? ` · ${publishedWhen}` : ""}`}
              </span>
              <span className="adm-chip" data-tone={hasDraft ? "pending" : undefined}>{hasDraft ? "لديه مسودة غير منشورة" : "لا مسودة"}</span>
            </p>
            <h1>قسم الافتتاح في الصفحة الرئيسية</h1>
          </div>
          <span className="adm-state" role="status">{dirty ? "تغييرات غير محفوظة" : hasDraft ? "المسودة محفوظة" : "لا تغييرات"}</span>
          {actions}
        </div>
        {message ? <p className={message.tone === "ok" ? "adm-flash" : "adm-notice"} role={message.tone === "ok" ? "status" : "alert"}>{message.text}</p> : null}
      </div>

      <p className="adm-flash">
        التعديلات تُحفظ في مسودة ولا تظهر في الصفحة الرئيسية قبل «نشر». التصميم والتخطيط ثابتان — هنا النصوص والروابط والصورة فقط.
        {publishedSource === "default" && !hasDraft ? " الحقول معبّأة الآن بنص قسم الافتتاح الحالي كما هو." : ""}
      </p>

      <section className="adm-card" aria-labelledby="hero-fields-h">
        <header className="adm-card-head"><h2 id="hero-fields-h">النصوص والروابط</h2></header>
        {HOME_HERO_FIELDS.filter((f) => f.id !== "image_alt").map((f) => {
          const err = issueFor(f.id);
          const common = {
            id: `hero-${f.id}`, value: values[f.id], dir: f.dir, "aria-invalid": err ? true : undefined,
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

      <section className="adm-card" aria-labelledby="hero-image-h">
        <header className="adm-card-head"><h2 id="hero-image-h">الصورة</h2></header>
        <p className="adm-hint">
          {values.image_url ? "صورة مرفوعة من المحرّر." : "الصورة الحالية للـHero (من الموقع)."} أي صورة جديدة تدخل المسودة فقط، والصور السابقة تبقى محفوظة.
        </p>
        {values.image_url ? (
          <div className="adm-actions" style={{ marginBlockStart: 10 }}>
            <button type="button" className="adm-btn" disabled={pending} onClick={() => set("image_url", null)}>العودة إلى الصورة الأصلية</button>
          </div>
        ) : null}
        {issueFor("image_url") ? <p className="adm-error" role="alert">{issueFor("image_url")}</p> : null}
        <MediaUploader
          inputId="hero-image"
          label="استبدال الصورة"
          hint="JPG أو PNG أو WebP · ٣ ميغابايت كحد أقصى · العرض ٨٦٠ والارتفاع ٥٦٠ بكسل على الأقل · الأفضل صورة أفقية بنسبة الصورة الحالية."
          rules={HERO_IMAGE_RULES}
          confirmLabel="استخدم هذه الصورة في المسودة"
          confirmNote="ستُرفع الصورة وتُضاف إلى التعديلات. لا تظهر في الصفحة الرئيسية قبل حفظ المسودة ثم «نشر»."
          busy={pending}
          previewClassName="adm-media-preview adm-hero-media-preview"
          onConfirm={uploadImage}
        />
        {(() => {
          const f = HOME_HERO_FIELDS.find((x) => x.id === "image_alt")!;
          const err = issueFor("image_alt");
          return (
            <div className="adm-field">
              <label className="adm-label" htmlFor="hero-image_alt">{f.label}</label>
              <input id="hero-image_alt" className="adm-input" value={values.image_alt} aria-invalid={err ? true : undefined}
                     onChange={(e) => set("image_alt", e.target.value)} />
              <p className="adm-hint">{f.hint}</p>
              {err ? <p className="adm-error" role="alert">{err}</p> : null}
            </div>
          );
        })()}
      </section>

      <section className="adm-card" aria-labelledby="hero-actions-h">
        <header className="adm-card-head"><h2 id="hero-actions-h">الحفظ والنشر</h2></header>
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

      <section className="adm-card" aria-labelledby="hero-history-h">
        <header className="adm-card-head"><h2 id="hero-history-h">سجل النسخ</h2></header>
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
                    <a className="adm-btn adm-btn-sm" href={`/admin/site/home-hero/preview?version=${v.id}`} target="_blank" rel="noreferrer">معاينة</a>
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

      <section className="adm-hero-live" aria-label="معاينة حية للـHero بالقيم الحالية في النموذج">
        <p className="adm-label adm-hero-live-label">معاينة حية (بالقيم الحالية في النموذج، قبل الحفظ)</p>
        <div className="adm-hero-live-frame">
          <Hero content={local.ok ? local.value : values} />
        </div>
      </section>
    </div>
  );
}
