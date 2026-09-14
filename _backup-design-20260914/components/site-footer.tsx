import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-bh-border bg-bh-surface mt-16">
      <div className="mx-auto max-w-5xl px-4 py-10 text-center">
        <p className="bh-card-label mb-2">بهجة · من المعرفة إلى الأثر</p>
        <p className="bh-sub max-w-xl mx-auto">
          نحوّل الكتب التي لا تجد وقتاً لقراءتها إلى فهم كامل وخطوة واحدة تطبّقها اليوم.
        </p>
        <div className="mt-5 flex items-center justify-center gap-4 text-sm font-bold text-bh-muted">
          <Link href="/" className="hover:text-bh-primary-dark transition">
            الرئيسية
          </Link>
          <span className="text-bh-border">·</span>
          <Link href="/categories" className="hover:text-bh-primary-dark transition">
            الأقسام
          </Link>
        </div>
        <p className="bh-sub mt-6 text-xs">
          إعداد فريق بهجة · منصة بهجة للمعرفة التطبيقية
        </p>
      </div>
    </footer>
  );
}
