"use client";

// نموذج اشتراك نشرة بهجة (beehiiv)
// يحقن سكربت beehiiv داخل الحاوية نفسها، لأن loader.js يضع النموذج بجوار وسم السكربت.

import { useEffect, useRef } from "react";

const DEFAULT_FORM_ID = "9e72b41b-b210-47d8-abb2-cd6addd0a62a";

export default function NewsletterForm({
  formId = DEFAULT_FORM_ID,
}: {
  formId?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;

    box.innerHTML = ""; // يمنع التكرار عند التنقل بين الصفحات
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://subscribe-forms.beehiiv.com/v3/loader.js";
    script.setAttribute("data-beehiiv-form", formId);
    box.appendChild(script);

    return () => {
      box.innerHTML = "";
    };
  }, [formId]);

  return (
    <section dir="rtl" aria-label="اشترك في نشرة بهجة" className="w-full my-12">
      <div ref={ref} className="mx-auto max-w-2xl min-h-[260px]" />
    </section>
  );
}
