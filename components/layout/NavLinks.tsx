"use client";
// components/layout/NavLinks.tsx — روابط التنقل + قائمة الجوال · client
// يستخدم usePathname للرابط النشط، وstate للقائمة المنزلقة.
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useCallback, useState } from "react";

/* أيقونات SVG مدمجة — لا حاجة لـ lucide-react */
function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6"  x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6"  x2="6"  y2="18" />
      <line x1="6"  y1="6"  x2="18" y2="18" />
    </svg>
  );
}

interface Props {
  user: boolean;
  isAdmin: boolean;
}

export function NavLinks({ user, isAdmin }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // ظل الترويسة بعد ٨ بكسل
  useEffect(() => {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // إغلاق القائمة بـ Esc
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeMenu(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  // تأمين التمرير عند فتح القائمة
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navLink = (href: string, label: string, extra?: string) => (
    <Link
      href={href}
      className={`${isActive(href) ? "active" : ""} ${extra ?? ""}`.trim()}
      onClick={closeMenu}
    >
      {label}
    </Link>
  );

  return (
    <>
      {/* روابط سطح المكتب */}
      <nav className="site-nav" aria-label="التنقل الرئيسي">
        {navLink("/categories", "الأقسام", "hide-mobile")}
        {user && navLink("/my-library", "مكتبتي", "hide-mobile")}
        {isAdmin && navLink("/admin", "اللوحة", "hide-mobile")}

        {user ? (
          <form action="/auth/signout" method="post" className="hide-mobile">
            <button type="submit" className="nav-cta btn">خروج</button>
          </form>
        ) : (
          <Link href="/login" className="nav-cta hide-mobile">دخول</Link>
        )}

        {/* زر القائمة على الجوال */}
        <button
          className="nav-icon-btn mobile-only"
          aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </nav>

      {/* لوحة الجوال المنزلقة */}
      <div
        className={`mobile-nav-overlay${menuOpen ? " open" : ""}`}
        aria-hidden="true"
        onClick={closeMenu}
      />
      <div
        ref={panelRef}
        className={`mobile-nav-panel${menuOpen ? " open" : ""}`}
        aria-label="قائمة التنقل"
      >
        <button className="mobile-nav-close" onClick={closeMenu} aria-label="إغلاق القائمة">
          <IconClose />
        </button>
        {navLink("/", "الرئيسية")}
        {navLink("/categories", "الأقسام")}
        {user && navLink("/my-library", "مكتبتي")}
        {isAdmin && navLink("/admin", "اللوحة")}
        {user ? (
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn btn-ghost" style={{ width: "100%", marginBlockStart: 16 }}>
              خروج
            </button>
          </form>
        ) : (
          <Link href="/login" className="btn btn-primary" style={{ marginBlockStart: 16 }} onClick={closeMenu}>
            دخول
          </Link>
        )}
      </div>
    </>
  );
}
