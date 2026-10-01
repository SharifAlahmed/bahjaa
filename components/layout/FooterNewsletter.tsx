"use client";

// components/layout/FooterNewsletter.tsx — نشرة بهجة داخل الفوتر العام
// نفس NewsletterForm ونفس النموذج الافتراضي. لا تُعرض حيث يوجد نموذج اشتراك في الصفحة نفسها.
import { usePathname } from "next/navigation";
import NewsletterForm from "@/components/NewsletterForm";

// الرئيسية تنتهي بنموذجها الخاص، و/join صفحة هبوط بنموذج مستقل وبلا فوتر
const PAGES_WITH_OWN_FORM = ["/", "/join"];

export default function FooterNewsletter() {
  const pathname = usePathname();
  if (PAGES_WITH_OWN_FORM.includes(pathname)) return null;

  return (
    <div className="wrap footer-newsletter">
      <NewsletterForm className="w-full" boxClassName="footer-newsletter-box" />
    </div>
  );
}
