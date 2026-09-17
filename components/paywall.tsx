import Link from "next/link";
import { LockIcon } from "@/components/bahjaa/icons";

/**
 * الجدار — يظهر بعد القسم الرابع لغير المسجّل.
 *
 * اللمحة أشكال لا نصّ: الزائر لا يملك صلاحية قراءة content_full،
 * وأي نصّ نكتبه هنا سيكون مختلَقاً ويظهر على كل كتاب بلا تمييز.
 * الأشكال تنقل «هناك المزيد» بصدق، بلا ادّعاء محتوى.
 *
 * لا يحمل نموذجاً خاصاً به: يوجّه إلى /login حيث يعيش منطق OTP كاملاً.
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
        <p className="lock-line">
          <LockIcon />
          <span className="eyebrow">بقية الملخص — ستة أقسام</span>
        </p>

        <h2 id="gate-title" className="gate-title">أكمل من حيث بدأت</h2>
        <p className="explain incard">
          قرأتَ الأقسام الأربعة الأولى. الستة الباقية تحمل الكتاب كاملاً، وخطوة تطبّقها الليلة. تُفتح لك في كل ملخصات بهجة ببريدك وحده.
        </p>

        {/* الأقسام الستة المقفولة بأسمائها الحقيقية.
            لا نذكر عدد المحاور ولا عدد الاقتباسات: يتغيّران من كتاب لآخر،
            وأي رقم ثابت هنا وعدٌ كاذب على بعض الكتب. */}
        <ul className="unlocks">
          {[
            ['٥', 'المحاور الكاملة للكتاب — لكل محور جوهره وفخّه الشائع'],
            ['٦', 'الاقتباسات الذهبية بتفسير فريق بهجة'],
            ['٧', 'مثال واقعي من بيئة الأعمال'],
            ['٨', 'مسار التحويل — من المعرفة إلى التطبيق'],
            ['٩', 'رؤية فريق بهجة النقدية'],
            ['١٠', 'تقييم فريق بهجة'],
          ].map(([n, t]) => (
            <li key={n}>
              <span className="u-num">{n}</span>
              <span className="u-txt">{t}</span>
            </li>
          ))}
        </ul>

        <p style={{ marginTop: 30 }}>
          <Link href={`/login?next=/s/${slug}`} className="btn btn-primary">
            افتح الملخص كاملاً — بإيميلك فقط
          </Link>
        </p>

        <p className="meta helper">
          أدخل بريدك، وسنرسل لك رمز دخول من ٨ أرقام. لا بطاقة ولا كلمة مرور.
        </p>
      </section>
    </div>
  );
}
