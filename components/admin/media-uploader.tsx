"use client";

// رافع صور عام للأدمن: اختيار ← تحقق ← معاينة محلية ← تأكيد صريح.
// لا يرفع شيئاً بنفسه: onConfirm يستلم الملف بعد تأكيد الأدمن (الأغلفة الآن؛ Hero/Banner لاحقاً).
import { useEffect, useRef, useState } from "react";
import { validateImageDimensions, validateImageFile, type ImageRules } from "@/lib/admin/media";

type Picked = { file: File; previewUrl: string; warning: string | null };

export function MediaUploader({
  inputId, label, hint, rules, confirmLabel, confirmNote, busy, previewClassName, onConfirm,
}: {
  inputId: string;
  label: string;
  hint: string;
  rules: ImageRules;
  confirmLabel: string;
  /** ما سيحدث عند التأكيد — يظهر فوق زر التأكيد */
  confirmNote: string;
  busy: boolean;
  previewClassName?: string;
  /** يعيد رسالة الخطأ، أو null عند النجاح */
  onConfirm: (file: File) => Promise<string | null>;
}) {
  const [picked, setPicked] = useState<Picked | null>(null);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // تحرير رابط المعاينة المحلية عند تبديله أو إزالة المكوّن
  useEffect(() => () => { if (picked) URL.revokeObjectURL(picked.previewUrl); }, [picked]);

  function reset() {
    setPicked(null);
    if (input.current) input.current.value = "";
  }

  function onPick(file: File | undefined) {
    setError("");
    setPicked(null);
    if (!file) return;
    const fileError = validateImageFile(file, rules);
    if (fileError) { setError(fileError); if (input.current) input.current.value = ""; return; }

    const previewUrl = URL.createObjectURL(file);
    const probe = new window.Image();
    probe.onload = () => {
      const { error: sizeError, warning } = validateImageDimensions(probe.naturalWidth, probe.naturalHeight, rules);
      if (sizeError) { URL.revokeObjectURL(previewUrl); setError(sizeError); if (input.current) input.current.value = ""; return; }
      setPicked({ file, previewUrl, warning });
    };
    probe.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      setError("تعذّرت قراءة الصورة. تأكد أن الملف صورة سليمة.");
      if (input.current) input.current.value = "";
    };
    probe.src = previewUrl;
  }

  async function confirm() {
    if (!picked) return;
    setError("");
    setWorking(true);
    const failure = await onConfirm(picked.file);
    setWorking(false);
    if (failure) setError(failure);
    else reset();
  }

  const disabled = busy || working;
  return (
    <div className="adm-media">
      <label className="adm-label" htmlFor={inputId}>{label}</label>
      <input
        ref={input} id={inputId} type="file" className="adm-media-input"
        accept={rules.mimeTypes.join(",")} disabled={disabled}
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      <p className="adm-hint">{hint}</p>
      {error ? <p className="adm-notice" role="alert">{error}</p> : null}

      {picked ? (
        <div className="adm-confirm adm-media-confirm" role="group" aria-label="معاينة الصورة قبل اعتمادها">
          {/* معاينة محلية من ملف المستخدم (blob) — لا تمرّ بمحسّن الصور */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={previewClassName ?? "adm-media-preview"} src={picked.previewUrl} alt="معاينة الصورة المختارة" />
          <div className="adm-media-confirm-body">
            {picked.warning ? <p className="adm-media-warning">{picked.warning}</p> : null}
            <p>{confirmNote}</p>
            <div className="adm-actions">
              <button type="button" className="adm-btn adm-btn-primary" onClick={confirm} disabled={disabled}>
                {working ? "جارٍ الرفع…" : confirmLabel}
              </button>
              <button type="button" className="adm-btn" onClick={reset} disabled={disabled}>إلغاء</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
