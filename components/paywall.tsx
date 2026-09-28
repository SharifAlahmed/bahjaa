import { Suspense } from "react";
import LoginForm from "@/app/login/login-form";
import { SECTION_NAMES } from "@/components/summary-reader/reading-navigator";
import { toArabicDigits } from "@/components/bahjaa/format";

/**
 * الجدار — يظهر بعد القسم الرابع لغير المسجّل.
 *
 * اللمحة أشكال لا نصّ: الزائر لا يملك صلاحية قراءة content_full،
 * وأي نصّ نكتبه هنا سيكون مختلَقاً ويظهر على كل كتاب بلا تمييز.
 *
 * النموذج نفسه هو LoginForm المستخدم في /login — لا نسخة ثانية من منطق OTP.
 * القارئ يُكمل من مكانه بلا انتقال، ويعود إلى هذا الملخص بعد التحقق.
 */
export default function Paywall({ slug }: { slug: string }) {
  const lines = [96, 88, 93, 74, 90, 62];

  return (
    <div style={{ marginTop: 40 }}>
      <div className="locked">
        <div className="teaser" aria-hidden="true">
          <div className="skeleton-head" />
          <div className="skeleton-lines">
            {lines.map((w, i) => (
              <div key={i} className="skeleton-line" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        <div className="fade" />
      </div>

      <section className="gate" id="email-gate" aria-labelledby="gate-title">
        <h2 id="gate-title" className="gate-title">أكمل من الفهم إلى التطبيق</h2>

        <p className="gate-sub">
          الأقسام التالية تأخذك من فهم أفكار الكتاب إلى استخدامها في حياتك وعملك وقراراتك.
        </p>
        <p className="gate-how">
          مجاني بالكامل: لا بطاقة ولا كلمة مرور. أدخل بريدك، يصلك رمز من ٨ أرقام،
          وتعود إلى هذا الملخص من حيث توقّفت.
        </p>

        <div className="gate-form">
          <Suspense fallback={<div style={{ minHeight: 188 }} />}>
            <LoginForm nextOverride={`/s/${slug}`} submitLabel="أرسل لي رمز الدخول" />
          </Suspense>
        </div>

        {/* ما يبقى: أسماء الأقسام الستة وحدها — لا شيء من محتواها */}
        <p className="gate-rest-title">ما ينتظرك بعد الدخول</p>
        <ol className="gate-rest-list" start={5}>
          {SECTION_NAMES.slice(4).map((name, i) => (
            <li key={name}>
              <span className="gate-rest-n" aria-hidden="true">{toArabicDigits(i + 5)}</span>
              {name}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
