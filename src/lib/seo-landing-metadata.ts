import type { Metadata } from "next";
import type { SeoLandingPageContent } from "@/content/seo-landing-pages";
import { buildPageMetadata } from "@/lib/seo";

export function seoLandingMetadata(page: SeoLandingPageContent): Metadata {
  return buildPageMetadata({
    path: page.path,
    titleAbsolute: page.meta.titleAbsolute,
    description: page.meta.description,
  });
}
