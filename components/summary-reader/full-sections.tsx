import type { ContentFull } from "@/lib/types";
import { toArabicDigits } from "@/components/bahjaa/format";
import { SectionShell } from "./section-shell";
import {
  IconLayers, IconQuote, IconBriefcase, IconRoute, IconScale, IconTarget, IconAlert,
  IconSearch, IconZap, IconCalendar, IconUsers, IconGauge, IconHeart, IconMessageQuestion, IconGlobe,
} from "./icons";

/** أيّ من الأقسام ٥–١٠ فيه بيانات تُعرض — نفس شروط العرض أدناه */
export function fullPresence(c: ContentFull): boolean[] {
  const s7 = c.s7, s8 = c.s8, s9 = c.s9;
  return [
    !!c.s5?.length,
    !!c.s6?.length,
    !!(s7 && (s7.context || s7.situation || s7.decision || s7.result || s7.lesson)),
    !!(s8 && (s8.diagnosis || s8.zero_step || s8.week_plan?.length || s8.team_question || s8.success_marker)),
    !!(s9 && (s9.liked || s9.wished || s9.arab_context)),
    !!c.s10,
  ];
}

/* ٥ — المحاور: كل محور فصل تحريري (رقم كبير، عنوان، نثر، «لماذا يهمك»، ثم الفخ بمعالجة تحذير دافئة) */
function Pillars({ items }: { items: NonNullable<ContentFull["s5"]> }) {
  return (
    <SectionShell num={5} title="المحاور الكاملة للكتاب" icon={<IconLayers />} variant="pillars">
      <ol className="sr-pillars">
        {items.map((p, i) => (
          <li key={i} className="sr-pillar">
            <span className="sr-pillar-n" aria-hidden="true">{toArabicDigits(i + 1)}</span>
            <div className="sr-pillar-body">
              {p.title ? <h3 className="sr-pillar-title">{p.title}</h3> : null}
              {p.essence ? <p className="sr-pillar-essence">{p.essence}</p> : null}
              {p.why_you ? (
                <div className="sr-why-you">
                  <p className="sr-mini-label"><IconTarget size={16} />لماذا يهمك مباشرةً</p>
                  <p>{p.why_you}</p>
                </div>
              ) : null}
              {p.common_trap ? (
                <div className="sr-trap">
                  <p className="sr-trap-label"><IconAlert size={16} />الفخ الشائع</p>
                  <p>{p.common_trap}</p>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

/* ٦ — الاقتباسات: صوت الكتاب (blockquote) مقابل تفسير فريق بهجة، جنباً إلى جنب حين يتسع */
function Quotes({ items }: { items: NonNullable<ContentFull["s6"]> }) {
  return (
    <SectionShell num={6} title="الاقتباسات الذهبية" icon={<IconQuote />} variant="quotes">
      <div className="sr-quotes">
        {items.map((q, i) => (
          <figure key={i} className="sr-quote">
            {q.quote ? (
              <blockquote className="sr-quote-text">
                <p>«{q.quote}»</p>
              </blockquote>
            ) : null}
            {q.interpretation ? (
              <div className="sr-quote-note">
                <p className="sr-mini-label">تفسير فريق بهجة</p>
                <p>{q.interpretation}</p>
              </div>
            ) : null}
          </figure>
        ))}
      </div>
    </SectionShell>
  );
}

/* ٧ — مثال واقعي: دراسة حالة صغيرة على خط زمني رأسي، والدرس أبرز */
function Case({ s7 }: { s7: NonNullable<ContentFull["s7"]> }) {
  const steps = (
    [
      ["السياق", s7.context],
      ["الموقف", s7.situation],
      ["القرار", s7.decision],
      ["النتيجة", s7.result],
    ] as const
  ).filter(([, v]) => v);
  return (
    <SectionShell num={7} title="مثال واقعي من بيئة الأعمال" icon={<IconBriefcase />} variant="case">
      <ol className="sr-case">
        {steps.map(([label, v]) => (
          <li key={label} className="sr-case-step">
            <p className="sr-case-label">{label}</p>
            <p>{v}</p>
          </li>
        ))}
        {s7.lesson ? (
          <li className="sr-case-step sr-case-lesson">
            <p className="sr-case-label">الدرس</p>
            <p>{s7.lesson}</p>
          </li>
        ) : null}
      </ol>
    </SectionShell>
  );
}

/* ٨ — مسار التحويل: الذروة البصرية الثانية — مراحل بزمن وفعل، وخاتمة بمؤشر النجاح */
function Path({ s8 }: { s8: NonNullable<ContentFull["s8"]> }) {
  const stages = [
    { when: "الآن", label: "التشخيص", icon: <IconSearch />, body: s8.diagnosis ? <p>{s8.diagnosis}</p> : null },
    { when: "خلال ٥ دقائق", label: "الخطوة الصفرية", icon: <IconZap />, body: s8.zero_step ? <p>{s8.zero_step}</p> : null },
    {
      when: "هذا الأسبوع",
      label: "خطة الأسبوع الأول",
      icon: <IconCalendar />,
      body: s8.week_plan?.length ? (
        <ol className="sr-week">
          {s8.week_plan.map((d, i) => (
            <li key={i}>
              <span className="sr-week-n" aria-hidden="true">{toArabicDigits(i + 1)}</span>
              <span>{d}</span>
            </li>
          ))}
        </ol>
      ) : null,
    },
    { when: "مع فريقك", label: "السؤال المحوري", icon: <IconUsers />, body: s8.team_question ? <p className="sr-team-q">{s8.team_question}</p> : null },
  ].filter((s) => s.body);

  return (
    <SectionShell num={8} title="مسار التحويل" icon={<IconRoute />} variant="path">
      <div className="sr-path">
        <p className="sr-path-lead">من المعرفة إلى التطبيق: هنا يتحوّل ما قرأته إلى أثر قابل للقياس</p>
        <ol className="sr-path-stages">
          {stages.map((s) => (
            <li key={s.label} className="sr-stage">
              <div className="sr-stage-when">
                <span className="sr-stage-icon">{s.icon}</span>
                <span>{s.when}</span>
              </div>
              <div className="sr-stage-body">
                <h3 className="sr-stage-label">{s.label}</h3>
                {s.body}
              </div>
            </li>
          ))}
        </ol>
        {s8.success_marker ? (
          <div className="sr-success">
            <p className="sr-success-label"><IconGauge size={18} />بعد ٣٠ يومًا · مؤشر النجاح</p>
            <p className="sr-success-text">{s8.success_marker}</p>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

/* ٩ — رؤية فريق بهجة النقدية: صوت المحرّر صريحاً — ثلاث مناطق بعلامة وخط، بلا بطاقة جامعة */
function Critical({ s9 }: { s9: NonNullable<ContentFull["s9"]> }) {
  const zones = [
    { icon: <IconHeart />, label: "ما أعجبنا فعلاً", v: s9.liked },
    { icon: <IconMessageQuestion />, label: "ما كنا نتمنى أن يقوله المؤلف", v: s9.wished },
    { icon: <IconGlobe />, label: "الربط بالسياق العربي والخليجي", v: s9.arab_context },
  ].filter((z) => z.v);
  return (
    <SectionShell num={9} title="رؤية فريق بهجة النقدية" icon={<IconScale />} variant="critical">
      <p className="sr-critical-over">رأي محلل — لا نقل محايد</p>
      <div className="sr-critical">
        {zones.map((z) => (
          <div key={z.label} className="sr-zone">
            <h3 className="sr-zone-label">
              <span className="sr-zone-icon">{z.icon}</span>
              {z.label}
            </h3>
            <p>{z.v}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ١٠ — التقييم: مقياس مقسّم هادئ من ١٠، والمبرّر بنفس أهمية الرقم */
function Rating({ s10 }: { s10: NonNullable<ContentFull["s10"]> }) {
  const rows = [
    ["القيمة للقائد المشغول", s10.value, s10.justifications?.value],
    ["قابلية التطبيق الفوري", s10.applicability, s10.justifications?.applicability],
    ["عمق الأفكار", s10.depth, s10.justifications?.depth],
  ] as const;
  return (
    <SectionShell num={10} title="تقييم فريق بهجة" variant="rating">
      <dl className="sr-rating">
        {rows.map(([label, score, why]) => {
          const n = typeof score === "number" ? Math.max(0, Math.min(10, Math.round(score))) : null;
          return (
            <div key={label} className="sr-rate">
              <dt className="sr-rate-label">{label}</dt>
              <dd className="sr-rate-score">
                {n === null ? "—" : <>{toArabicDigits(n)} <span>/ ١٠</span></>}
              </dd>
              {n !== null ? (
                <dd className="sr-rate-bar" aria-hidden="true">
                  {Array.from({ length: 10 }, (_, i) => (
                    <span key={i} className={i < n ? "on" : undefined} />
                  ))}
                </dd>
              ) : null}
              {why ? <dd className="sr-rate-why">{why}</dd> : null}
            </div>
          );
        })}
      </dl>
    </SectionShell>
  );
}

/** الأقسام ٥–١٠ — تُعرض فقط حين يمرّر الخادم content_full (جلسة مسجّلة أو معاينة الأدمن) */
export function FullSections({ c }: { c: ContentFull }) {
  const [p5, p6, p7, p8, p9, p10] = fullPresence(c);
  return (
    <>
      {p5 ? <Pillars items={c.s5!} /> : null}
      {p6 ? <Quotes items={c.s6!} /> : null}
      {p7 ? <Case s7={c.s7!} /> : null}
      {p8 ? <Path s8={c.s8!} /> : null}
      {p9 ? <Critical s9={c.s9!} /> : null}
      {p10 ? <Rating s10={c.s10!} /> : null}
    </>
  );
}
