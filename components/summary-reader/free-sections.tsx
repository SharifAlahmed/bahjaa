import type { ContentFree } from "@/lib/types";
import { SectionShell } from "./section-shell";
import { IconProblem, IconIdea, IconUsers, IconUserX, IconVerdict, IconQuestion } from "./icons";

/** أيّ من الأقسام ١–٤ فيه بيانات تُعرض — نفس شروط العرض أدناه (للمستكشف) */
export function freePresence(c: ContentFree): boolean[] {
  const s1 = c.s1 || {};
  const s3 = c.s3 || {};
  return [
    !!(s1.problem || s1.core_idea || s1.best_for || s1.not_for || s1.verdict),
    !!c.s2?.text,
    !!(s3.questions?.length || s3.bridge || s3.gains || s3.author_note),
    !!c.s4?.text,
  ];
}

/* ١ — ملخص الـ٣٠ ثانية: شبكة ٢×٢ خفيفة بأيقونات، ثم حكم فريق بهجة بعرض كامل */
function Thirty({ s1 }: { s1: NonNullable<ContentFree["s1"]> }) {
  const cells = [
    { icon: <IconProblem />, label: "المشكلة التي يحلها هذا الكتاب", v: s1.problem },
    { icon: <IconIdea />, label: "الفكرة الجوهرية للكتاب", v: s1.core_idea },
    { icon: <IconUsers />, label: "من سيستفيد أكثر من هذا الكتاب", v: s1.best_for },
    { icon: <IconUserX />, label: "من قد لا يجد فيه ما يبحث عنه", v: s1.not_for },
  ].filter((c) => c.v);
  return (
    <SectionShell num={1} title="ملخص الـ٣٠ ثانية" variant="thirty">
      {cells.length ? (
        <dl className="sr-insights">
          {cells.map((c) => (
            <div key={c.label} className="sr-insight">
              <dt>
                <span className="sr-insight-icon">{c.icon}</span>
                {c.label}
              </dt>
              <dd>{c.v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {s1.verdict ? (
        <div className="sr-verdict">
          <p className="sr-verdict-label">
            <IconVerdict size={18} />
            حكم فريق بهجة
          </p>
          <p className="sr-verdict-text">{s1.verdict}</p>
        </div>
      ) : null}
    </SectionShell>
  );
}

/* ٢ — لحظة التعرّف: نثر مفتوح ومساحة وعلامة نحاسية واحدة، بلا بطاقة */
function Recognition({ text }: { text: string }) {
  return (
    <SectionShell num={2} title="لحظة التعرّف" variant="recognition">
      <div className="sr-recognition">
        <span className="sr-recognition-mark" aria-hidden="true" />
        <p>{text}</p>
      </div>
    </SectionShell>
  );
}

/* ٣ — لماذا هذا الكتاب الآن؟ الأسئلة بارزة، ثم الجسر، ثم ما ستخرج به، ثم ملاحظة هادئة */
function WhyNow({ s3 }: { s3: NonNullable<ContentFree["s3"]> }) {
  return (
    <SectionShell num={3} title="لماذا هذا الكتاب الآن؟" variant="why">
      {s3.questions?.length ? (
        <ul className="sr-questions">
          {s3.questions.map((q, i) => (
            <li key={i}>
              <span className="sr-q-mark"><IconQuestion size={18} /></span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {s3.bridge ? <p className="sr-bridge">{s3.bridge}</p> : null}
      {s3.gains ? (
        <div className="sr-gains">
          <p className="sr-mini-label">ما الذي ستخرج به؟</p>
          <p>{s3.gains}</p>
        </div>
      ) : null}
      {s3.author_note ? <p className="sr-author-note">{s3.author_note}</p> : null}
    </SectionShell>
  );
}

/* ٤ — الفكرة المحورية: الذروة البصرية الأولى — اللوحة الداكنة الوحيدة في الصفحة، بلا أيقونة */
function CoreIdea({ text }: { text: string }) {
  return (
    <SectionShell num={4} title="الفكرة المحورية" variant="core">
      <div className="sr-core">
        <p className="sr-core-lead">إذا نسيت كل شيء وتذكّرت جملة واحدة فقط</p>
        <p className="sr-core-text">{text}</p>
      </div>
    </SectionShell>
  );
}

/** الأقسام ١–٤ — للجميع ومفهرسة */
export function FreeSections({ c }: { c: ContentFree }) {
  const [p1, p2, p3, p4] = freePresence(c);
  return (
    <>
      {p1 ? <Thirty s1={c.s1!} /> : null}
      {p2 ? <Recognition text={c.s2!.text!} /> : null}
      {p3 ? <WhyNow s3={c.s3!} /> : null}
      {p4 ? <CoreIdea text={c.s4!.text!} /> : null}
    </>
  );
}
