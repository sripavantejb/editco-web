/** Central internal routes for consistent SEO internal linking. */
export const INTERNAL_PATHS = {
  home: "/",
  services: "/services",
  aiCallAgents: "/services/ai-call-agents",
  clinics: "/industries/clinics",
  contact: "/contact",
  blog: "/blog",
  smartWebsites: "/services#smart-websites",
  businessAutomation: "/services#business-automation",
  whatsappAutomation: "/services#whatsapp-automation",
  seoAeo: "/services#seo-aeo",
  websiteDesignHyderabad: "/website-design-agency-hyderabad",
  aiCallAgentClinics: "/ai-call-agent-for-clinics",
  clinicWebsiteDevelopment: "/clinic-website-development",
  whatsappAutomationAgency: "/whatsapp-automation-agency",
  aiAutomationHyderabad: "/ai-automation-agency-hyderabad",
} as const;

export type InternalPath = (typeof INTERNAL_PATHS)[keyof typeof INTERNAL_PATHS];

/** SEO-friendly anchor text (avoid generic “learn more” / “click here”). */
export const INTERNAL_ANCHORS = {
  services: "website development services",
  aiCallAgents: "AI call agents",
  clinics: "clinic growth system",
  contact: "contact Editco Media",
  smartWebsites: "smart website development",
  businessAutomation: "business automation",
  whatsappAutomation: "WhatsApp automation",
  seoAeo: "SEO and AEO services",
  allServices: "all Editco Media services",
  websiteDesignHyderabad: "website design agency in Hyderabad",
  aiCallAgentClinics: "AI call agent for clinics",
  clinicWebsiteHyderabad: "clinic website development in Hyderabad",
  whatsappAutomationAgency: "WhatsApp automation agency",
  aiAutomationHyderabad: "AI automation agency in Hyderabad",
} as const;

export function serviceHref(slug: string): string {
  if (slug === "ai-call-agents") return INTERNAL_PATHS.aiCallAgents;
  if (slug === "clinic-growth") return INTERNAL_PATHS.clinics;
  return `/services#${slug}`;
}

export function serviceLearnMoreLabel(slug: string): string {
  const labels: Record<string, string> = {
    "smart-websites": INTERNAL_ANCHORS.smartWebsites,
    "ai-call-agents": INTERNAL_ANCHORS.aiCallAgents,
    "business-automation": INTERNAL_ANCHORS.businessAutomation,
    "whatsapp-automation": INTERNAL_ANCHORS.whatsappAutomation,
    "seo-aeo": INTERNAL_ANCHORS.seoAeo,
    "clinic-growth": INTERNAL_ANCHORS.clinics,
  };
  return labels[slug] ?? INTERNAL_ANCHORS.services;
}

/** Blog category → related service pages (blog-ready internal linking). */
export const BLOG_CATEGORY_SERVICE_LINKS: Record<
  string,
  readonly { href: string; label: string }[]
> = {
  "AI Agents": [
    { href: INTERNAL_PATHS.aiCallAgents, label: INTERNAL_ANCHORS.aiCallAgents },
    {
      href: INTERNAL_PATHS.businessAutomation,
      label: INTERNAL_ANCHORS.businessAutomation,
    },
  ],
  Automation: [
    {
      href: INTERNAL_PATHS.businessAutomation,
      label: INTERNAL_ANCHORS.businessAutomation,
    },
    {
      href: INTERNAL_PATHS.whatsappAutomation,
      label: INTERNAL_ANCHORS.whatsappAutomation,
    },
  ],
  Websites: [
    {
      href: INTERNAL_PATHS.smartWebsites,
      label: INTERNAL_ANCHORS.smartWebsites,
    },
    { href: INTERNAL_PATHS.services, label: INTERNAL_ANCHORS.services },
  ],
  RAG: [
    {
      href: INTERNAL_PATHS.businessAutomation,
      label: INTERNAL_ANCHORS.businessAutomation,
    },
    { href: INTERNAL_PATHS.aiCallAgents, label: INTERNAL_ANCHORS.aiCallAgents },
  ],
  SaaS: [
    {
      href: INTERNAL_PATHS.businessAutomation,
      label: INTERNAL_ANCHORS.businessAutomation,
    },
    {
      href: INTERNAL_PATHS.smartWebsites,
      label: INTERNAL_ANCHORS.smartWebsites,
    },
  ],
  Content: [
    { href: INTERNAL_PATHS.seoAeo, label: INTERNAL_ANCHORS.seoAeo },
    { href: INTERNAL_PATHS.services, label: INTERNAL_ANCHORS.services },
  ],
  Branding: [
    {
      href: INTERNAL_PATHS.smartWebsites,
      label: INTERNAL_ANCHORS.smartWebsites,
    },
    { href: INTERNAL_PATHS.services, label: INTERNAL_ANCHORS.services },
  ],
  "SEO/AEO": [
    { href: INTERNAL_PATHS.seoAeo, label: INTERNAL_ANCHORS.seoAeo },
    { href: INTERNAL_PATHS.clinics, label: INTERNAL_ANCHORS.clinics },
  ],
  Clinics: [
    { href: INTERNAL_PATHS.clinics, label: INTERNAL_ANCHORS.clinics },
    { href: INTERNAL_PATHS.aiCallAgents, label: INTERNAL_ANCHORS.aiCallAgents },
  ],
  WhatsApp: [
    { href: INTERNAL_PATHS.whatsappAutomation, label: INTERNAL_ANCHORS.whatsappAutomation },
    { href: INTERNAL_PATHS.businessAutomation, label: INTERNAL_ANCHORS.businessAutomation },
  ],
};

export const BLOG_DEFAULT_SERVICE_LINKS: readonly { href: string; label: string }[] =
  [
    { href: INTERNAL_PATHS.services, label: INTERNAL_ANCHORS.allServices },
    { href: INTERNAL_PATHS.aiCallAgents, label: INTERNAL_ANCHORS.aiCallAgents },
    {
      href: INTERNAL_PATHS.whatsappAutomation,
      label: INTERNAL_ANCHORS.whatsappAutomation,
    },
  ];

export function getBlogServiceLinks(category: string) {
  return BLOG_CATEGORY_SERVICE_LINKS[category] ?? BLOG_DEFAULT_SERVICE_LINKS;
}
