import type { BlogFaqItem } from "@/lib/parseBlogFaqs";

export type BlogServiceLink = {
  href: string;
  label: string;
};

export type BlogPostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  /** Custom document title for SEO (falls back to title + site name) */
  metaTitle?: string;
  metaDescription: string;
  category: string;
  accent: string;
  date: string;
  readTime: string;
  /** Primary service page for Article schema / related links */
  primaryServiceHref: string;
  relatedServiceLinks: readonly BlogServiceLink[];
  featured?: boolean;
};

export type BlogPost = BlogPostMeta & {
  content?: string;
  faqs?: BlogFaqItem[];
};
