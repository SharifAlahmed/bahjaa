import Link from "next/link";
import { IconArrow } from "./icons";

/* خاتمة الملخص: سؤال تأمّل (نص واجهة، لا يُحفظ) ثم خطوة تالية إلى قسم الكتاب الفعلي */
export function SummaryEnd({
  category,
  reflect,
}: {
  category?: { slug: string; name_ar: string } | null;
  reflect: boolean;
}) {
  return (
    <section className="sr-end" aria-label="ماذا بعد">
      {reflect ? (
        <p className="sr-end-q">ما الفكرة الواحدة التي ستأخذها معك من هذا الكتاب؟</p>
      ) : null}
      {category ? (
        <Link href={`/c/${category.slug}`} className="btn btn-ghost sr-end-btn">
          استكشف ملخصات أخرى في {category.name_ar}
          <IconArrow size={18} />
        </Link>
      ) : (
        <Link href="/categories" className="btn btn-ghost sr-end-btn">
          تصفّح ملخصات أخرى
          <IconArrow size={18} />
        </Link>
      )}
    </section>
  );
}
