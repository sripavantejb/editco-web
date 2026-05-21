import {
  BUSINESS,
  EDITCO_SERVICES,
  SCHEMA_IDS,
  absoluteUrl,
  serviceId,
  type ServiceDefinition,
} from "./constants";
import type { ArticleInput, BreadcrumbItem, FaqItem } from "./types";

type JsonLdObject = Record<string, unknown>;

export function buildOrganizationSchema(): JsonLdObject {
  return {
    "@type": "Organization",
    "@id": SCHEMA_IDS.organization,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    url: BUSINESS.url,
    logo: BUSINESS.logo,
    image: BUSINESS.image,
    description: BUSINESS.description,
    email: BUSINESS.email,
    telephone: BUSINESS.telephone,
    sameAs: [...BUSINESS.sameAs],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: BUSINESS.telephone,
      email: BUSINESS.email,
      contactType: BUSINESS.contactType,
      areaServed: BUSINESS.areaServed,
      availableLanguage: [...BUSINESS.availableLanguage],
    },
  };
}

export function buildLocalBusinessSchema(): JsonLdObject {
  return {
    "@type": "ProfessionalService",
    "@id": SCHEMA_IDS.localBusiness,
    name: BUSINESS.name,
    description: BUSINESS.description,
    url: BUSINESS.url,
    image: BUSINESS.image,
    logo: BUSINESS.logo,
    email: BUSINESS.email,
    telephone: BUSINESS.telephone,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      ...BUSINESS.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.geo.latitude,
      longitude: BUSINESS.geo.longitude,
    },
    areaServed: BUSINESS.areaServed,
    sameAs: [...BUSINESS.sameAs],
    parentOrganization: { "@id": SCHEMA_IDS.organization },
    knowsAbout: EDITCO_SERVICES.map((s) => s.name),
  };
}

export function buildWebSiteSchema(): JsonLdObject {
  return {
    "@type": "WebSite",
    "@id": SCHEMA_IDS.website,
    name: BUSINESS.name,
    url: BUSINESS.url,
    description: BUSINESS.description,
    inLanguage: "en-IN",
    publisher: { "@id": SCHEMA_IDS.organization },
  };
}

/** Root layout: Organization + LocalBusiness + WebSite in one graph. */
export function buildGlobalSchemaGraph(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationSchema(),
      buildLocalBusinessSchema(),
      buildWebSiteSchema(),
    ],
  };
}

export function buildServiceSchema(
  service: ServiceDefinition,
  options?: { pageUrl?: string }
): JsonLdObject {
  const url = options?.pageUrl ?? absoluteUrl(service.path);
  return {
    "@type": "Service",
    "@id": serviceId(service.path),
    name: service.name,
    description: service.description,
    url,
    serviceType: service.name,
    provider: { "@id": SCHEMA_IDS.localBusiness },
    areaServed: BUSINESS.areaServed,
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: url,
      availableLanguage: "en",
    },
  };
}

export function buildServicesItemListSchema(): JsonLdObject {
  return {
    "@type": "ItemList",
    name: "Editco Media Services",
    description:
      "Website development, AI call agents, business automation, WhatsApp automation, SEO/AEO optimization, and clinic growth systems.",
    numberOfItems: EDITCO_SERVICES.length,
    itemListElement: EDITCO_SERVICES.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: buildServiceSchema(service),
    })),
  };
}

export function buildFaqPageSchema(
  pageUrl: string,
  items: readonly FaqItem[]
): JsonLdObject | null {
  if (items.length === 0) return null;

  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function buildBreadcrumbSchema(
  items: readonly (BreadcrumbItem | { label: string; href: string })[]
): JsonLdObject | null {
  if (items.length === 0) return null;

  const pageUrl = absoluteUrl(items[items.length - 1]?.href ?? "/");

  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: "name" in item ? item.name : item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

export function buildArticleSchema(article: ArticleInput): JsonLdObject {
  const url = absoluteUrl(`/blog/${article.slug}`);
  return {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.excerpt,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: article.date,
    dateModified: article.date,
    author: { "@id": SCHEMA_IDS.organization },
    publisher: {
      "@id": SCHEMA_IDS.organization,
    },
    image: BUSINESS.image,
    articleSection: article.category,
    inLanguage: "en-IN",
    isPartOf: { "@id": SCHEMA_IDS.website },
  };
}

export function buildWebPageSchema(options: {
  path: string;
  name: string;
  description: string;
}): JsonLdObject {
  const url = absoluteUrl(options.path);
  return {
    "@type": "WebPage",
    "@id": url,
    url,
    name: options.name,
    description: options.description,
    isPartOf: { "@id": SCHEMA_IDS.website },
    about: { "@id": SCHEMA_IDS.localBusiness },
    inLanguage: "en-IN",
  };
}

/** Merge page-specific nodes into a single JSON-LD graph (no duplicate globals). */
export function buildPageSchemaGraph(
  nodes: Array<JsonLdObject | null | undefined>
): JsonLdObject {
  const graph = nodes.filter((node): node is JsonLdObject => Boolean(node));
  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

