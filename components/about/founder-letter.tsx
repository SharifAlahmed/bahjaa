import Image from "next/image";

/* رسالة المؤسس: تضيف الخبرة والمنظور الشخصي، ولا تعيد قصة المنصة كاملة. */
export function FounderLetter() {
  return (
    <section className="ab-founder ab-founder-v2" aria-labelledby="letter-title">
      <div className="wrap ab-founder-grid">
        <div className="ab-founder-photo">
          <Image
            src="/founder.jpg"
            alt="شريف الأحمد، مؤسس بهجة"
            width={1350}
            height={1318}
            sizes="(max-width: 860px) 220px, 380px"
          />
        </div>

        <article className="ab-letter">
          <h2 className="ab-eyebrow" id="letter-title">رسالة من المؤسس</h2>

          <div className="ab-prose ab-letter-body">
            <p>
              خلال سنوات من العمل مع قادة وفرق ومؤسسات، ومن تجربتي في التدريب
              والكوتشينغ، رأيت أن المشكلة نادرًا ما تكون في نقص المعلومات. غالبًا
              نعرف الكثير، لكننا نحتاج إلى سؤال أفضل، وفهم أوضح، وخطوة نلتزم بها.
            </p>

            <p>
              لهذا أردت أن تكون بهجة أكثر من مكان لقراءة الملخصات؛ مكانًا يساعدك
              على الوصول إلى جوهر الفكرة، وربطها بسياقك، ثم استخدامها في قرار أو عمل.
            </p>

            <p className="ab-key">
              لأن القيمة الحقيقية للمعرفة لا تظهر فيما قرأناه، بل فيما تغيّر بسبب ما عرفناه.
            </p>
          </div>

          <div className="ab-sign">
            <Image
              className="ab-signature"
              src="/signature.png"
              alt=""
              width={509}
              height={124}
              sizes="180px"
            />
            <p className="ab-sign-name">شريف الأحمد</p>
            <p className="ab-sign-role">مؤسس بهجة</p>
          </div>
        </article>
      </div>
    </section>
  );
}
