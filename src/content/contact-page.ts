import { INTERNAL_ANCHORS, INTERNAL_PATHS } from "@/content/internal-links";

export const contactPage = {
  hero: {
    eyebrow: "CONTACT EDITCO MEDIA",
    h1: "Let's Build Your Business Growth System",
    description:
      "Book a free growth audit and discover how websites, AI call agents, WhatsApp automation, and SEO/AEO can help your business capture more leads.",
  },
  form: {
    heading: "Tell us about your business",
    subheading:
      "Share a few details and we will respond on WhatsApp or email — usually within one business day.",
    submitLabel: "Book Free Growth Audit",
    serviceOptions: [
      { value: "", label: "Select a service" },
      { value: "smart-websites", label: "Smart websites" },
      { value: "ai-call-agents", label: "AI call agents" },
      { value: "whatsapp-automation", label: "WhatsApp automation" },
      { value: "business-automation", label: "Business automation" },
      { value: "seo-aeo", label: "SEO and AEO services" },
      { value: "clinic-growth", label: "Clinic growth system" },
      { value: "multiple", label: "Multiple services / full growth system" },
      { value: "not-sure", label: "Not sure yet — need guidance" },
    ],
  },
  trust: {
    heading: "What we help you build",
    items: [
      {
        title: "Smart websites",
        description:
          "Fast, mobile-friendly sites that explain your offer clearly and turn visitors into enquiries.",
        href: INTERNAL_PATHS.smartWebsites,
        linkLabel: INTERNAL_ANCHORS.smartWebsites,
      },
      {
        title: "AI automation",
        description:
          "AI call agents and workflows that answer faster, qualify leads, and reduce manual work.",
        href: INTERNAL_PATHS.aiCallAgents,
        linkLabel: INTERNAL_ANCHORS.aiCallAgents,
      },
      {
        title: "Lead generation",
        description:
          "Capture calls, forms, and WhatsApp messages in one flow so fewer leads slip away.",
        href: INTERNAL_PATHS.whatsappAutomation,
        linkLabel: INTERNAL_ANCHORS.whatsappAutomation,
      },
      {
        title: "Growth workflows",
        description:
          "Connected systems for follow-ups, booking, CRM updates, and visibility on Google and AI search.",
        href: INTERNAL_PATHS.services,
        linkLabel: INTERNAL_ANCHORS.allServices,
      },
    ],
  },
  serviceLinks: {
    heading: "Explore our services",
    links: [
      { href: INTERNAL_PATHS.services, label: INTERNAL_ANCHORS.services },
      { href: INTERNAL_PATHS.aiCallAgents, label: INTERNAL_ANCHORS.aiCallAgents },
      { href: INTERNAL_PATHS.clinics, label: INTERNAL_ANCHORS.clinics },
      { href: INTERNAL_PATHS.whatsappAutomation, label: INTERNAL_ANCHORS.whatsappAutomation },
      { href: INTERNAL_PATHS.seoAeo, label: INTERNAL_ANCHORS.seoAeo },
    ],
  },
  cal: {
    id: "book-audit",
    heading: "Or pick a time on the calendar",
    description:
      "Prefer to book instantly? Choose a slot for your free growth audit — we will confirm by email and WhatsApp.",
  },
} as const;
