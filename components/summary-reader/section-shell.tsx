import type { ReactNode } from "react";
import { toArabicDigits } from "@/components/bahjaa/format";

/* إطار القسم: id="sec-N" (مرساة المستكشف)، رقم وعنوان، وأيقونة اختيارية
   تُستعمل فقط حين تحمل معنى. variant يغيّر التكوين لا الألوان العشوائية. */
export function SectionShell({
  num,
  title,
  icon,
  variant = "plain",
  children,
}: {
  num: number;
  title: string;
  icon?: ReactNode;
  variant?: string;
  children: ReactNode;
}) {
  return (
    <section id={`sec-${num}`} className={`sr-sec sr-sec--${variant}`} aria-labelledby={`sec-${num}-t`}>
      <header className="sr-sec-head">
        <span className="sr-sec-num">القسم {toArabicDigits(num)}</span>
        <h2 className="sr-sec-title" id={`sec-${num}-t`}>
          {icon ? <span className="sr-sec-icon">{icon}</span> : null}
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}
