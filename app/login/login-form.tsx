"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const RESEND_SECONDS = 60;

/** يحوّل أخطاء Supabase الإنجليزية إلى عربية مفهومة */
function arabicError(raw: string): string {
  const m = raw.toLowerCase();

  const wait = raw.match(/after (\d+) seconds?/i);
  if (wait) return `انتظر ${wait[1]} ثانية قبل طلب رمز جديد.`;

  if (m.includes("rate limit"))
    return "وصلنا حدّ الإرسال مؤقتاً. حاول بعد دقائق قليلة.";
  if (m.includes("expired") || m.includes("invalid"))
    return "الرمز غير صحيح أو انتهت صلاحيته. اطلب رمزاً جديداً.";
  if (m.includes("email") && m.includes("valid"))
    return "تأكد من كتابة بريدك بشكل صحيح.";
  if (m.includes("network") || m.includes("fetch"))
    return "تعذّر الاتصال. تحقّق من شبكتك وحاول مجدداً.";

  return "حدث خطأ غير متوقع. حاول مرة أخرى.";
}

/**
 * نموذج الدخول — منطق OTP الوحيد في المشروع.
 * يُستخدم في /login وداخل الجدار في صفحة الملخص. لا نسخة ثانية منه.
 * nextOverride: وجهة العودة حين لا يكون في العنوان ?next (كالجدار داخل الصفحة).
 */
export default function LoginForm({
  nextOverride,
  submitLabel = "أرسل رمز الدخول",
}: { nextOverride?: string; submitLabel?: string } = {}) {
  const params = useSearchParams();
  const rawNext = nextOverride || params.get("next") || "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [done, setDone] = useState(false);

  const codeRef = useRef<HTMLInputElement>(null);

  // عدّاد إعادة الإرسال
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // تركيز حقل الرمز فور ظهوره
  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy || cooldown > 0) return;

    setBusy(true);
    setError("");

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });

    setBusy(false);

    if (err) {
      setError(arabicError(err.message));
      return;
    }

    setStep("code");
    setCode("");
    setCooldown(RESEND_SECONDS);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    const token = code.replace(/\D/g, "");
    if (token.length < 6) {
      setError("الرمز غير مكتمل.");
      return;
    }

    setBusy(true);
    setError("");

    const supabase = createClient();
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: "email",
    });

    if (err) {
      setBusy(false);
      setError(arabicError(err.message));
      setCode("");
      codeRef.current?.focus();
      return;
    }

    setDone(true);

    // الجلسة صارت في الكوكيز.
    // تحميل كامل للصفحة — لا تنقّل داخلي — حتى يعيد الخادم بناء الترويسة
    // بالجلسة الجديدة، ولا تبقى أي نسخة قديمة في ذاكرة المتصفح.
    window.location.assign(next);
  }

  // ============================ الخطوة 2: الرمز ============================
  if (step === "code") {
    return (
      <form onSubmit={verify} className="mt-8">
        <div className="bh-card p-4 bg-bh-primary-light border-bh-primary text-center mb-6">
          <p className="bh-body">
            أرسلنا رمز الدخول إلى
            <br />
            <strong className="font-bold" dir="ltr">
              {email}
            </strong>
          </p>
        </div>

        <label htmlFor="code" className="bh-card-label block mb-2 text-center">
          اكتب الرمز كما وصلك
        </label>

        <input
          id="code"
          ref={codeRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={10}
          value={code}
          onChange={(e) => {
            // يقبل أي طول يرسله Supabase (6 أو 8 أرقام حسب الإعداد)
            const v = e.target.value.replace(/\D/g, "").slice(0, 10);
            setCode(v);
            setError("");
          }}
          placeholder="••••••••"
          dir="ltr"
          className="w-full rounded-xl border border-bh-border bg-bh-bg px-4 py-4 text-center text-[26px] font-black tracking-[0.35em] outline-none focus:border-bh-primary focus:ring-2 focus:ring-bh-primary/20 transition"
        />

        <button
          type="submit"
          disabled={busy || done || code.length < 6}
          className="w-full mt-4 rounded-xl bg-bh-primary text-white font-bold py-3.5 hover:bg-bh-primary-dark transition disabled:opacity-50"
        >
          {done ? "تم — جارٍ فتح الملخصات…" : busy ? "جارٍ التحقق…" : "ادخل"}
        </button>

        {error && (
          <p className="bh-sub text-center mt-3" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        )}

        <div className="flex items-center justify-center gap-4 mt-6 text-[13px]">
          <button
            type="button"
            onClick={() => sendCode()}
            disabled={cooldown > 0 || busy}
            className="font-bold text-bh-primary hover:text-bh-primary-dark transition disabled:text-bh-muted disabled:cursor-default"
          >
            {cooldown > 0 ? `إعادة الإرسال بعد ${cooldown} ثانية` : "أرسل رمزاً جديداً"}
          </button>

          <span className="text-bh-border">·</span>

          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError("");
              setCode("");
            }}
            className="font-bold text-bh-muted hover:text-bh-primary-dark transition"
          >
            تغيير البريد
          </button>
        </div>

        <p className="bh-sub text-center mt-5 text-xs">
          لم تجد الرسالة؟ تحقّق من مجلد الرسائل غير المرغوبة (Spam).
        </p>
      </form>
    );
  }

  // ============================ الخطوة 1: البريد ============================
  return (
    <form onSubmit={sendCode} className="mt-8 space-y-3">
      <label htmlFor="email" className="bh-card-label block">
        بريدك الإلكتروني
      </label>

      <input
        id="email"
        type="email"
        required
        dir="ltr"
        autoComplete="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError("");
        }}
        placeholder="you@example.com"
        className="w-full rounded-xl border border-bh-border bg-bh-bg px-4 py-3 text-[15px] outline-none focus:border-bh-primary focus:ring-2 focus:ring-bh-primary/20 transition"
      />

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-bh-primary text-white font-bold py-3.5 hover:bg-bh-primary-dark transition disabled:opacity-60"
      >
        {busy ? "جارٍ الإرسال…" : submitLabel}
      </button>

      {error && (
        <p className="bh-sub text-center" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}

      <p className="bh-sub text-center text-xs pt-2">
        بدخولك توافق على استقبال رسائل بهجة. يمكنك إلغاء الاشتراك في أي وقت.
      </p>
    </form>
  );
}
