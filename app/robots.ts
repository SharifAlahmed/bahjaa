import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://app.bahjaa.com";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/login", "/auth"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
