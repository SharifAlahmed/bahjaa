/* «لماذا بهجة؟» في الرئيسية: المشكلة ثم سبب وجود بهجة.
   الرسم يُظهر التحوّل (وفرة مشتّتة ← بهجة ← معرفة واضحة قابلة للاستخدام)،
   لا خطوات مرقّمة، حتى لا يشبه رحلة «كيف تعمل بهجة؟». صفحة «عن بهجة» تستعمل why-bahjaa.tsx. */
import Image from "next/image";

const icon = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/* مسارات lucide: BookOpen · FileText · PlayCircle · Lightbulb */
const sources = [
  {
    label: "كتب",
    svg: (
      <svg {...icon}>
        <path d="M12 7v14" />
        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
      </svg>
    ),
  },
  {
    label: "مقالات",
    svg: (
      <svg {...icon}>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
      </svg>
    ),
  },
  {
    label: "فيديوهات",
    svg: (
      <svg {...icon}>
        <circle cx="12" cy="12" r="10" />
        <path d="m10 8 6 4-6 4Z" />
      </svg>
    ),
  },
  {
    label: "أفكار",
    svg: (
      <svg {...icon}>
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    ),
  },
];

export function WhyHome() {
  return (
    <section className="hm-why" id="why" aria-labelledby="why-title">
      <div className="wrap hm-why-grid">
        <div className="hm-why-text">
          <h2 className="h-sec" id="why-title">لماذا بهجة؟</h2>
          <p className="hm-lead">المعرفة كثيرة. لكن ما يستحق وقتك أقل بكثير.</p>
          <div className="hm-prose">
            <p>
              لم تعد المشكلة في الوصول إلى المعرفة، بل في معرفة ما الذي يستحق
              انتباهك، وكيف تفهمه بعمق، وماذا تفعل به بعد ذلك.
            </p>
            <p>
              لهذا وُجدت بهجة: لنساعدك على الوصول إلى جوهر المعرفة، وفهمها بوضوح،
              ثم تحويلها إلى شيء يمكنك استخدامه في حياتك وعملك وقراراتك.
            </p>
          </div>
        </div>

        {/* الرسم زخرفي يكرّر معنى النص، فيُخفى عن قارئ الشاشة */}
        <div className="hm-why-visual" aria-hidden="true">
          <div className="hm-noise">
            {sources.map((s, i) => (
              <span key={s.label} className={`hm-chip hm-chip-${i + 1}`}>
                {s.svg}
                {s.label}
              </span>
            ))}
            {/* أصداء باهتة توحي بالكثرة */}
            <span className="hm-ghost hm-ghost-1" />
            <span className="hm-ghost hm-ghost-2" />
            <span className="hm-ghost hm-ghost-3" />
            <span className="hm-ghost hm-ghost-4" />
          </div>

          <svg className="hm-converge" viewBox="0 0 320 64" preserveAspectRatio="none">
            <path d="M40 0 C 40 40, 160 28, 160 64" />
            <path d="M120 0 C 120 34, 160 34, 160 64" />
            <path d="M200 0 C 200 34, 160 34, 160 64" />
            <path d="M280 0 C 280 40, 160 28, 160 64" />
          </svg>

          <div className="hm-mark">
            <Image src="/logo/bahjaa-logo.png" alt="" width={56} height={56} />
          </div>

          <svg className="hm-converge hm-converge-out" viewBox="0 0 320 36" preserveAspectRatio="none">
            <path d="M160 0 L160 36" />
          </svg>

          <div className="hm-clear">
            <span className="hm-clear-check">
              <svg {...icon} width={18} height={18}><path d="M20 6 9 17l-5-5" /></svg>
            </span>
            <div>
              <p className="hm-clear-title">معرفة واضحة</p>
              <p className="hm-clear-sub">فكرة قابلة للاستخدام</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
