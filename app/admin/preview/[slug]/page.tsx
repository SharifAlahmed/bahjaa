import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/supabase/admin";
import SummaryFree from "@/components/summary-free";
import SummaryFull from "@/components/summary-full";
import type { Summary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const email = await getAdminEmail();
  if (!email) notFound();

  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("bh_summaries")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  const s = data as Summary | null;
  if (!s) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <div className="bh-card p-4 mb-8 flex items-center justify-between gap-3 flex-wrap bg-background border-accent-gold">
        <p className="text-[14px] font-bold text-brand-dark">
          معاينة الأدمن · الحالة: {s.status === "published" ? "منشور" : "مسودة"}
        </p>
        <Link href="/admin" className="text-sm font-bold text-brand-dark hover:underline">
          ← عودة للوحة
        </Link>
      </div>

      <h1 className="text-3xl font-black leading-[1.45] text-brand-dark">
        {s.book_title_ar}
      </h1>
      {s.author && <p className="bh-body mt-1">{s.author}</p>}

      <SummaryFree c={s.content_free || {}} />
      {s.content_full && <SummaryFull c={s.content_full} />}
    </article>
  );
}
