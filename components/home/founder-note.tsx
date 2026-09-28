import Image from "next/image";
import Link from "next/link";

/* رسالة من المؤسس — نسخة الرئيسية المختصرة. بهجة علامة يقودها مؤسسها،
   فيبقى هذا القسم بعد الهيرو مباشرة. النص يميناً والصورة يساراً. */
export function FounderMessage() {
  return (
    <section className="hm-founder" aria-labelledby="founder-title">
      <div className="wrap hm-founder-grid">
        <div className="hm-founder-text">
          <p className="hm-eyebrow">رسالة من المؤسس</p>
          <h2 className="hm-founder-statement" id="founder-title">
            لسنا بحاجة إلى أن نعرف أكثر فقط، بل إلى أن نستفيد أكثر مما نعرف.
          </h2>

          <div className="hm-prose">
            <p>أؤمن أن مشكلتنا اليوم ليست في نقص المعرفة، بل في وفرتها.</p>
            <p>
              وأعرف شعور أن تقرأ كتابًا مهمًا، أو تحفظ مقالًا تنوي العودة إليه، ثم
              تمضي الأيام وتتراكم المصادر ويبقى السؤال: ماذا استفدت فعلًا؟
            </p>
            <p>من هنا وُلدت بهجة.</p>
            <p>
              لأنني، مثلك، لا أبحث عن المزيد من المعلومات لمجرد المعرفة. أبحث عن
              الأفكار التي تستحق وقتي، وعن الفهم الذي يساعدني على رؤية الأمور
              بوضوح، وعن معرفة يمكن أن تتحول إلى قرار أفضل أو خطوة عملية.
            </p>
            <p>
              لهذا أردت أن نبني مكانًا لا يضيف إلى ضجيج المحتوى، بل يساعدك على
              الوصول إلى جوهره.
            </p>
          </div>

          <div className="hm-founder-sign">
            <Image
              className="hm-founder-signature"
              src="/signature.png"
              alt=""
              width={509}
              height={124}
              sizes="180px"
            />
            <p className="hm-founder-name">شريف الأحمد</p>
            <p className="hm-founder-role">مؤسس بهجة</p>
          </div>

          <Link href="/about" className="hm-link">
            اقرأ قصة بهجة
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 6 8 12l6 6" /></svg>
          </Link>
        </div>

        <div className="hm-founder-photo">
          <Image
            src="/founder.jpg"
            alt="شريف الأحمد، مؤسس بهجة"
            width={1350}
            height={1318}
            sizes="(max-width: 860px) 220px, 430px"
          />
        </div>
      </div>
    </section>
  );
}
