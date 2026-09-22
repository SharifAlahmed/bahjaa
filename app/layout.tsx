import type { Metadata } from "next";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: {
    template: "%s · بهجة",
    default: "بهجة — ملخصات الكتب بالعربية",
  },
  description:
    "منصة عربية تحوّل كتب القيادة وريادة الأعمال إلى خطوات عملية. اقرأ أول ٤ أقسام مجاناً.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex flex-col">
        <a href="#main" className="skip-link">تخطَّ إلى المحتوى</a>
        <AnnouncementBar />
        <SiteHeader />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
