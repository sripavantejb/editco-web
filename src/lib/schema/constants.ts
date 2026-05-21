import { SEO_DEFAULTS, SITE_URL } from "@/lib/seo";
import { site } from "@/content/site";

/** Stable @id URLs for cross-referencing entities in @graph. */
export const SCHEMA_IDS = {
  organization: `${SITE_URL}/#organization`,
  localBusiness: `${SITE_URL}/#localbusiness`,
  website: `${SITE_URL}/#website`,
} as const;

export const BUSINESS = {
  name: "Editco Media",
  legalName: "Editco Media",
  description:
    "Editco Media is an AI automation and website development agency in Hyderabad, India. We build smart websites, AI call agents, business automation, WhatsApp automation, SEO/AEO optimization, and clinic growth systems.",
  url: SITE_URL,
  logo: SEO_DEFAULTS.favicon,
  image: SEO_DEFAULTS.favicon,
  email: site.email,
  telephone: site.phone,
  telephoneE164: "+918919926373",
  address: {
    streetAddress: "Hyderabad",
    addressLocality: "Hyderabad",
    addressRegion: "Telangana",
    postalCode: "500001",
    addressCountry: "IN",
  },
  geo: {
    latitude: 17.385,
    longitude: 78.4867,
  },
  areaServed: [
    { "@type": "City" as const, name: "Hyderabad" },
    { "@type": "Country" as const, name: "India" },
  ],
  sameAs: [site.linkedin, site.instagram],
  contactType: "customer service",
  availableLanguage: ["English", "Hindi"],
} as const;

export type ServiceDefinition = {
  id: string;
  name: string;
  path: string;
  description: string;
};

/** Canonical service list — aligned with visible site services. */
export const EDITCO_SERVICES: ServiceDefinition[] = [
  {
    id: "website-development",
    name: "Website Development",
    path: "/services#smart-websites",
    description:
      "Conversion-focused website development — fast, mobile-friendly sites built to explain services clearly and capture enquiries.",
  },
  {
    id: "ai-call-agents",
    name: "AI Call Agents",
    path: "/services/ai-call-agents",
    description:
      "AI call agents that answer calls 24/7, qualify leads, book appointments, and send summaries to your team.",
  },
  {
    id: "business-automation",
    name: "Business Automation",
    path: "/services#business-automation",
    description:
      "Custom business automation connecting forms, CRM, sheets, email, and internal workflows.",
  },
  {
    id: "whatsapp-automation",
    name: "WhatsApp Automation",
    path: "/services#whatsapp-automation",
    description:
      "WhatsApp automation for welcome messages, follow-ups, appointment reminders, and nurture sequences.",
  },
  {
    id: "seo-aeo",
    name: "SEO and AEO Optimization",
    path: "/services#seo-aeo",
    description:
      "SEO and AEO services to improve Google, local search, and AI answer platform visibility.",
  },
  {
    id: "clinic-growth-systems",
    name: "Clinic Growth Systems",
    path: "/industries/clinics",
    description:
      "End-to-end clinic growth systems with websites, AI call agents, appointment booking, WhatsApp, and patient lead tracking.",
  },
  {
    id: "website-design-hyderabad",
    name: "Website Design Agency Hyderabad",
    path: "/website-design-agency-hyderabad",
    description:
      "Website design and development in Hyderabad — conversion-focused, mobile-first, SEO-ready sites for local businesses.",
  },
  {
    id: "ai-call-agent-clinics",
    name: "AI Call Agent for Clinics",
    path: "/ai-call-agent-for-clinics",
    description:
      "AI call agents for clinics — 24/7 patient enquiry handling, appointment capture, and staff summaries.",
  },
  {
    id: "clinic-website-hyderabad",
    name: "Clinic Website Development Hyderabad",
    path: "/clinic-website-development",
    description:
      "Clinic website development in Hyderabad with doctor pages, trust signals, appointment CTAs, and local SEO.",
  },
  {
    id: "whatsapp-automation-agency",
    name: "WhatsApp Automation Agency",
    path: "/whatsapp-automation-agency",
    description:
      "WhatsApp automation agency for lead welcome flows, reminders, nurture sequences, and CRM integration.",
  },
  {
    id: "ai-automation-hyderabad",
    name: "AI Automation Agency Hyderabad",
    path: "/ai-automation-agency-hyderabad",
    description:
      "AI automation agency in Hyderabad — websites, AI call agents, WhatsApp flows, CRM, and SEO/AEO growth systems.",
  },
];

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, SITE_URL).toString();
}

export function serviceId(path: string): string {
  return `${absoluteUrl(path)}#service`;
}

export function getServiceByPath(path: string): ServiceDefinition | undefined {
  return EDITCO_SERVICES.find((s) => s.path === path);
}
