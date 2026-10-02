import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: {
    template: "%s · بهجة",
    default: "بهجة — منصة عربية للمعرفة التطبيقية",
  },
  description:
    "منصة عربية للمعرفة التطبيقية، تساعد القادة ورواد الأعمال على تحويل المعرفة إلى فهم أوضح، وقرارات أفضل، وخطوات قابلة للتطبيق.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex flex-col">
        <a href="#main" className="skip-link">تخطَّ إلى المحتوى</a>
        <SiteHeader />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
