import { Section } from "./section";
import type { ContentFull } from "@/lib/types";

function Stars({ n }: { n: number }) {
  const filled = Math.max(0, Math.min(10, Math.round(n)));
  return (
    <span className="font-black text-bh-primary text-lg tabular-nums">
      {filled}
      <span className="text-bh-muted text-sm font-bold">/10</span>
    </span>
  );
}

/** الأقسام 5-10 — لا تُرسل إطلاقاً لغير المسجّل (محمية على مستوى قاعدة البيانات) */
export default function SummaryFull({ c }: { c: ContentFull }) {
  const pillars = c.s5 || [];
  const quotes = c.s6 || [];
  const s7 = c.s7;
  const s8 = c.s8;
  const s9 = c.s9;
  const s10 = c.s10;

  return (
    <>
      {/* 5 — المحاور الكاملة */}
      {pillars.length > 0 && (
        <Section num={5} title="المحاور الكاملة للكتاب">
          <div className="space-y-4">
            {pillars.map((p, i) => (
              <div key={i}>
                <article className="bh-card overflow-hidden">
                  <header className="bg-bh-primary-light px-5 py-3">
                    <h3 className="bh-pillar-title text-bh-primary-dark">
                      {i + 1}. {p.title}
                    </h3>
                  </header>
                  <div className="p-5 space-y-4">
                    {p.essence && (
                      <p className="bh-body whitespace-pre-line">{p.essence}</p>
                    )}
                    {p.why_you && (
                      <div>
                        <p className="bh-card-label mb-1">لماذا يهمك مباشرةً</p>
                        <p className="bh-body">{p.why_you}</p>
                      </div>
                    )}
                    {p.common_trap && (
                      <div className="bh-trap p-4">
                        <p className="text-[13px] font-bold mb-1">الفخ الشائع</p>
                        <p className="text-[14px] leading-[1.9]">{p.common_trap}</p>
                      </div>
                    )}
                  </div>
                </article>
                {i < pillars.length - 1 && (
                  <div className="flex justify-center py-1">
                    <span className="text-bh-primary text-sm font-bold">↓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 6 — الاقتباسات الذهبية */}
      {quotes.length > 0 && (
        <Section num={6} title="الاقتباسات الذهبية">
          <div className="space-y-4">
            {quotes.map((q, i) => (
              <blockquote key={i} className="bh-card p-6">
                <p className="text-[16px] font-bold italic leading-[1.9] text-bh-primary-dark">
                  “{q.quote}”
                </p>
                {q.interpretation && (
                  <div className="mt-4 pt-4 border-t border-bh-border">
                    <p className="text-[14px] font-bold text-bh-primary mb-1.5">
                      تفسير فريق بهجة
                    </p>
                    <p className="text-[13px] leading-[1.95]">{q.interpretation}</p>
                  </div>
                )}
              </blockquote>
            ))}
          </div>
        </Section>
      )}

      {/* 7 — مثال واقعي */}
      {s7 && (s7.situation || s7.context) && (
        <Section num={7} title="مثال واقعي من بيئة الأعمال">
          <div className="bh-card p-6 space-y-4">
            {([
              ["السياق", s7.context],
              ["الموقف", s7.situation],
              ["القرار", s7.decision],
              ["النتيجة", s7.result],
            ] as const).map(([label, val]) =>
              val ? (
                <div key={label}>
                  <p className="bh-card-label mb-1">{label}</p>
                  <p className="bh-body">{val}</p>
                </div>
              ) : null
            )}
            {s7.lesson && (
              <div className="bg-bh-primary-light rounded-lg p-4">
                <p className="bh-card-label mb-1">الدرس</p>
                <p className="bh-body">{s7.lesson}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* 8 — مسار التحويل (القسم المحوري) */}
      {s8 && (
        <Section num={8} title="مسار التحويل — من المعرفة إلى التطبيق">
          <div className="rounded-xl border-[1.5px] border-bh-primary overflow-hidden bg-bh-surface">
            <header className="bg-bh-primary text-white px-5 py-3">
              <p className="font-black text-[15px]">
                هنا يتحوّل ما قرأته إلى أثر قابل للقياس
              </p>
            </header>

            <div className="grid sm:grid-cols-2 gap-px bg-bh-border">
              {([
                ["١ — التشخيص", s8.diagnosis],
                ["٢ — الخطوة الصفرية (5 دقائق اليوم)", s8.zero_step],
              ] as const).map(([label, val]) => (
                <div key={label} className="bg-bh-surface p-5">
                  <p className="bh-card-label mb-1.5">{label}</p>
                  <p className="bh-body">{val || "—"}</p>
                </div>
              ))}

              <div className="bg-bh-surface p-5">
                <p className="bh-card-label mb-1.5">٣ — خطة الأسبوع الأول</p>
                {s8.week_plan && s8.week_plan.length > 0 ? (
                  <ol className="space-y-2">
                    {s8.week_plan.map((d, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="shrink-0 w-5 h-5 grid place-items-center rounded-full bg-bh-primary-light text-bh-primary text-[11px] font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span className="bh-body">{d}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="bh-body">—</p>
                )}
              </div>

              <div className="bg-bh-surface p-5">
                <p className="bh-card-label mb-1.5">٤ — السؤال المحوري للفريق</p>
                <p className="bh-body">{s8.team_question || "—"}</p>
              </div>
            </div>

            {s8.success_marker && (
              <footer className="bg-bh-primary-light px-5 py-4">
                <p className="bh-card-label mb-1">مؤشر النجاح بعد 30 يوماً</p>
                <p className="bh-body">{s8.success_marker}</p>
              </footer>
            )}
          </div>
        </Section>
      )}

      {/* 9 — رؤية فريق بهجة النقدية */}
      {s9 && (s9.liked || s9.wished || s9.arab_context) && (
        <Section num={9} title="رؤية فريق بهجة النقدية">
          <div className="rounded-xl border border-bh-primary overflow-hidden bg-bh-surface">
            <header className="bg-bh-primary-light px-5 py-3">
              <p className="bh-card-label">رأي محلل — لا نقل محايد</p>
            </header>
            <div className="p-5 space-y-5">
              {([
                ["ما أعجبنا فعلاً", s9.liked],
                ["ما كنا نتمنى أن يقوله المؤلف", s9.wished],
                ["الربط بالسياق العربي والخليجي", s9.arab_context],
              ] as const).map(([label, val]) =>
                val ? (
                  <div key={label}>
                    <p className="bh-card-label mb-1.5">{label}</p>
                    <p className="bh-body">{val}</p>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </Section>
      )}

      {/* 10 — التقييم */}
      {s10 && (
        <Section num={10} title="تقييم فريق بهجة">
          <div className="bh-card divide-y divide-bh-border">
            {([
              ["القيمة للقائد المشغول", s10.value, s10.justifications?.value],
              ["قابلية التطبيق الفوري", s10.applicability, s10.justifications?.applicability],
              ["عمق الأفكار", s10.depth, s10.justifications?.depth],
            ] as const).map(([label, score, why]) => (
              <div key={label} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="bh-card-label">{label}</p>
                  <Stars n={typeof score === "number" ? score : 0} />
                </div>
                {why && <p className="bh-sub mt-1.5">{why}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      <p className="bh-sub text-center mt-12 pt-6 border-t border-bh-border">
        إعداد فريق بهجة · منصة بهجة للمعرفة التطبيقية
      </p>
    </>
  );
}
