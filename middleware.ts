import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // بلا إعدادات Supabase لا يوجد ما يُحدَّث. نمرّر الطلب بدل إسقاط الموقع كله.
  //
  // لماذا هذا آمن: الوسيط يجدّد كوكي الجلسة فقط. الجدار المجاني مطبّق في
  // طبقتين أخريين — اختيار الأعمدة في app/s/[slug]/page.tsx، وصلاحيات
  // الأعمدة في Postgres. تخطّي التجديد يجعل الزائر يبدو غير مسجّل،
  // أي يفشل إلى الجانب الأكثر تحفّظاً.
  if (!url || !key) {
    console.error("[middleware] متغيّرات Supabase غير معرّفة في هذه البيئة — مرّرنا الطلب بلا تجديد جلسة.");
    return response;
  }

  let res = response;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }: CookieToSet) =>
          request.cookies.set(name, value)
        );
        res = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
          res.cookies.set(name, value, options)
        );
      },
    },
  });

  // تحديث الجلسة — لا تحذف هذا السطر.
  // عطل عابر في Supabase يجب ألا يعني ٥٠٠ على كل صفحة في الموقع.
  try {
    await supabase.auth.getUser();
  } catch (e) {
    console.error("[middleware] تعذّر تجديد الجلسة:", e);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
