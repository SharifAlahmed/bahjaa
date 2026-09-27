import Image from "next/image";

/* أيقونات SVG مدمجة بمسارات lucide (Eye · BookOpen · ListChecks) — لا حاجة لـ lucide-react */
const iconProps = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function EyeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function BookOpenIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </svg>
  );
}

function ListChecksIcon() {
  return (
    <svg {...iconProps}>
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  );
}

const points = [
  {
    icon: <EyeIcon />,
    title: "رؤيتنا",
    body: "أن نجعل المعرفة الموثوقة قوةً عملية تمكّن القادة وروّاد الأعمال العرب من اتخاذ قراراتٍ أفضل، وبناء أعمالٍ أكثر أثرًا ونتائج.",
  },
  {
    icon: <BookOpenIcon />,
    title: "المعرفة كما يجب أن تُقدَّم",
    body: "نختار الأفكار والكتب والمصادر الموثوقة بعناية، ثم نعيد تقديمها في خلاصات دقيقة وعميقة تحفظ جوهر الفكرة، وتزيل الحشو، وتُظهر ما يهم القائد وصانع القرار في الواقع.",
  },
  {
    icon: <ListChecksIcon />,
    title: "المعرفة كما يجب أن تُستخدَم",
    body: "لا نتوقف عند الفهم، بل نساعدك على الانتقال إلى التطبيق؛ من خلال أسئلة تعمّق التفكير، وأمثلة مرتبطة بالواقع، وخطوات تنفيذية، وتجارب صغيرة قابلة للقياس.",
  },
];

export function WhyBahjaa() {
  return (
    <section className="home-why home-anchor" id="why" aria-labelledby="why-title">
      <div className="wrap home-why-grid">
        <div className="home-why-media">
          <Image
            src="/home/why-summary.webp"
            alt=""
            width={1536}
            height={1024}
            sizes="(max-width: 860px) 100vw, 560px"
          />
        </div>

        <div className="home-col">
          <h2 className="h-sec" id="why-title">لماذا بهجة؟</h2>

          <div className="home-prose">
            <p>
              نعيش في عالمٍ مليء بالكتب، والمقالات، والمقاطع، والأفكار.
              <br />
              لكن كثرة المعلومات لا تعني بالضرورة وضوحًا أكبر أو قرارات أفضل.
            </p>
            <p>
              المشكلة ليست في الوصول إلى المعرفة، بل في معرفة ما يستحق الانتباه،
              وفهم ما يعنيه في سياقك، ثم تحويله إلى عمل ونتيجة.
            </p>
            <p>لهذا وُجدت بهجة.</p>
            <p>
              نبحث في المعرفة الموثوقة من مصادر عالمية متنوعة، ونستخلص جوهرها،
              ثم نقدّمها بأسلوب عربي واضح وعميق وقابل للتطبيق في واقع العمل
              والحياة.
            </p>
            <p className="home-prose-strong">
              لا نلخّص المعرفة لتقرأ أكثر، بل لنساعدك على أن تنفّذ أفضل.
            </p>
          </div>

          <ul className="home-points">
            {points.map((point) => (
              <li key={point.title} className="home-point">
                <span className="home-point-icon">{point.icon}</span>
                <div>
                  <h3 className="home-point-title">{point.title}</h3>
                  <p className="home-point-body">{point.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <a href="#latest" className="btn btn-ghost">استكشف الملخصات</a>
        </div>
      </div>
    </section>
  );
}
