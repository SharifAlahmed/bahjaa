"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { BookmarkButtons } from "@/components/bahjaa/bookmark-buttons";
import { markReadingComplete } from "@/lib/reading-state";
import { IconArrow } from "./icons";

type BookmarkStatus = "want_to_read" | "liked" | null;

/* خاتمة الملخص: انعكاس + إجراءات احتفاظ واضحة للقارئ الذي أكمل الملخص.
   الوصول إلى الخاتمة يعلّم آخر قراءة محلية كمكتملة كي لا يظهر Continue Reading لها. */
export function SummaryEnd({
  category,
  reflect,
  summaryId,
  slug,
  bookmarkStatus = null,
  trackCompletion = true,
}: {
  category?: { slug: string; name_ar: string } | null;
  reflect: boolean;
  summaryId?: string;
  slug?: string;
  bookmarkStatus?: BookmarkStatus;
  trackCompletion?: boolean;
}) {
  const endRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!reflect || !trackCompletion || !slug || typeof IntersectionObserver === "undefined") return;
    const el = endRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          markReadingComplete(slug);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [reflect, slug, trackCompletion]);

  return (
    <section ref={endRef} className="sr-end" aria-label="ماذا بعد">
      {reflect ? (
        <p className="sr-end-q">ما الفكرة الواحدة التي ستأخذها معك من هذا الكتاب؟</p>
      ) : null}

      {reflect && summaryId ? (
        <div className="sr-end-actions" aria-label="احفظ هذا الملخص">
          <p className="sr-end-actions-title">احتفظ بما يستحق العودة إليه</p>
          <BookmarkButtons summaryId={summaryId} initialStatus={bookmarkStatus} />
          <Link href="/my-library" className="textlink sr-end-library">
            اذهب إلى مكتبتي
          </Link>
        </div>
      ) : null}

      {category ? (
        <Link href={`/c/${category.slug}`} className="btn btn-ghost sr-end-btn">
          استكشف ملخصات أخرى في {category.name_ar}
          <IconArrow size={18} />
        </Link>
      ) : (
        <Link href="/categories" className="btn btn-ghost sr-end-btn">
          تصفّح ملخصات أخرى
          <IconArrow size={18} />
        </Link>
      )}
    </section>
  );
}
