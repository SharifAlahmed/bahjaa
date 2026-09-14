import Link from "next/link";
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
    <header className="sticky top-0 z-40 bg-bh-surface/90 backdrop-blur border-b border-bh-border">
      <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-bh-primary text-white font-black text-lg">
            ب
          </span>
          <span className="font-black text-xl text-bh-primary-dark">بهجة</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4 text-sm font-bold">
          <Link
            href="/categories"
            className="px-2 py-1 rounded-lg text-bh-muted hover:text-bh-primary-dark hover:bg-bh-primary-light transition"
          >
            الأقسام
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="px-2 py-1 rounded-lg text-bh-primary hover:bg-bh-primary-light transition"
            >
              اللوحة
            </Link>
          )}
          {user ? (
            <form action="/auth/signout" method="post" className="flex items-center gap-2">
              <span className="hidden sm:inline text-bh-muted font-normal text-xs max-w-[12rem] truncate">
                {user.email}
              </span>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg border border-bh-border text-bh-muted hover:bg-bh-bg transition"
              >
                خروج
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-bh-primary text-white hover:bg-bh-primary-dark transition"
            >
              دخول
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
