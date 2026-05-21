import { parseBlogContent, type BlogFaqItem } from "@/lib/parseBlogFaqs";
import { aiCallAgentsClinicsArticle } from "./articles/ai-call-agents-clinics";
import { blogArticleStubs } from "./articles/stubs";
import { blogPostCatalog } from "./posts";
import type { BlogPost } from "./types";

export type { BlogPost, BlogPostMeta, BlogServiceLink } from "./types";
export { blogPostCatalog, featuredPost } from "./posts";

const articleBodies: Record<
  string,
  { content: string; faqs?: readonly BlogFaqItem[] }
> = {
  "ai-call-agents-help-clinics-reduce-missed-calls": aiCallAgentsClinicsArticle,
  ...blogArticleStubs,
};

function resolvePost(meta: (typeof blogPostCatalog)[number]): BlogPost {
  const body = articleBodies[meta.slug];
  if (!body?.content) {
    return { ...meta, content: undefined, faqs: [] };
  }
  if (body.faqs?.length) {
    return { ...meta, content: body.content.trim(), faqs: [...body.faqs] };
  }
  const { content, faqs } = parseBlogContent(body.content);
  return { ...meta, content, faqs };
}

export const blogPosts: BlogPost[] = blogPostCatalog.map(resolvePost);

export const categoryColors: Record<string, string> = {
  Clinics: "#fca5cc",
  Websites: "#c3a4f6",
  WhatsApp: "#2fdf92",
  "SEO/AEO": "#ff4e00",
  Automation: "#2fdf92",
  "AI Agents": "#ff4e00",
};

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllPostSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}
