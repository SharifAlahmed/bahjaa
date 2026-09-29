"use client";

// نموذج اشتراك نشرة بهجة (beehiiv)
// يحقن سكربت beehiiv داخل الحاوية نفسها، لأن loader.js يضع النموذج بجوار وسم السكربت.

import { useEffect, useRef } from "react";

const FORM_ID = "9e72b41b-b210-47d8-abb2-cd6addd0a62a";

export default function NewsletterForm() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    box.innerHTML = ""; // يمنع التكرار عند التنقل بين الصفحات
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://subscribe-forms.beehiiv.com/v3/loader.js";
    s.setAttribute("data-beehiiv-form", FORM_ID);
    box.appendChild(s);
    return () => {
      box.innerHTML = "";
    };
  }, []);

  return (
    <section dir="rtl" aria-label="اشترك في نشرة بهجة" className="w-full my-12">
      <div ref={ref} className="mx-auto max-w-2xl min-h-[260px]" />
    </section>
  );
}
