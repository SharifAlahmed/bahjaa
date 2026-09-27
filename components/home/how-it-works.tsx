import { getImageProps } from "next/image";

/* سطح المكتب: إنفوغرافيك «كيف تعمل بهجة؟» وفيه العنوان والخطوات، فيبقى h2 لقارئ الشاشة.
   الجوال: صورة بلا نص، والعنوان والخطوات الثلاث تُكتب في الصفحة. */
const steps = [
  {
    title: "المعرفة كما يجب أن تُقدَّم",
    body: "نختار الأفكار والكتب والمصادر الموثوقة بعناية.",
  },
  {
    title: "خلاصة دقيقة وعميقة",
    body: "نعيد تقديمها في خلاصات دقيقة وعميقة تحفظ الجوهر، وتزيل الحشو، وتُظهر ما يهم القائد وصانع القرار.",
  },
  {
    title: "المعرفة كما يجب أن تُستخدَم",
    body: "نساعدك على الانتقال من الفهم إلى التطبيق عبر أسئلة، وأمثلة، وخطوات تنفيذية، وتجارب صغيرة قابلة للقياس.",
  },
];

export function HowItWorks() {
  const common = { alt: "", sizes: "(max-width: 920px) 100vw, 880px" };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: "/home/how-it-works.webp", width: 1672, height: 941 });
  const {
    props: { srcSet: mobileSrcSet, ...mobileImg },
  } = getImageProps({ ...common, src: "/home/how-mobile.webp", width: 1122, height: 1402 });

  return (
    <section className="home-how" aria-labelledby="how-title">
      <div className="wrap">
        <h2 className="home-how-h2" id="how-title">كيف تعمل بهجة؟</h2>
        <div className="home-why-media">
          <picture>
            <source media="(min-width: 600px)" srcSet={desktopSrcSet} width={1672} height={941} />
            <img {...mobileImg} srcSet={mobileSrcSet} alt="" />
          </picture>
        </div>
        <ol className="home-m-list home-m-steps">
          {steps.map((step) => (
            <li key={step.title}>
              <h3 className="home-m-list-title">{step.title}</h3>
              <p className="home-m-list-body">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
