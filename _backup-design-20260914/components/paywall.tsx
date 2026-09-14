import Link from "next/link";

/** الجدار — يظهر بعد القسم الرابع لغير المسجّل */
export default function Paywall({ slug }: { slug: string }) {
  return (
    <div className="relative mt-10">
      {/* لمحة مموّهة عمّا خلف الجدار */}
      <div className="bh-fade pointer-events-none select-none" aria-hidden="true">
        <div className="bh-card overflow-hidden">
          <div className="bg-bh-primary-light px-5 py-3">
            <div className="h-4 w-2/5 rounded bg-bh-primary/25" />
          </div>
          <div className="p-5 space-y-2.5">
            {[95, 88, 70, 82, 60].map((w, i) => (
              <div key={i} className="h-3 rounded bg-bh-border" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="bh-card p-8 text-center -mt-16 relative border-[1.5px] border-bh-primary">
        <p className="bh-sec-num text-bh-primary bg-bh-primary-light px-3 py-1 rounded-full inline-block mb-4">
          بقية الملخص
        </p>
        <h2 className="bh-sec-title text-bh-primary-dark leading-[1.6]">
          الجزء الذي يغيّر شيئاً فعلاً — خلف هذا السطر
        </h2>
        <p className="bh-body mt-3 max-w-lg mx-auto">
          المحاور الكاملة للكتاب، الاقتباسات الذهبية بتفسير فريق بهجة، مثال من بيئة الأعمال،
          <strong className="font-bold"> ومسار التحويل</strong> — خطوة تطبّقها اليوم قبل أن تنام.
        </p>

        <Link
          href={`/login?next=/s/${slug}`}
          className="inline-block mt-6 px-8 py-3.5 rounded-xl bg-bh-primary text-white font-bold hover:bg-bh-primary-dark transition"
        >
          افتح الملخص كاملاً — بإيميلك فقط
        </Link>

        <p className="bh-sub mt-4 text-xs">
          بلا كلمة مرور · بلا بطاقة · رمز دخول يصلك على بريدك
        </p>
      </div>
    </div>
  );
}
