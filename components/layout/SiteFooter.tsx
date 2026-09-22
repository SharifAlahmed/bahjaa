// components/layout/SiteFooter.tsx — التذييل · server async component
// المرحلة ٠: خلفية background (ورق)، ٤ أعمدة → عمودان على الجوال.
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";
import { SITE, toArabicNumerals } from "@/lib/site.config";

export default async function SiteFooter() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("bh_categories")
    .select("slug, name_ar, sort_order")
    .order("sort_order");
  const cats = (categories || []) as Pick<Category, "slug" | "name_ar" | "sort_order">[];

  const year = toArabicNumerals(new Date().getFullYear());

  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">

        {/* العمود ١ — الشعار والتعريف */}
        <div className="footer-col footer-brand">
          <Link href="/" aria-label="بهجة — الرئيسية">
            <Image
              className="logo-mark"
              src="/logo/bahjaa-logo.png"
              width={36}
              height={36}
              alt="شعار بهجة"
              loading="lazy"
            />
          </Link>
          <p className="footer-brand-name">بهجة</p>
          <p className="footer-tagline">
            نحوّل المعرفة إلى أثر — منصة عربية تحوّل الكتب إلى خطوات عملية للقادة ورواد الأعمال.
          </p>
        </div>

        {/* العمود ٢ — استكشف */}
        <nav className="footer-col" aria-label="استكشف">
          <p className="footer-col-title">استكشف</p>
          <Link href="/">الرئيسية</Link>
          <Link href="/categories">كل الأقسام</Link>
          <Link href="/login">الدخول</Link>
        </nav>

        {/* العمود ٣ — الأقسام (من البيانات أو تُحذف) */}
        {cats.length > 0 && (
          <nav className="footer-col" aria-label="الأقسام">
            <p className="footer-col-title">الأقسام</p>
            {cats.map((c) => (
              <Link key={c.slug} href={`/c/${c.slug}`}>{c.name_ar}</Link>
            ))}
          </nav>
        )}

        {/* العمود ٤ — تواصل */}
        <div className="footer-col">
          <p className="footer-col-title">تواصل</p>
          <a href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</a>
        </div>

      </div>

      {/* السطر الأخير */}
      <div className="wrap footer-bottom">
        <p className="meta">© {year} بهجة · {SITE.url.replace("https://", "")}</p>
      </div>
    </footer>
  );
}
