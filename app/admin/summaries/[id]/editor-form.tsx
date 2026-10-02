"use client";

// محرّر مسودة ملخص — نموذج منظّم يطابق lib/types.ts. لا JSON خام.
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { toArabicNumerals } from "@/lib/site.config";
import {
  LIST_HINTS, MINUTES_MAX, MINUTES_MIN, PILLAR_FIELDS, QUOTE_FIELDS, SCORE_FIELDS, SECTIONS, TEXT_FIELDS,
  countRecommendations, publishRequirements, validateValues,
  type EditorValues, type Issue, type SectionId,
} from "@/lib/admin/summary-content";
import {
  discardSummaryEdits, publishFromEditor, publishSummaryEdits, saveDraftSummary, saveSummaryEdits,
} from "./actions";

/** ملخص سبق نشره: تعديلاته تُحفظ في مسودة ولا تمس النسخة الحية حتى «نشر التعديلات» */
export type PublishedInfo = {
  /** ظاهر للعموم الآن؟ (سبق نشره لكنه مخفي حالياً = false) */
  isLive: boolean;
  slug: string;
  firstPublished: string;
  lastPublishedUpdate: string;
  hasDraft: boolean;
  draftUpdatedAt: string | null;
  /** updated_at للنسخة الحية كما حُمّلت مع الصفحة — أساس أول حفظ */
  liveUpdatedAt: string;
  /** أقسام تغيّرت في النسخة الحية بعد بدء المسودة، أو null */
  liveChanged: SectionId[] | null;
  done: "published" | "discarded" | "restored" | null;
};

type Props = {
  id: string;
  initialValues: EditorValues;
  initialUpdatedAt: string;
  categories: { id: string; name_ar: string }[];
  storedIssues: Issue[];
  publishBlocked: boolean;
  /** null = مسودة لم تُنشر قط (الخطوة ٢) */
  published: PublishedInfo | null;
};

type Conflict = { liveUpdatedAt: string; changed: SectionId[]; again: boolean };

const DONE_TEXT = {
  published: "نُشرت التعديلات. النسخة السابقة محفوظة في سجل النسخ.",
  discarded: "أُزيلت التعديلات غير المنشورة. النسخة الحية لم تتغيّر.",
  restored: "حُمّلت النسخة السابقة في المسودة. راجعها ثم انشر التعديلات — لم يُنشر شيء بعد.",
} as const;

const sectionTitle = (id: SectionId) => SECTIONS.find((s) => s.id === id)?.title ?? id;

type TextDef = readonly [string, string, number];
const fid = (field: string) => `f-${field.replaceAll(".", "-")}`;

/** أسفل ما يغطّي أعلى الصفحة حين يلتصق: هيدر الموقع، وشريط المحرّر (لاصق على سطح المكتب فقط).
    لكل عنصر لاصق: موضع التصاقه (top) + ارتفاعه؛ والنتيجة أبعدها عن أعلى الشاشة. */
function stickyOffset(): number {
  let offset = 0;
  for (const selector of [".site-header", ".adm-top"]) {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) continue;
    const style = getComputedStyle(el);
    if (style.position !== "sticky") continue;
    offset = Math.max(offset, (parseFloat(style.top) || 0) + el.getBoundingClientRect().height);
  }
  return offset;
}

/** ينتقل إلى الحقل (أو عنصره، أو قسمه) ويضعه ظاهراً تحت الأشرطة اللاصقة ثم يركّز عليه */
function focusField(field: string) {
  const parts = field.split(".");
  let el: HTMLElement | null = null;
  // الحقل نفسه، ثم أقرب أصل له معرّف (عنصر القائمة ثم القائمة)، ثم القسم
  for (let n = parts.length; n > 0 && !el; n--) el = document.getElementById(fid(parts.slice(0, n).join(".")));
  if (!el) el = document.getElementById(`sec-${parts[0] === "meta" ? "basic" : parts[0]}`);
  if (!el) return;
  // العنوان (label) فوق الحقل يبقى ظاهراً أيضاً
  const anchor = el.closest<HTMLElement>(".adm-field") ?? el;
  const top = anchor.getBoundingClientRect().top + window.scrollY - stickyOffset() - 16;
  // قفزة فورية: التمرير الناعم على نموذج طويل بطيء ويترك الحقل خارج الشاشة لحظة التركيز
  window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
  el.focus({ preventScroll: true });
}

export function EditorForm({
  id, initialValues, initialUpdatedAt, categories, storedIssues, publishBlocked, published,
}: Props) {
  const [values, setValues] = useState<EditorValues>(initialValues);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initialValues));
  const [savedSlug, setSavedSlug] = useState(initialValues.meta.slug);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  // توقيت الصف الحي المتوقع عند أول حفظ لتعديلات ملخص منشور؛ يتبع تغيير الغلاف من لوحة الغلاف
  const [liveUpdatedAt, setLiveUpdatedAt] = useState(published?.liveUpdatedAt ?? initialUpdatedAt);
  const [serverIssues, setServerIssues] = useState<Issue[]>(storedIssues);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(
    publishBlocked
      ? { tone: "error", text: "لم يُنشر الملخص: صحّح الحقول المعلَّمة ثم احفظ وأعد المحاولة." }
      : published?.done
        ? { tone: "ok", text: DONE_TEXT[published.done] }
        : null,
  );
  // حالة مسودة الملخص المنشور
  const [hasDraft, setHasDraft] = useState(published?.hasDraft ?? false);
  const [draftUpdatedAt, setDraftUpdatedAt] = useState(published?.draftUpdatedAt ?? null);
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const [confirming, setConfirming] = useState<"discard" | "overwrite" | null>(null);
  const [discarding, startDiscarding] = useTransition();
  // شروط اكتمال النشر تُعلَّم على الحقول بعد محاولة نشر فقط — المسودة الناقصة ليست خطأً
  const [showRequired, setShowRequired] = useState(publishBlocked);
  const [saving, startSaving] = useTransition();
  const [publishing, startPublishing] = useTransition();

  const categoryIds = useMemo(() => categories.map((c) => c.id), [categories]);
  const errors = useMemo(() => validateValues(values, categoryIds), [values, categoryIds]);
  const required = useMemo(() => publishRequirements(values), [values]);
  const recommendations = useMemo(() => countRecommendations(values), [values]);
  const dirty = JSON.stringify(values) !== baseline;
  const allErrors = useMemo(() => [...errors, ...serverIssues], [errors, serverIssues]);
  const marked = useMemo(() => (showRequired ? [...allErrors, ...required] : allErrors), [allErrors, required, showRequired]);
  const errorOf = (field: string) => marked.find((i) => i.field === field)?.message;
  const sectionHasError = (s: SectionId) => marked.some((i) => i.section === s);

  const update = useCallback((fn: (draft: EditorValues) => void) => {
    setValues((prev) => {
      const draft = structuredClone(prev);
      fn(draft);
      return draft;
    });
  }, []);

  // تغيير الغلاف يحدّث updated_at للصف دون أن يمسّ النص: نتبعه كي لا يُحسب تعارضاً عند الحفظ
  useEffect(() => {
    const onTouched = (e: Event) => {
      const next = (e as CustomEvent<{ updatedAt?: string }>).detail?.updatedAt;
      if (typeof next !== "string") return;
      setUpdatedAt(next);
      setLiveUpdatedAt(next);
    };
    window.addEventListener("bh:summary-touched", onTouched);
    return () => window.removeEventListener("bh:summary-touched", onTouched);
  }, []);

  // تحذير المتصفح عند مغادرة الصفحة بتغييرات غير محفوظة
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // عند رفض النشر: الانتقال إلى أول حقل فيه خطأ
  useEffect(() => {
    if (!publishBlocked) return;
    const first = [...validateValues(initialValues, categoryIds), ...storedIssues, ...publishRequirements(initialValues)][0];
    if (first) focusField(first.field);
    // مرة واحدة عند التحميل
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSave() {
    if (errors.length) {
      setMessage({ tone: "error", text: "لم يُحفظ: صحّح الحقول المعلَّمة أولاً." });
      focusField(errors[0].field);
      return;
    }
    if (published) {
      startSaving(async () => {
        const res = await saveSummaryEdits(id, values, { draftUpdatedAt, liveUpdatedAt });
        if (res.ok) {
          setValues(res.values);
          setBaseline(JSON.stringify(res.values));
          setHasDraft(true);
          setDraftUpdatedAt(res.draftUpdatedAt);
          setServerIssues([]);
          setMessage({ tone: "ok", text: "حُفظت المسودة. النسخة الحية لم تتغيّر." });
        } else if (res.kind === "validation") {
          setServerIssues(res.issues);
          setMessage({ tone: "error", text: "لم تُحفظ المسودة: صحّح الحقول المعلَّمة." });
          if (res.issues[0]) focusField(res.issues[0].field);
        } else {
          setMessage({ tone: "error", text: res.message });
        }
      });
      return;
    }
    startSaving(async () => {
      const res = await saveDraftSummary(id, values, updatedAt);
      if (res.ok) {
        setValues(res.values);
        setBaseline(JSON.stringify(res.values));
        setSavedSlug(res.values.meta.slug);
        setUpdatedAt(res.updatedAt);
        setServerIssues([]);
        setMessage({ tone: "ok", text: "حُفظت التغييرات." });
      } else if (res.kind === "validation") {
        setServerIssues(res.issues);
        setMessage({ tone: "error", text: "لم يُحفظ: صحّح الحقول المعلَّمة." });
        if (res.issues[0]) focusField(res.issues[0].field);
      } else {
        setMessage({ tone: "error", text: res.message });
      }
    });
  }

  function onPublish() {
    if (dirty || allErrors.length) return;
    if (required.length) {
      // الملخص الناقص لا يُنشر: نعلّم الحقول الناقصة وننتقل إلى أولها (والخادم يفرض الشرط نفسه)
      setShowRequired(true);
      setMessage({ tone: "error", text: "لم يُنشر الملخص: أكمل الحقول المطلوبة للنشر ثم احفظ." });
      focusField(required[0].field);
      return;
    }
    if (published) {
      publishEdits(null);
      return;
    }
    startPublishing(async () => {
      await publishFromEditor(id, savedSlug);
    });
  }

  /** نشر تعديلات ملخص منشور. overwrite = توقيت النسخة الحية التي أكّد الأدمن الكتابة فوقها */
  function publishEdits(overwrite: { liveUpdatedAt: string } | null) {
    if (!draftUpdatedAt) return;
    setConfirming(null);
    startPublishing(async () => {
      const res = await publishSummaryEdits(id, draftUpdatedAt, overwrite);
      if (res.ok) {
        window.location.assign(`/admin/summaries/${id}?done=published`);
      } else if (res.kind === "validation") {
        setServerIssues(res.issues);
        setShowRequired(true);
        setMessage({ tone: "error", text: "لم تُنشر التعديلات: صحّح الحقول المعلَّمة ثم احفظ المسودة." });
        if (res.issues[0]) focusField(res.issues[0].field);
      } else if (res.kind === "conflict") {
        setConflict({ liveUpdatedAt: res.liveUpdatedAt, changed: res.changed, again: res.again });
        setDraftUpdatedAt(res.draftUpdatedAt);   // قد تكون المسودة أُعيد تأسيسها قبل أن يوقف الحارس النشر
        setMessage({
          tone: "error",
          text: res.again
            ? "تغيّرت النسخة الحية مرة أخرى. لم يُنشر شيء — راجعها ثم أكّد من جديد."
            : "لم تُنشر التعديلات: تغيّر محتوى النسخة الحية بعد بدء هذه المسودة.",
        });
        document.getElementById("adm-conflict")?.scrollIntoView({ block: "center" });
      } else {
        setMessage({ tone: "error", text: res.message });
      }
    });
  }

  function onDiscard() {
    setConfirming(null);
    startDiscarding(async () => {
      const res = await discardSummaryEdits(id);
      if (res.ok) window.location.assign(`/admin/summaries/${id}?done=discarded`);
      else setMessage({ tone: "error", text: res.message });
    });
  }

  const busy = saving || publishing || discarding;
  const state = saving ? "saving" : dirty ? "dirty" : "saved";
  const stateText = saving
    ? "جارٍ الحفظ…"
    : dirty
      ? "تغييرات غير محفوظة"
      : published
        ? hasDraft ? "المسودة محفوظة" : "لا تعديلات غير محفوظة"
        : "كل التغييرات محفوظة";
  const labels = published
    ? { save: "حفظ المسودة", preview: "معاينة التعديلات", publish: "نشر التعديلات", publishing: "جارٍ نشر التعديلات…" }
    : { save: "حفظ", preview: "معاينة", publish: "نشر", publishing: "جارٍ النشر…" };
  const previewSlug = published ? published.slug : savedSlug;
  const publishDisabled = busy || dirty || allErrors.length > 0 || (!!published && !hasDraft);

  const actions = (
    <div className="adm-actions">
      <button type="button" className="adm-btn adm-btn-primary" onClick={onSave} disabled={busy || !dirty}>
        {labels.save}
      </button>
      <a
        className="adm-btn"
        href={`/admin/preview/${previewSlug}`}
        target="_blank"
        rel="noreferrer"
        aria-disabled={dirty || busy}
        title={dirty ? "احفظ التغييرات أولاً" : undefined}
      >
        {labels.preview}
      </a>
      <button
        type="button"
        className="adm-btn"
        onClick={onPublish}
        disabled={publishDisabled}
        title={
          dirty ? "احفظ التغييرات أولاً"
            : allErrors.length ? "صحّح الأخطاء أولاً"
              : published && !hasDraft ? "لا تعديلات غير منشورة"
                : required.length ? "أكمل الحقول المطلوبة للنشر" : undefined
        }
      >
        {publishing ? labels.publishing : labels.publish}
      </button>
    </div>
  );

  /* التراجع عن التعديلات غير المنشورة — بتأكيد من خطوتين */
  const discardConfirm = (
    <div className="adm-confirm" role="alertdialog" aria-label="تأكيد التراجع">
      <p>ستُحذف التعديلات غير المنشورة نهائياً، وتبقى النسخة الحية كما هي.</p>
      <div className="adm-actions">
        <button type="button" className="adm-btn adm-btn-danger" onClick={onDiscard} disabled={busy}>
          {discarding ? "جارٍ التراجع…" : "نعم، تراجع عن التعديلات"}
        </button>
        <button type="button" className="adm-btn" onClick={() => setConfirming(null)} disabled={busy}>إلغاء</button>
      </div>
    </div>
  );
  const discardControl = published && hasDraft ? (
    confirming === "discard" && !conflict ? discardConfirm : (
      <button type="button" className="adm-btn adm-btn-danger" onClick={() => setConfirming("discard")} disabled={busy}>
        التراجع عن التعديلات غير المنشورة
      </button>
    )
  ) : null;

  // ── عناصر الحقول ──────────────────────────────────────────
  const text = (
    field: string, label: string, value: string, onChange: (v: string) => void,
    opts: { rows?: number; dir?: "ltr" | "rtl"; hint?: string; type?: "text" | "number" } = {},
  ) => {
    const err = errorOf(field);
    const rows = opts.rows ?? 1;
    const common = {
      id: fid(field),
      value,
      dir: opts.dir,
      "aria-invalid": err ? true : undefined,
      "aria-describedby": err ? `${fid(field)}-err` : undefined,
    } as const;
    return (
      <div className="adm-field" key={field}>
        <label className="adm-label" htmlFor={fid(field)}>{label}</label>
        {rows > 1 ? (
          <textarea {...common} className="adm-textarea" rows={rows} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input
            {...common}
            className="adm-input"
            type={opts.type ?? "text"}
            inputMode={opts.type === "number" ? "numeric" : undefined}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
        {opts.hint ? <p className="adm-hint">{opts.hint}</p> : null}
        {err ? <p className="adm-error" id={`${fid(field)}-err`}>{err}</p> : null}
      </div>
    );
  };

  const textGroup = <S extends "s1" | "s2" | "s3" | "s4" | "s7" | "s8" | "s9">(section: S, defs: readonly TextDef[]) =>
    defs.map(([key, label, rows]) =>
      text(
        `${section}.${key}`, label,
        (values[section] as unknown as Record<string, string>)[key],
        (v) => update((d) => { (d[section] as unknown as Record<string, string>)[key] = v; }),
        { rows },
      ));

  const move = <T,>(list: T[], from: number, to: number) => {
    if (to < 0 || to >= list.length) return;
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
  };

  const itemControls = (label: string, i: number, n: number, onMove: (to: number) => void, onRemove: () => void) => (
    <div className="adm-item-tools">
      <button type="button" className="adm-btn adm-btn-sm" onClick={() => onMove(i - 1)} disabled={i === 0} aria-label={`تقديم ${label}`}>↑</button>
      <button type="button" className="adm-btn adm-btn-sm" onClick={() => onMove(i + 1)} disabled={i === n - 1} aria-label={`تأخير ${label}`}>↓</button>
      <button type="button" className="adm-btn adm-btn-sm adm-btn-danger" onClick={onRemove}>حذف</button>
    </div>
  );

  const stringList = (
    field: "s3.questions" | "s8.week_plan", label: string, itemLabel: string, hint: string,
    get: (d: EditorValues) => string[],
  ) => {
    const list = get(values);
    return (
      <div className="adm-field" id={fid(field)} tabIndex={-1}>
        <p className="adm-label">{label} <span className="adm-count">({toArabicNumerals(list.length)})</span></p>
        <p className="adm-hint">{hint}</p>
        {errorOf(field) ? <p className="adm-error">{errorOf(field)}</p> : null}
        {list.map((v, i) => (
          <div className="adm-row" key={i}>
            <span className="adm-row-n" aria-hidden="true">{toArabicNumerals(i + 1)}</span>
            <textarea
              id={fid(`${field}.${i}`)}
              className="adm-textarea adm-textarea-sm"
              rows={2}
              value={v}
              aria-label={`${itemLabel} ${toArabicNumerals(i + 1)}`}
              aria-invalid={errorOf(`${field}.${i}`) ? true : undefined}
              onChange={(e) => update((d) => { get(d)[i] = e.target.value; })}
            />
            {itemControls(
              `${itemLabel} ${toArabicNumerals(i + 1)}`, i, list.length,
              (to) => update((d) => move(get(d), i, to)),
              () => update((d) => { get(d).splice(i, 1); }),
            )}
          </div>
        ))}
        <button type="button" className="adm-btn adm-btn-sm adm-add" onClick={() => update((d) => { get(d).push(""); })}>
          + إضافة {itemLabel}
        </button>
      </div>
    );
  };

  const card = (sid: SectionId, children: React.ReactNode, note?: string) => {
    const meta = SECTIONS.find((s) => s.id === sid)!;
    return (
      <section className="adm-card" id={`sec-${sid}`} tabIndex={-1} aria-labelledby={`sec-${sid}-h`}>
        <header className="adm-card-head">
          {meta.n ? <span className="adm-card-n">القسم {toArabicNumerals(meta.n)}</span> : null}
          <h2 id={`sec-${sid}-h`}>{meta.title}</h2>
        </header>
        {note ? <p className="adm-hint">{note}</p> : null}
        {children}
      </section>
    );
  };

  const navLabel = (s: (typeof SECTIONS)[number]) => (s.n ? `${toArabicNumerals(s.n)} · ${s.title}` : s.title);

  return (
    <div className="adm-editor">
      <div className="adm-top">
        <div className="adm-bar">
          <div className="adm-bar-title">
            {published ? (
              <p className="adm-bar-meta">
                <Link href="/admin" className="textlink">اللوحة</Link>
                {published.isLive ? (
                  <span className="adm-chip" data-tone="live">منشور</span>
                ) : (
                  <>
                    <span className="adm-chip" data-tone="off">غير منشور حالياً</span>
                    <span className="adm-chip">سبق نشره</span>
                  </>
                )}
                <span className="adm-chip" data-tone={hasDraft ? "pending" : undefined}>
                  {hasDraft ? "لديه تعديلات غير منشورة" : "لا تعديلات غير منشورة"}
                </span>
              </p>
            ) : (
              <p className="adm-bar-meta">
                <Link href="/admin" className="textlink">اللوحة</Link> · مسودة — لم تُنشر بعد
              </p>
            )}
            <h1>{values.meta.book_title_ar || "ملخص بلا عنوان"}</h1>
            {published ? (
              <p className="adm-bar-meta">
                نُشر أول مرة: {published.firstPublished} · آخر تحديث منشور: {published.lastPublishedUpdate}
              </p>
            ) : null}
          </div>
          <span className="adm-state" data-state={state} role="status">{stateText}</span>
          {actions}
        </div>
        {message ? (
          <p className={message.tone === "ok" ? "adm-flash" : "adm-notice"} role={message.tone === "ok" ? "status" : "alert"}>
            {message.text}
          </p>
        ) : null}
      </div>

      {published && !published.isLive ? (
        <p className="adm-flash">
          هذا الملخص غير ظاهر للعموم حالياً. نشر التعديلات يحدّث محتواه فقط ولا يعيد إظهاره.
        </p>
      ) : null}

      {published?.liveChanged && !conflict ? (
        <div className="adm-notice" role="status">
          <p>تغيّر محتوى النسخة الحية بعد بدء هذه المسودة.</p>
          <p className="adm-notice-sub">
            الأقسام المتغيّرة: {published.liveChanged.map(sectionTitle).join("، ")}. سيُطلب منك القرار عند النشر.
          </p>
        </div>
      ) : null}

      {conflict ? (
        <div className="adm-notice adm-conflict" id="adm-conflict" role="alertdialog" aria-label="تعارض مع النسخة الحية">
          <p>{conflict.again ? "تغيّرت النسخة الحية مرة أخرى." : "تغيّر محتوى النسخة الحية بعد بدء هذه المسودة."} لم يُنشر شيء.</p>
          {conflict.changed.length > 0 ? (
            <p className="adm-notice-sub">الأقسام المتغيّرة في النسخة الحية: {conflict.changed.map(sectionTitle).join("، ")}.</p>
          ) : null}
          {confirming === "overwrite" ? (
            <div className="adm-confirm">
              <p>ستستبدل تعديلاتُك محتوى النسخة الحية الحالية. تبقى النسخة الحالية في سجل النسخ ويمكن استرجاعها.</p>
              <div className="adm-actions">
                <button
                  type="button" className="adm-btn adm-btn-danger" disabled={busy}
                  onClick={() => publishEdits({ liveUpdatedAt: conflict.liveUpdatedAt })}
                >
                  {publishing ? "جارٍ النشر…" : "نعم، انشر تعديلاتي فوق النسخة الحية"}
                </button>
                <button type="button" className="adm-btn" onClick={() => setConfirming(null)} disabled={busy}>إلغاء</button>
              </div>
            </div>
          ) : confirming === "discard" ? discardConfirm : (
            <div className="adm-actions">
              <a className="adm-btn" href={`/admin/preview/${previewSlug}?v=live`} target="_blank" rel="noreferrer">
                عرض النسخة الحية الحالية
              </a>
              <button type="button" className="adm-btn" onClick={() => setConfirming("discard")} disabled={busy}>
                التراجع عن تعديلاتي
              </button>
              <button type="button" className="adm-btn adm-btn-danger" onClick={() => setConfirming("overwrite")} disabled={busy}>
                نشر تعديلاتي فوق النسخة الحية
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* الجوال: قائمة منسدلة مدمجة بدل الشريط الجانبي */}
      <div className="adm-jump">
        <label className="adm-label" htmlFor="adm-jump-select">انتقل إلى</label>
        <select
          id="adm-jump-select"
          className="adm-select"
          value=""
          onChange={(e) => {
            const target = e.target.value;
            if (target) document.getElementById(`sec-${target}`)?.scrollIntoView({ block: "start" });
          }}
        >
          <option value="">اختر قسماً…</option>
          {SECTIONS.map((s) => (
            <option key={s.id} value={s.id}>{navLabel(s)}{sectionHasError(s.id) ? " — فيه خطأ" : ""}</option>
          ))}
          <option value="save">الحفظ والمعاينة</option>
          <option value="cover">الغلاف</option>
          {published ? <option value="history">سجل النسخ</option> : null}
        </select>
      </div>

      <div className="adm-layout">
        <nav className="adm-nav" aria-label="أقسام المحرّر">
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#sec-${s.id}`} data-error={sectionHasError(s.id) ? "true" : undefined}>
                  {navLabel(s)}
                </a>
              </li>
            ))}
            <li><a href="#sec-save">الحفظ والمعاينة</a></li>
            <li><a href="#sec-cover">الغلاف</a></li>
            {published ? <li><a href="#sec-history">سجل النسخ</a></li> : null}
          </ul>
        </nav>

        <div className="adm-main">
          <p className="adm-group">المعلومات الأساسية</p>
          {card("basic", (
            <>
              {text("meta.book_title_ar", "العنوان العربي", values.meta.book_title_ar,
                (v) => update((d) => { d.meta.book_title_ar = v; }))}
              <div className="adm-grid2">
                {text("meta.book_title_en", "العنوان الإنجليزي", values.meta.book_title_en,
                  (v) => update((d) => { d.meta.book_title_en = v; }), { dir: "ltr" })}
                {text("meta.author", "المؤلف", values.meta.author,
                  (v) => update((d) => { d.meta.author = v; }))}
              </div>
              <div className="adm-grid2">
                <div className="adm-field">
                  <label className="adm-label" htmlFor={fid("meta.category_id")}>القسم</label>
                  <select
                    id={fid("meta.category_id")}
                    className="adm-select"
                    value={values.meta.category_id}
                    aria-invalid={errorOf("meta.category_id") ? true : undefined}
                    onChange={(e) => update((d) => { d.meta.category_id = e.target.value; })}
                  >
                    <option value="">اختر قسماً…</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
                  </select>
                  {errorOf("meta.category_id") ? <p className="adm-error">{errorOf("meta.category_id")}</p> : null}
                </div>
                {text("meta.reading_minutes", "مدة القراءة (بالدقائق)", values.meta.reading_minutes,
                  (v) => update((d) => { d.meta.reading_minutes = v; }),
                  { type: "number", dir: "ltr", hint: `من ${toArabicNumerals(MINUTES_MIN)} إلى ${toArabicNumerals(MINUTES_MAX)} دقيقة.` })}
              </div>
              {published ? (
                <div className="adm-field">
                  <label className="adm-label" htmlFor={fid("meta.slug")}>المسار (slug)</label>
                  <input id={fid("meta.slug")} className="adm-input" dir="ltr" value={published.slug} readOnly aria-readonly="true" />
                  <p className="adm-hint">مقفول نهائياً: هذا الملخص نُشر من قبل، وتغيير المسار يكسر روابطه.</p>
                </div>
              ) : (
                text("meta.slug", "المسار (slug)", values.meta.slug,
                  (v) => update((d) => { d.meta.slug = v; }),
                  { dir: "ltr", hint: "لا يتغيّر تلقائياً عند تعديل العنوان. يُقفل نهائياً بعد أول نشر." })
              )}
              <p className="adm-url" dir="ltr">bahjaa.com/s/{published ? published.slug : values.meta.slug || "…"}</p>
            </>
          ))}

          <p className="adm-group">الأقسام ١–٤ · مفتوحة للجميع</p>
          {card("s1", textGroup("s1", TEXT_FIELDS.s1))}
          {card("s2", textGroup("s2", TEXT_FIELDS.s2))}
          {card("s3", (
            <>
              {stringList("s3.questions", "الأسئلة", "سؤال", LIST_HINTS.questions.text, (d) => d.s3.questions)}
              {textGroup("s3", TEXT_FIELDS.s3)}
            </>
          ))}
          {card("s4", textGroup("s4", TEXT_FIELDS.s4))}

          <p className="adm-group">الأقسام ٥–١٠ · خلف جدار البريد</p>
          {card("s5", (
            <div id={fid("s5")} tabIndex={-1}>
              <p className="adm-hint">{LIST_HINTS.s5.text} · الموجود الآن: {toArabicNumerals(values.s5.length)}</p>
              {errorOf("s5") ? <p className="adm-error">{errorOf("s5")}</p> : null}
              {values.s5.map((p, i) => (
                <div className="adm-item" key={i} id={fid(`s5.${i}`)}>
                  <div className="adm-item-head">
                    <p className="adm-item-title">المحور {toArabicNumerals(i + 1)}</p>
                    {itemControls(
                      `المحور ${toArabicNumerals(i + 1)}`, i, values.s5.length,
                      (to) => update((d) => move(d.s5, i, to)),
                      () => update((d) => { d.s5.splice(i, 1); }),
                    )}
                  </div>
                  {PILLAR_FIELDS.map(([key, label, rows]) =>
                    text(`s5.${i}.${key}`, label, p[key], (v) => update((d) => { d.s5[i][key] = v; }), { rows }))}
                </div>
              ))}
              <button
                type="button" className="adm-btn adm-btn-sm adm-add"
                onClick={() => update((d) => { d.s5.push({ src: null, title: "", essence: "", why_you: "", common_trap: "" }); })}
              >
                + إضافة محور
              </button>
            </div>
          ))}
          {card("s6", (
            <div id={fid("s6")} tabIndex={-1}>
              <p className="adm-hint">{LIST_HINTS.s6.text} · الموجود الآن: {toArabicNumerals(values.s6.length)}</p>
              {errorOf("s6") ? <p className="adm-error">{errorOf("s6")}</p> : null}
              {values.s6.map((q, i) => (
                <div className="adm-item" key={i} id={fid(`s6.${i}`)}>
                  <div className="adm-item-head">
                    <p className="adm-item-title">الاقتباس {toArabicNumerals(i + 1)}</p>
                    {itemControls(
                      `الاقتباس ${toArabicNumerals(i + 1)}`, i, values.s6.length,
                      (to) => update((d) => move(d.s6, i, to)),
                      () => update((d) => { d.s6.splice(i, 1); }),
                    )}
                  </div>
                  {QUOTE_FIELDS.map(([key, label, rows]) =>
                    text(`s6.${i}.${key}`, label, q[key], (v) => update((d) => { d.s6[i][key] = v; }), { rows }))}
                </div>
              ))}
              <button
                type="button" className="adm-btn adm-btn-sm adm-add"
                onClick={() => update((d) => { d.s6.push({ src: null, quote: "", interpretation: "" }); })}
              >
                + إضافة اقتباس
              </button>
            </div>
          ))}
          {card("s7", textGroup("s7", TEXT_FIELDS.s7))}
          {card("s8", (
            <>
              {textGroup("s8", TEXT_FIELDS.s8a)}
              {stringList("s8.week_plan", "خطة الأسبوع الأول", "خطوة", LIST_HINTS.week_plan.text, (d) => d.s8.week_plan)}
              {textGroup("s8", TEXT_FIELDS.s8b)}
            </>
          ))}
          {card("s9", textGroup("s9", TEXT_FIELDS.s9))}
          {card("s10", (
            <>
              {SCORE_FIELDS.map(([key, jkey, label]) => (
                <div className="adm-score" key={key}>
                  {text(`s10.${key}`, `${label} — الدرجة من ١٠`, values.s10[key],
                    (v) => update((d) => { d.s10[key] = v; }), { type: "number", dir: "ltr" })}
                  {text(`s10.${jkey}`, "المبرّر", values.s10[jkey],
                    (v) => update((d) => { d.s10[jkey] = v; }), { rows: 3 })}
                </div>
              ))}
            </>
          ), "درجة «القيمة للقائد المشغول» هي التقييم الظاهر على بطاقة الملخص.")}

          <p className="adm-group">الحفظ والمعاينة</p>
          <section className="adm-card" id="sec-save">
            {allErrors.length > 0 ? (
              <div className="adm-notice" role="alert">
                <p>أخطاء تمنع الحفظ والنشر ({toArabicNumerals(allErrors.length)}):</p>
                <ul>
                  {allErrors.map((i) => (
                    <li key={i.field + i.message}>
                      <button type="button" className="adm-link" onClick={() => focusField(i.field)}>{i.message}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {required.length > 0 ? (
              <div className="adm-required">
                <p>مطلوب قبل النشر ({toArabicNumerals(required.length)}) — لا يمنع الحفظ:</p>
                <ul>
                  {required.map((i) => (
                    <li key={i.field + i.message}>
                      <button type="button" className="adm-link" onClick={() => focusField(i.field)}>
                        {SECTIONS.find((s) => s.id === i.section)?.title}: {i.message}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="adm-hint">المحتوى مكتمل للنشر.</p>
            )}
            {recommendations.length > 0 ? (
              <details className="adm-checklist">
                <summary>توصيات لا تمنع الحفظ ولا النشر ({toArabicNumerals(recommendations.length)})</summary>
                <ul>
                  {recommendations.map((i) => (
                    <li key={i.field + i.message}>
                      <button type="button" className="adm-link" onClick={() => focusField(i.field)}>
                        {SECTIONS.find((s) => s.id === i.section)?.title}: {i.message}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
            <div className="adm-save-row">
              <span className="adm-state" data-state={state} role="status">{stateText}</span>
              {actions}
            </div>
            <p className="adm-hint">
              {published
                ? "المعاينة والنشر يعملان على المسودة المحفوظة. النسخة الحية لا تتغيّر قبل «نشر التعديلات»."
                : "المعاينة والنشر يعملان على النسخة المحفوظة، فاحفظ أولاً."}
            </p>
            {discardControl ? <div className="adm-discard">{discardControl}</div> : null}
          </section>
        </div>
      </div>

      {/* الجوال: شريط حفظ ثابت في الأسفل */}
      <div className="adm-foot">
        <span className="adm-state" data-state={state}>{stateText}</span>
        <button type="button" className="adm-btn adm-btn-primary" onClick={onSave} disabled={busy || !dirty}>{labels.save}</button>
      </div>
    </div>
  );
}
