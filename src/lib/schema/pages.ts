import { faq as homeFaq } from "@/content/landing";
import type { SeoLandingPageContent } from "@/content/seo-landing-pages";
import { aiCallAgentsPage } from "@/content/ai-call-agents-page";
import { clinicsPage } from "@/content/clinics-page";
import { servicesPage } from "@/content/services-page";
import { getPost } from "@/content/blog";
import { SEO_DEFAULTS } from "@/lib/seo";
import { segmentsToPlainText, type RichSegment } from "@/lib/rich-content";
import type { FaqItem } from "./types";
import { absoluteUrl, getServiceByPath } from "./constants";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  buildPageSchemaGraph,
  buildServiceSchema,
  buildServicesItemListSchema,
  buildWebPageSchema,
} from "./builders";

type FaqContentItem = {
  q: string;
  a?: string;
  aRich?: readonly RichSegment[];
};

export function normalizeFaqItems(items: readonly FaqContentItem[]): FaqItem[] {
  return items.map((item) => ({
    q: item.q,
    a: item.a ?? (item.aRich ? segmentsToPlainText(item.aRich) : ""),
  }));
}

export function getHomePageSchema() {
  const path = "/";
  const url = absoluteUrl(path);
  return buildPageSchemaGraph([
    buildWebPageSchema({
      path,
      name: SEO_DEFAULTS.title,
      description: SEO_DEFAULTS.description,
    }),
    buildFaqPageSchema(url, normalizeFaqItems(homeFaq.items)),
  ]);
}

export function getServicesPageSchema() {
  const path = "/services";
  const url = absoluteUrl(path);
  return buildPageSchemaGraph([
    buildWebPageSchema({
      path,
      name: "Our Services | Editco Media",
      description:
        "Explore Editco Media services including smart websites, AI call agents, WhatsApp automation, business automation, SEO/AEO optimization, and growth systems for modern businesses.",
    }),
    buildServicesItemListSchema(),
    buildBreadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "Services", href: "/services" },
    ]),
    buildFaqPageSchema(url, normalizeFaqItems(servicesPage.faq.items)),
  ]);
}

export function getAiCallAgentsPageSchema() {
  const path = "/services/ai-call-agents";
  const url = absoluteUrl(path);
  const serviceDef = getServiceByPath(path)!;

  return buildPageSchemaGraph([
    buildWebPageSchema({
      path,
      name: "AI Call Agents for Clinics & Businesses | Editco Media",
      description:
        "Editco Media builds AI call agents that answer calls, capture leads, book appointments, handle missed calls, and automate customer conversations for clinics and businesses.",
    }),
    buildServiceSchema(serviceDef, { pageUrl: url }),
    buildFaqPageSchema(url, normalizeFaqItems(aiCallAgentsPage.faq.items)),
    buildBreadcrumbSchema(aiCallAgentsPage.hero.breadcrumbs),
  ]);
}

export function getClinicsPageSchema() {
  const path = "/industries/clinics";
  const url = absoluteUrl(path);
  const service = getServiceByPath(path);

  return buildPageSchemaGraph([
    buildWebPageSchema({
      path,
      name: "Clinic Growth System | Websites, AI Calls & Automation | Editco Media",
      description:
        "Editco Media helps clinics grow with modern websites, appointment booking systems, AI call agents, WhatsApp follow-ups, SEO/AEO, and digital growth automation.",
    }),
    service ? buildServiceSchema(service, { pageUrl: url }) : null,
    buildFaqPageSchema(url, normalizeFaqItems(clinicsPage.faq.items)),
    buildBreadcrumbSchema(clinicsPage.hero.breadcrumbs),
  ]);
}

export function getContactPageSchema() {
  const path = "/contact";
  return buildPageSchemaGraph([
    buildWebPageSchema({
      path,
      name: "Contact Editco Media | Book a Free Growth Audit",
      description:
        "Contact Editco Media to build smart websites, AI call agents, WhatsApp automation, SEO/AEO systems, and business automation workflows for your business.",
    }),
    buildBreadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "Contact", href: "/contact" },
    ]),
  ]);
}

export function getBlogIndexSchema() {
  const path = "/blog";
  return buildPageSchemaGraph([
    buildWebPageSchema({
      path,
      name: "Blog | AI Automation, Websites & Growth Insights | Editco Media",
      description:
        "Read Editco Media guides on AI call agents, business automation, websites, RAG, SaaS, content, branding, and SEO/AEO for business owners.",
    }),
    buildBreadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "Blog", href: "/blog" },
    ]),
  ]);
}

export function getSeoLandingPageSchema(page: SeoLandingPageContent) {
  const path = page.path;
  const url = absoluteUrl(path);
  const serviceDef = getServiceByPath(path);

  return buildPageSchemaGraph([
    buildWebPageSchema({
      path,
      name: page.meta.titleAbsolute,
      description: page.meta.description,
    }),
    serviceDef ? buildServiceSchema(serviceDef, { pageUrl: url }) : buildServiceSchema(
      {
        id: page.service.id,
        name: page.service.name,
        path: page.path,
        description: page.service.description,
      },
      { pageUrl: url }
    ),
    buildFaqPageSchema(url, page.faq.items),
    buildBreadcrumbSchema(
      page.hero.breadcrumbs.map((c) => ({ name: c.label, href: c.href }))
    ),
  ]);
}

export function getBlogPostSchema(slug: string) {
  const post = getPost(slug);
  if (!post) return null;

  const path = `/blog/${slug}`;
  const url = absoluteUrl(path);
  const faqItems: FaqItem[] = post.faqs ?? [];

  return buildPageSchemaGraph([
    buildWebPageSchema({
      path,
      name: `${post.title} | Editco Media`,
      description: post.excerpt,
    }),
    buildArticleSchema({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      category: post.category,
      readTime: post.readTime,
    }),
    buildFaqPageSchema(url, faqItems),
    buildBreadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "Blog", href: "/blog" },
      { name: post.title, href: path },
    ]),
  ]);
}
