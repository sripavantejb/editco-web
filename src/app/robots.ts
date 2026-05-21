import type { MetadataRoute } from "next";
import { ROBOTS_DISALLOW_PATHS, SITE_URL } from "@/lib/sitemap-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ROBOTS_DISALLOW_PATHS,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
