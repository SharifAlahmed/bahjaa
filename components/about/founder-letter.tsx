import Image from "next/image";

/* من يقف وراء بهجة؟ قسم ثقة وسلطة مهنية، لا رسالة مؤسس ثانية. */
export function FounderLetter() {
  return (
    <section className="ab-founder ab-founder-profile" aria-labelledby="founder-profile-title">
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
          <p className="ab-eyebrow">من يقف وراء بهجة؟</p>
          <h2 className="ab-founder-profile-name" id="founder-profile-title">شريف الأحمد</h2>
          <p className="ab-founder-profile-role">
            مؤسس بهجة · مدرب وكوتش مهني معتمد · بخبرة تتجاوز 25 عامًا في تطوير الأعمال
            والعمل مع قادة وفرق ومؤسسات محلية ودولية.
          </p>

          <div className="ab-prose ab-founder-profile-body">
            <p>
              جاءت بهجة من تقاطع هذه الخبرة مع التفكير الاستراتيجي والكوتشينغ المهني:
              كيف ننتقل من كثرة المعلومات إلى السؤال الصحيح، ومن الفهم إلى قرار وفعل
              يمكن تطبيقه وقياس أثره.
            </p>

            <p className="ab-key">
              بهجة هي محاولة لتحويل هذه الخبرة إلى منهج معرفي يمكن للآخرين استخدامه.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
