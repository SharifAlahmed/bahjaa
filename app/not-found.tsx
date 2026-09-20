import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-5xl font-black text-surface">404</p>
      <h1 className="bh-sec-title text-brand-dark mt-3">
        لا يوجد شيء هنا
      </h1>
      <p className="bh-body mt-2">
        ربما حُذفت الصفحة، أو الرابط غير صحيح.
      </p>
      <Link
        href="/"
        className="inline-block mt-6 px-6 py-3 rounded-xl bg-brand-ink text-white font-bold hover:bg-brand-dark transition"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
