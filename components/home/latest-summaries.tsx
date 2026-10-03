import { createClient } from "@/lib/supabase/server";
import { LIST_COLUMNS, type Category, type SummaryListItem } from "@/lib/types";
import {
  HOME_FEATURED_KEY, featuredEyebrow, publicFeaturedIds, resolveFeatured,
} from "@/lib/site/home-featured";
import { LatestSummariesView, type BookmarkStatus } from "./latest-summaries-view";

/* أول دليل عملي على قيمة بهجة: ٤ ملخصات مباشرة بعد الهيرو.
   مختارات الأدمن المنشورة (home_featured) أولاً بترتيبها، ثم الأحدث حتى ٤. بلا مختارات صالحة = أحدث ٤ كما كان.
   `selection` لمعاينة الأدمن فقط (مسودة أو نسخة سابقة)؛ الصفحة العامة تقرأ المنشور. */
export async function LatestSummaries({ selection }: { selection?: string[] } = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let ids = selection;
  if (ids === undefined) {
    const { data } = await supabase
      .from("bh_site_content").select("value")
      .eq("key", HOME_FEATURED_KEY).eq("state", "published").maybeSingle();
    ids = publicFeaturedIds((data as { value: unknown } | null)?.value);
  }

  const [{ data: newest }, { data: picks }, { data: categories }] = await Promise.all([
    supabase
      .from("bh_summaries")
      .select(LIST_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(4 + ids.length),
    ids.length
      ? supabase.from("bh_summaries").select(LIST_COLUMNS).eq("status", "published").in("id", ids)
      : Promise.resolve({ data: [] as SummaryListItem[] }),
    supabase.from("bh_categories").select("*").order("sort_order"),
  ]);

  // كل ما يعود من الاستعلامين منشور (status=published، والمؤرشف دائماً غير منشور)
  const asCandidate = (s: SummaryListItem) => ({ ...s, status: "published" as const });
  const byId = new Map(((picks || []) as SummaryListItem[]).map((s) => [s.id, asCandidate(s)]));
  const { items, manualCount } = resolveFeatured(ids, byId, ((newest || []) as SummaryListItem[]).map(asCandidate));

  let bookmarks: Record<string, BookmarkStatus> | null = null;
  if (user) {
    bookmarks = {};
    const { data: bms } = await supabase
      .from("bh_bookmarks")
      .select("summary_id, status")
      .eq("user_id", user.id);
    for (const b of (bms ?? []) as Array<{ summary_id: string; status: BookmarkStatus }>) {
      bookmarks[b.summary_id] = b.status;
    }
  }

  return (
    <LatestSummariesView
      items={items.map(({ status: _status, ...s }) => s as SummaryListItem)}
      categories={(categories || []) as Category[]}
      bookmarks={bookmarks}
      eyebrow={featuredEyebrow(manualCount)}
    />
  );
}
