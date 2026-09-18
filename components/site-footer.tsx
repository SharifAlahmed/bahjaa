import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

// أربعة أعمدة — كلها روابط حقيقية. لا صفحة مخترعة، لا حساب تواصل غير موجود.
// الوصول يقتبس حقائق TopStrip حرفياً — لا رقم جديد لا نملكه.
const ACCESS_FACTS = ["أول ٤ أقسام مفتوحة مجاناً", "بلا بطاقة ولا كلمة مرور"];

export default async function SiteFooter() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("bh_categories")
    .select("slug, name_ar, sort_order")
    .order("sort_order");
  const cats = (categories || []) as Pick<Category, "slug" | "name_ar" | "sort_order">[];

  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-col footer-brand">
          <Image
            className="logo-mark"
            src="/logo/bahjaa-logo.png"
            width={40}
            height={40}
            alt="شعار بهجة"
            loading="lazy"
          />
          <p className="meta" style={{ marginTop: 10 }}>نحوّل المعرفة إلى أثر</p>
        </div>

        <nav className="footer-col" aria-label="تصفّح">
          <p className="footer-col-title">تصفّح</p>
          <Link href="/">الرئيسية</Link>
          <Link href="/categories">كل الأقسام</Link>
          <Link href="/#latest-summaries">أحدث الملخصات</Link>
        </nav>

        {cats.length > 0 ? (
          <nav className="footer-col" aria-label="الأقسام">
            <p className="footer-col-title">الأقسام</p>
            {cats.map((c) => (
              <Link key={c.slug} href={`/c/${c.slug}`}>{c.name_ar}</Link>
            ))}
          </nav>
        ) : null}

        <div className="footer-col" aria-label="الوصول">
          <p className="footer-col-title">الوصول</p>
          <Link href="/login">تسجيل الدخول</Link>
          {ACCESS_FACTS.map((f) => (
            <p key={f} className="meta footer-fact">{f}</p>
          ))}
        </div>
      </div>

      <div className="wrap footer-bottom">
        <p className="meta">إعداد فريق بهجة · bahjaa.com</p>
      </div>
    </footer>
  );
}
