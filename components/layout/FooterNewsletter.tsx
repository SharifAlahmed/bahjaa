"use client";

// components/layout/FooterNewsletter.tsx — نشرة بهجة داخل الفوتر العام
// نفس NewsletterForm ونفس النموذج الافتراضي. الموضع الوحيد للنشرة في الصفحات العامة.
import { usePathname } from "next/navigation";
import NewsletterForm from "@/components/NewsletterForm";

// /join صفحة هبوط بنموذج مستقل وبلا فوتر
const PAGES_WITH_OWN_FORM = ["/join"];

export default function FooterNewsletter() {
  const pathname = usePathname();
  if (PAGES_WITH_OWN_FORM.includes(pathname)) return null;

  return (
    <div className="footer-news">
      <p className="footer-news-title">رسالة بهجة الأسبوعية</p>
      <p className="footer-news-desc">فكرة واحدة تستحق وقتك، كل أسبوع.</p>
      <NewsletterForm className="w-full" boxClassName="footer-newsletter-box" />
    </div>
  );
}
