import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // رابط اللوحة يظهر للأدمن فقط
  let isAdmin = false;
  if (user) {
    const { data } = await supabase.rpc("bh_is_admin");
    isAdmin = data === true;
  }

  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="logo-lockup" aria-label="بهجة — الصفحة الرئيسية">
          <Image
            className="logo-mark"
            src="/logo/bahjaa-logo.png"
            width={152}
            height={152}
            alt=""
            priority
          />
        </Link>

        <nav className="site-nav" aria-label="التنقل الرئيسي">
          <Link href="/categories">الأقسام</Link>
          {isAdmin && <Link href="/admin" className="hide-sm">اللوحة</Link>}
          {user ? (
            <form action="/auth/signout" method="post">
              <button type="submit" className="nav-cta nav-cta-button">خروج</button>
            </form>
          ) : (
            <Link href="/login" className="nav-cta">دخول</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
