import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const res = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  // لا يُخزَّن شيء بعد الخروج — حتى لا يعود المتصفح بصفحة تظهر كأن المستخدم داخل
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return res;
}
