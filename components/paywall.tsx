import { Suspense } from "react";
import LoginForm from "@/app/login/login-form";

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
        <h2 id="gate-title" className="gate-title">
          لمواصلة قراءة الملخص مجاناً، أدخل بريدك الإلكتروني
        </h2>

        <p className="gate-sub">
          بلا اشتراك ولا بطاقة — يصلك رمز من ٨ أرقام، وتُكمل من هنا.
        </p>

        <div className="gate-form">
          <Suspense fallback={<div style={{ minHeight: 188 }} />}>
            <LoginForm nextOverride={`/s/${slug}`} />
          </Suspense>
        </div>

        {/* ما يبقى: أسماء الأقسام الستة وحدها — أعدادها الداخلية تتغيّر من كتاب لآخر */}
        <p className="gate-rest">
          يبقى ستة أقسام: المحاور الكاملة للكتاب · الاقتباسات الذهبية بتفسير فريق بهجة ·
          مثال واقعي من بيئة الأعمال · مسار التحويل · رؤية فريق بهجة النقدية · التقييم.
        </p>
      </section>
    </div>
  );
}
