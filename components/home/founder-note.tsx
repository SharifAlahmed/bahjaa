import Image from "next/image";
import Link from "next/link";

/* short: الرئيسية — أول مقطعين ورابط للكلمة كاملة في /about
   full: صفحة «عن بهجة» — الكلمة كاملة */
export function FounderNote({ variant = "full" }: { variant?: "full" | "short" }) {
  const isShort = variant === "short";
  return (
    <section
      className="home-founder home-anchor"
      id={isShort ? undefined : "founder"}
      aria-labelledby="founder-title"
    >
      <div className="wrap home-founder-grid">
        <div className="home-founder-photo">
          <Image
            src="/founder.jpg"
            alt="شريف الأحمد"
            width={1350}
            height={1318}
            sizes="(max-width: 860px) 100vw, 360px"
          />
        </div>

        <div className="home-founder-text">
          <h2 className="h-sec" id="founder-title">كلمة المؤسس</h2>

          <div className="home-prose">
            <p>
              في بهجة، نؤمن بأن المعرفة ليست ما نقرأه،
              <br />
              بل ما نستخدمه لصناعة قرارٍ أفضل ونتيجةٍ أكبر.
            </p>
            <p>
              نبني تجربة معرفية عربية
              <br />
              تحوّل الأفكار العالمية الموثوقة إلى أدوات عملية،
              <br />
              وتمنح القادة وروّاد الأعمال وضوحًا وسط ضجيج المعلومات.
            </p>
            {!isShort && (
              <>
                <p>
                  نختصر المعرفة دون أن نفقد عمقها،
                  <br />
                  ونربط الفكرة بالسياق، والفهم بالفعل،
                  <br />
                  والقرار بخطة قابلة للتنفيذ والقياس.
                </p>
                <p className="home-prose-strong">
                  بهجة: محرّكٌ يحوّل المعرفة إلى خُطّة، والخُطّة إلى أثر.
                </p>
              </>
            )}
          </div>

          {isShort && (
            <p className="home-more">
              <Link href="/about#founder" className="textlink">اقرأ الكلمة كاملة</Link>
            </p>
          )}

          <p className="home-founder-name">شريف الأحمد</p>
          <p className="home-founder-role">مؤسس بهجة</p>
          <Image
            className="home-founder-signature"
            src="/signature.png"
            alt=""
            width={509}
            height={124}
            sizes="200px"
          />
        </div>
      </div>
    </section>
  );
}
