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
import { publishFromEditor, saveDraftSummary } from "./actions";

type Props = {
  id: string;
  initialValues: EditorValues;
  initialUpdatedAt: string;
  categories: { id: string; name_ar: string }[];
  storedIssues: Issue[];
  publishBlocked: boolean;
};

type TextDef = readonly [string, string, number];
const fid = (field: string) => `f-${field.replaceAll(".", "-")}`;

function focusField(field: string) {
  const el = document.getElementById(fid(field)) ?? document.getElementById(`sec-${field.split(".")[0]}`);
  if (!el) return;
  el.scrollIntoView({ block: "center" });
  if (el instanceof HTMLElement) el.focus({ preventScroll: true });
}

export function EditorForm({
  id, initialValues, initialUpdatedAt, categories, storedIssues, publishBlocked,
}: Props) {
  const [values, setValues] = useState<EditorValues>(initialValues);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initialValues));
  const [savedSlug, setSavedSlug] = useState(initialValues.meta.slug);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [serverIssues, setServerIssues] = useState<Issue[]>(storedIssues);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(
    publishBlocked
      ? { tone: "error", text: "لم يُنشر الملخص: صحّح الحقول المعلَّمة ثم احفظ وأعد المحاولة." }
      : null,
  );
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
    startPublishing(async () => {
      await publishFromEditor(id, savedSlug);
    });
  }

  const busy = saving || publishing;
  const state = saving ? "saving" : dirty ? "dirty" : "saved";
  const stateText = saving
    ? "جارٍ الحفظ…"
    : dirty
      ? "تغييرات غير محفوظة"
      : "كل التغييرات محفوظة";

  const actions = (
    <div className="adm-actions">
      <button type="button" className="adm-btn adm-btn-primary" onClick={onSave} disabled={busy || !dirty}>
        حفظ
      </button>
      <a
        className="adm-btn"
        href={`/admin/preview/${savedSlug}`}
        target="_blank"
        rel="noreferrer"
        aria-disabled={dirty || busy}
        title={dirty ? "احفظ التغييرات أولاً" : undefined}
      >
        معاينة
      </a>
      <button
        type="button"
        className="adm-btn"
        onClick={onPublish}
        disabled={busy || dirty || allErrors.length > 0}
        title={dirty ? "احفظ التغييرات أولاً" : allErrors.length ? "صحّح الأخطاء أولاً" : required.length ? "أكمل الحقول المطلوبة للنشر" : undefined}
      >
        {publishing ? "جارٍ النشر…" : "نشر"}
      </button>
    </div>
  );

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
            <p className="adm-bar-meta">
              <Link href="/admin" className="textlink">اللوحة</Link> · مسودة — لم تُنشر بعد
            </p>
            <h1>{values.meta.book_title_ar || "ملخص بلا عنوان"}</h1>
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
              {text("meta.slug", "المسار (slug)", values.meta.slug,
                (v) => update((d) => { d.meta.slug = v; }),
                { dir: "ltr", hint: "لا يتغيّر تلقائياً عند تعديل العنوان. يُقفل نهائياً بعد أول نشر." })}
              <p className="adm-url" dir="ltr">bahjaa.com/s/{values.meta.slug || "…"}</p>
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
            <p className="adm-hint">المعاينة والنشر يعملان على النسخة المحفوظة، فاحفظ أولاً.</p>
          </section>
        </div>
      </div>

      {/* الجوال: شريط حفظ ثابت في الأسفل */}
      <div className="adm-foot">
        <span className="adm-state" data-state={state}>{stateText}</span>
        <button type="button" className="adm-btn adm-btn-primary" onClick={onSave} disabled={busy || !dirty}>حفظ</button>
      </div>
    </div>
  );
}
