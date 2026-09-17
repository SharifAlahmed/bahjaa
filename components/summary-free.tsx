import { Section, LabelCard } from "./section";
import type { ContentFree } from "@/lib/types";

/** الأقسام 1-4 — تُعرض للجميع وتُفهرس في جوجل */
export default function SummaryFree({ c }: { c: ContentFree }) {
  const s1 = c.s1 || {};
  const s3 = c.s3 || {};

  return (
    <>
      {/* 1 — ملخص الـ 30 ثانية */}
      {(s1.problem || s1.core_idea || s1.verdict) && (
        <Section num={1} title="ملخص الـ 30 ثانية">
          <p className="bh-body mb-4 text-bh-muted">
            قبل أن تقرأ السطر الأول — إليك كل ما تحتاج معرفته عن هذا الكتاب في ٣٠ ثانية
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {s1.problem && (
              <LabelCard label="المشكلة التي يحلها هذا الكتاب">{s1.problem}</LabelCard>
            )}
            {s1.core_idea && (
              <LabelCard label="الفكرة الجوهرية للكتاب">{s1.core_idea}</LabelCard>
            )}
            {s1.best_for && (
              <LabelCard label="من سيستفيد أكثر من هذا الكتاب">{s1.best_for}</LabelCard>
            )}
            {s1.not_for && (
              <LabelCard label="من قد لا يجد فيه ما يبحث عنه">{s1.not_for}</LabelCard>
            )}
            {s1.verdict && (
              <div className="sm:col-span-2">
                <LabelCard label="حكم فريق بهجة">{s1.verdict}</LabelCard>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* 2 — لحظة التعرّف */}
      {c.s2?.text && (
        <Section num={2} title="لحظة التعرّف">
          <div className="bh-card p-6 border-s-[3px] border-s-[var(--color-brand-primary)]">
            <p className="bh-body whitespace-pre-line">{c.s2.text}</p>
          </div>
        </Section>
      )}

      {/* 3 — لماذا هذا الكتاب الآن؟ */}
      {(s3.questions?.length || s3.gains) && (
        <Section num={3} title="لماذا هذا الكتاب الآن؟">
          <div className="bh-card p-6">
            {s3.questions && s3.questions.length > 0 && (
              <ul className="space-y-2.5 mb-4">
                {s3.questions.map((q, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="text-bh-primary font-bold shrink-0">؟</span>
                    <span className="bh-body">{q}</span>
                  </li>
                ))}
              </ul>
            )}
            {s3.bridge && (
              <p className="bh-card-label mb-3">{s3.bridge}</p>
            )}
            {s3.gains && <p className="bh-body">{s3.gains}</p>}
            {s3.author_note && (
              <p className="bh-sub mt-4 pt-4 border-t border-bh-border">
                {s3.author_note}
              </p>
            )}
          </div>
        </Section>
      )}

      {/* 4 — الفكرة المحورية */}
      {c.s4?.text && (
        <Section num={4} title="الفكرة المحورية">
          <p className="bh-sub mb-3">
            إذا نسيت كل شيء وتذكّرت جملة واحدة فقط
          </p>
          <div className="rounded-xl bg-bh-primary text-white text-center px-6 py-8">
            <p className="text-[22px] font-black leading-[1.7]">{c.s4.text}</p>
          </div>
        </Section>
      )}
    </>
  );
}
