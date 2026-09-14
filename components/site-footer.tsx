import Link from "next/link";
import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div>
          <Image
            className="logo-mark"
            src="/logo/logo-paper.png"
            width={40}
            height={40}
            alt="شعار بهجة"
            loading="lazy"
          />
          <p className="meta" style={{ marginTop: 10 }}>نحوّل المعرفة إلى أثر</p>
        </div>

        <nav className="footer-nav" aria-label="روابط التذييل">
          <Link href="/">الرئيسية</Link>
          <Link href="/categories">الأقسام</Link>
        </nav>

        <p className="meta">إعداد فريق بهجة · bahjaa.com</p>
      </div>
    </footer>
  );
}
