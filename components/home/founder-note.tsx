import Image from "next/image";
import Link from "next/link";

export function FounderMessage() {
  return (
    <section className="hm-founder hm-founder-v3" aria-labelledby="founder-title">
      <div className="wrap hm-founder-grid">
        <div className="hm-founder-intro">
          <p className="hm-eyebrow">رسالة من المؤسس</p>
          <h2 className="hm-founder-statement" id="founder-title">
            لم تعد المعرفة نادرة. التحدي الحقيقي هو: كيف نعرف ما يستحق انتباهنا،
            ثم نحوله إلى فهم وقرار وفعل؟
          </h2>
        </div>

        <div className="hm-founder-photo">
          <Image
            src="/founder.jpg"
            alt="شريف الأحمد، مؤسس بهجة"
            width={1350}
            height={1318}
            sizes="(max-width: 860px) 240px, 430px"
          />
        </div>

        <div className="hm-founder-body">
          <div className="hm-prose">
            <p>
              خلال سنوات من العمل مع قادة وفرق ومؤسسات محلية ودولية، ومن تجربتي
              في التدريب والكوتشينغ، تعلّمت أن القيمة لا تأتي فقط من امتلاك
              الإجابات، بل من <strong>طرح السؤال الصحيح، وفهم السياق، والوصول إلى جوهر الفكرة</strong>.
            </p>

            <p className="hm-founder-question">
              <strong>
                ما الفكرة الأهم؟ لماذا تهمنا؟ كيف يمكن أن تغيّر فهمنا أو قرارنا؟
                وماذا يمكن أن نفعل بها؟
              </strong>
            </p>

            <p>
              من هنا بدأت <strong>بهجة</strong>، وتشكّلت منهجيتها: لا نكتفي بتلخيص
              كتاب أو مقال أو دراسة حالة، بل نحوّل المعرفة إلى
              <strong> فهم أوضح، وقرار أفضل، وخطوات قابلة للتطبيق</strong>.
            </p>

            <p className="hm-founder-coda">
              معرفة تستحق وقتك. أسئلة تكشف الجوهر. فهم يحسّن قراراتك. وتطبيق يصنع أثرًا.
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
            اقرأ قصة بهجة ومنهجيتها
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 6 8 12l6 6" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
