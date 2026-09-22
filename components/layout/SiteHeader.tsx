// components/layout/SiteHeader.tsx — الترويسة · server async component
// المرحلة ٠: خلفية surface، لاصقة، ظل بعد ٨ بكسل، قائمة جوال منزلقة.
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { NavLinks } from "./NavLinks";

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
            width={44}
            height={44}
            alt=""
            priority
          />
          <span className="footer-brand-name" aria-hidden="true">بهجة</span>
        </Link>

        <NavLinks user={!!user} isAdmin={isAdmin} />
      </div>
    </header>
  );
}
