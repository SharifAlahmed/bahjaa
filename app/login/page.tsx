import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "الدخول",
  description: "ادخل بإيميلك — بلا كلمة مرور.",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // من دخل فعلاً لا يرى نموذج الدخول مرة أخرى
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="bh-card p-8">
        <h1 className="bh-sec-title text-brand-dark text-center">
          افتح الملخصات كاملة
        </h1>
        <p className="bh-body text-center mt-2">
          اكتب بريدك وسيصلك رمز دخول. بلا كلمة مرور تحفظها، وبلا بطاقة.
        </p>

        <Suspense fallback={<div className="h-40" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
