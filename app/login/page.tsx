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
  searchParams: Promise<{
    next?: string | string[];
    reason?: string | string[];
  }>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeNext(raw: string | string[] | undefined) {
  const value = first(raw);
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function loginCopy(rawReason: string | string[] | undefined) {
  const reason = first(rawReason);

  if (reason === "save") {
    return {
      title: "احفظ هذا الملخص في مكتبتك",
      body: "ادخل ببريدك ليكتمل الحفظ وتعود إلى المكان نفسه. بلا كلمة مرور.",
    };
  }

  if (reason === "library") {
    return {
      title: "ادخل إلى مكتبتك",
      body: "اكتب بريدك وسيصلك رمز دخول لفتح مكتبتك. بلا كلمة مرور.",
    };
  }

  return {
    title: "افتح الملخصات كاملة",
    body: "اكتب بريدك وسيصلك رمز دخول. بلا كلمة مرور تحفظها، وبلا بطاقة.",
  };
}

export default async function LoginPage({ searchParams }: Props) {
  const { next: rawNext, reason: rawReason } = await searchParams;
  const next = safeNext(rawNext);
  const copy = loginCopy(rawReason);

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
          {copy.title}
        </h1>
        <p className="bh-body text-center mt-2">
          {copy.body}
        </p>

        <Suspense fallback={<div className="h-40" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
