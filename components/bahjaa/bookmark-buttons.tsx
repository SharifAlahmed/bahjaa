"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "want_to_read" | "liked" | null;

// أيقونة الإشارة المرجعية
function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// أيقونة القلب
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function BookmarkButtons({
  summaryId,
  initialStatus,
}: {
  summaryId: string;
  initialStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle(newStatus: "want_to_read" | "liked") {
    if (loading) return;
    setLoading(true);

    const prev = status;
    const next: Status = status === newStatus ? null : newStatus;
    setStatus(next); // optimistic

    try {
      let res: Response;
      if (next === null) {
        res = await fetch("/api/bookmarks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary_id: summaryId }),
        });
      } else {
        res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary_id: summaryId, status: next }),
        });
      }

      if (res.status === 401) {
        setStatus(prev);
        router.push("/login");
      } else if (!res.ok) {
        setStatus(prev); // revert on error
      }
    } catch {
      setStatus(prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bookmark-btns" role="group" aria-label="حفظ في مكتبتي">
      <button
        className={`bm-btn${status === "want_to_read" ? " bm-active" : ""}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle("want_to_read"); }}
        aria-label={status === "want_to_read" ? "إزالة من قائمة القراءة" : "أريد قراءته"}
        aria-pressed={status === "want_to_read"}
        disabled={loading}
        title="أريد قراءته"
      >
        <BookmarkIcon filled={status === "want_to_read"} />
        <span className="bm-label">أريد قراءته</span>
      </button>

      <button
        className={`bm-btn${status === "liked" ? " bm-active bm-liked" : ""}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle("liked"); }}
        aria-label={status === "liked" ? "إزالة من المفضلة" : "أعجبني"}
        aria-pressed={status === "liked"}
        disabled={loading}
        title="أعجبني"
      >
        <HeartIcon filled={status === "liked"} />
        <span className="bm-label">أعجبني</span>
      </button>
    </div>
  );
}
