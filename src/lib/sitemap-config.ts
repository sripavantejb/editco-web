import { SITE_URL } from "@/lib/seo";

/**
 * Production site URL — change here if the domain changes.
 * Also used by `src/lib/seo.ts` (SITE_URL).
 */
export { SITE_URL };

/** Static public routes included in sitemap.xml */
export const STATIC_PUBLIC_ROUTES: {
  path: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/services", changeFrequency: "weekly", priority: 0.9 },
  { path: "/services/ai-call-agents", changeFrequency: "weekly", priority: 0.85 },
  { path: "/industries/clinics", changeFrequency: "weekly", priority: 0.85 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.85 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/website-design-agency-hyderabad", changeFrequency: "weekly", priority: 0.9 },
  { path: "/ai-call-agent-for-clinics", changeFrequency: "weekly", priority: 0.9 },
  { path: "/clinic-website-development", changeFrequency: "weekly", priority: 0.9 },
  { path: "/whatsapp-automation-agency", changeFrequency: "weekly", priority: 0.85 },
  { path: "/ai-automation-agency-hyderabad", changeFrequency: "weekly", priority: 0.95 },
];

/** Paths to disallow in robots.txt (add admin/dashboard routes here when they exist). */
export const ROBOTS_DISALLOW_PATHS = [
  "/api/",
  "/_next/",
  "/admin/",
  "/dashboard/",
  "/private/",
];
