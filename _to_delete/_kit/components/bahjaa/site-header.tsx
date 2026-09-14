// components/bahjaa/site-header.tsx
import Link from 'next/link'
import Image from 'next/image'

export function SiteHeader({ isSignedIn = false }: { isSignedIn?: boolean }) {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="logo-lockup" aria-label="بهجة — الصفحة الرئيسية">
          {/* نسخة الشعار الورقية: دائرة paper وخط deep — تقرأ فوق الهيدر الداكن */}
          <Image className="logo-mark" src="/logo/logo-paper.png" width={46} height={46} alt="شعار بهجة" priority />
          <span className="logo-tag">نحوّل المعرفة إلى أثر</span>
        </Link>

        <nav className="site-nav" aria-label="التنقل الرئيسي">
          <Link href="/categories">الأقسام</Link>
          <Link href="/" className="hide-sm">الملخصات</Link>
          {isSignedIn ? (
            <form action="/auth/signout" method="post">
              <button type="submit" className="nav-cta" style={{ background: 'none', font: 'inherit', cursor: 'pointer' }}>
                خروج
              </button>
            </form>
          ) : (
            <Link href="/login" className="nav-cta">دخول</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
