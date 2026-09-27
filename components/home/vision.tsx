import Image from "next/image";

/* أيقونات SVG مدمجة بمسارات lucide (BookOpen · ListChecks) — لا حاجة لـ lucide-react */
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

export function Vision() {
  return (
    <section className="home-vision" aria-labelledby="vision-title">
      <div className="wrap">
        <div className="home-vision-banner">
          <Image
            src="/home/vision-banner.webp"
            alt=""
            width={1774}
            height={887}
            sizes="(max-width: 1160px) 100vw, 1080px"
          />
        </div>

        <div className="home-col home-vision-text">
          <h2 className="h-sec" id="vision-title">رؤيتنا</h2>
          <div className="home-prose">
            <p>
              أن نجعل المعرفة الموثوقة قوةً عملية تمكّن القادة وروّاد الأعمال
              العرب من اتخاذ قراراتٍ أفضل، وبناء أعمالٍ أكثر أثرًا ونتائج.
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
        </div>
      </div>
    </section>
  );
}
