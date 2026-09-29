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

type Props = {
  searchParams: Promise<{ next?: string | string[] }>;
};

function safeNext(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export default async function LoginPage({ searchParams }: Props) {
  const { next: rawNext } = await searchParams;
  const next = safeNext(rawNext);

  // من دخل فعلاً لا يرى نموذج الدخول مرة أخرى، ويكمل إلى الوجهة التي قصدها.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(next);

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
