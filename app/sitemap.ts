import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://bahjaa.com";
  const supabase = await createClient();

  const [{ data: summaries }, { data: categories }] = await Promise.all([
    supabase
      .from("bh_summaries")
      .select("slug, published_at")
      .eq("status", "published"),
    supabase.from("bh_categories").select("slug"),
  ]);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.8 },
    ...((categories || []) as { slug: string }[]).map((c) => ({
      url: `${base}/c/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...((summaries || []) as { slug: string; published_at: string | null }[]).map((s) => ({
      url: `${base}/s/${s.slug}`,
      lastModified: s.published_at ? new Date(s.published_at) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
