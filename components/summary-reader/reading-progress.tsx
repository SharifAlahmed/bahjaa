"use client";

import { useEffect } from "react";

const AR = "٠١٢٣٤٥٦٧٨٩";
const ar = (n: number) => String(n).replace(/\d/g, (d) => AR[Number(d)]);

/* تحسين تدريجي فقط: يبرز القسم الظاهر في المستكشف، ويكتب «٤ / ١٠ · الاسم» في
   ملخّص الجوال، ويطوي قائمة الجوال بعد اختيار قسم. لا يستقبل أي محتوى من الملخص —
   أسماء الأقسام وحدها. بلا JavaScript تبقى الروابط والمراسي والقائمة تعمل كما هي. */
export function ReadingProgress({ names }: { names: string[] }) {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const sections = names
      .map((_, i) => document.getElementById(`sec-${i + 1}`))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const label = document.querySelector<HTMLElement>("[data-sr-current]");
    const visible = new Set<number>();

    const mark = (n: number) => {
      document.querySelectorAll<HTMLElement>("[data-sr-nav]").forEach((a) => {
        if (Number(a.dataset.srNav) === n) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
      if (label) label.textContent = `${ar(n)} / ١٠ · ${names[n - 1]}`;
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const n = Number(e.target.id.replace("sec-", ""));
          if (e.isIntersecting) visible.add(n);
          else visible.delete(n);
        });
        if (visible.size) mark(Math.min(...visible));
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    sections.forEach((s) => io.observe(s));

    const menu = document.querySelector<HTMLDetailsElement>(".sr-nav-m");
    const close = (ev: Event) => {
      if ((ev.target as HTMLElement).closest("a") && menu) menu.open = false;
    };
    menu?.addEventListener("click", close);

    return () => {
      io.disconnect();
      menu?.removeEventListener("click", close);
    };
  }, [names]);

  return null;
}
