import Link from "next/link";
import type { SummaryListItem } from "@/lib/types";

export default function SummaryCard({ s }: { s: SummaryListItem }) {
  const idea = s.content_free?.s4?.text || s.content_free?.s1?.core_idea || "";

  return (
    <Link
      href={`/s/${s.slug}`}
      className="bh-card p-5 flex gap-4 hover:border-bh-primary hover:shadow-sm transition group"
    >
      <div className="shrink-0 w-16 h-24 rounded-lg overflow-hidden bg-bh-primary-light grid place-items-center">
        {s.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={s.cover_url}
            alt={s.book_title_ar}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-bh-primary font-black text-2xl">ب</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="bh-pillar-title text-bh-primary-dark group-hover:text-bh-primary transition line-clamp-2">
          {s.book_title_ar}
        </h3>
        {s.author && <p className="bh-sub mt-0.5">{s.author}</p>}
        {idea && <p className="bh-body mt-2 line-clamp-2">{idea}</p>}
        <p className="bh-sub mt-2 text-xs">
          قراءة {s.reading_minutes || 8} دقائق
        </p>
      </div>
    </Link>
  );
}
