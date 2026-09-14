import Link from "next/link";
import { LockIcon } from "@/components/bahjaa/icons";

/**
 * الجدار — يظهر بعد القسم الرابع لغير المسجّل.
 * لا يحمل نموذجاً خاصاً به: يوجّه إلى /login حيث يعيش منطق OTP كاملاً،
 * فلا يُكرَّر ولا يُخاطَر به.
 */
export default function Paywall({ slug }: { slug: string }) {
  return (
    <div style={{ marginTop: 40 }}>
      <div className="locked">
        {/* لمحة مموّهة عمّا خلف الجدار */}
        <div className="teaser" aria-hidden="true">
        <h3 className="h-sub" style={{ marginBottom: 14 }}>
          المحور الأول — إعادة تعريف التقدّم
        </h3>
        <p className="read">
          يبدأ الكتاب من سؤال مزعج عن معنى أن تتقدّم فعلاً، لا أن تنشغل فحسب. والفرق بين
          الاثنين هو ما يفصل فريقاً منتجاً عن فريق يدور في مكانه.
        </p>
        <p className="read">
          ثم يقترح بديلاً عملياً: التقدّم هو أن تعرف اليوم عن عميلك شيئاً لم تكن تعرفه أمس،
          وأن يكون مدعوماً بسلوك حقيقي لا برأي مُجامِل.
        </p>
      </div>
        <div className="fade" />
      </div>

      <section className="gate" id="email-gate" aria-labelledby="gate-title">
        <p className="lock-line">
          <LockIcon />
          <span className="eyebrow">أكمل بقية تجربة الملخص</span>
        </p>

        <h2 id="gate-title" className="gate-title">أكمل من حيث بدأت</h2>
        <p className="explain incard">
          افتح بقية المحاور، الاقتباسات المفسّرة، وخطوة التطبيق لهذا الكتاب — مع كل ملخصات بهجة.
        </p>

        <div className="unlocks">
          <div>
            <div className="u-num">٧</div>
            <div className="u-txt">محاور تغطي الكتاب كاملاً، لكل محور جوهره وفخّه الشائع</div>
          </div>
          <div>
            <div className="u-num">٥</div>
            <div className="u-txt">اقتباسات من النص الأصلي بتفسير فريق بهجة</div>
          </div>
          <div>
            <div className="u-num">٤</div>
            <div className="u-txt">خطوات في مسار التطبيق، تبدأ بخمس دقائق الليلة</div>
          </div>
        </div>

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
