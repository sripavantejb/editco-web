import { INTERNAL_ANCHORS, INTERNAL_PATHS } from "@/content/internal-links";
import type { BlogPostMeta } from "./types";

/** SEO blog topics — listing + detail routes at /blog/[slug] */
export const blogPostCatalog: readonly BlogPostMeta[] = [
  {
    slug: "ai-call-agents-help-clinics-reduce-missed-calls",
    title: "How AI Call Agents Help Clinics Reduce Missed Calls",
    excerpt:
      "Missed calls cost clinics real revenue. See how an AI call agent for clinics answers every patient call, automates booking, and supports your team — day and night.",
    metaTitle:
      "How AI Call Agents Help Clinics Reduce Missed Calls | Editco Media",
    metaDescription:
      "Learn how an AI call agent for clinics reduces missed calls with clinic missed call automation, AI receptionist support, appointment booking automation, and WhatsApp follow-up.",
    category: "Clinics",
    accent: "#fca5cc",
    date: "2026-05-01",
    readTime: "8 min",
    featured: true,
    primaryServiceHref: INTERNAL_PATHS.aiCallAgents,
    relatedServiceLinks: [
      { href: INTERNAL_PATHS.aiCallAgents, label: INTERNAL_ANCHORS.aiCallAgents },
      { href: INTERNAL_PATHS.clinics, label: INTERNAL_ANCHORS.clinics },
    ],
  },
  {
    slug: "why-every-clinic-needs-online-appointment-booking",
    title: "Why Every Clinic Needs Online Appointment Booking",
    excerpt:
      "Patients expect to book online. Without appointment booking on your clinic website, you force extra phone calls and lose enquiries to competitors.",
    metaDescription:
      "Why clinics need online appointment booking on their website — fewer phone tag loops, more booked visits, and better patient experience.",
    category: "Clinics",
    accent: "#fca5cc",
    date: "2026-05-08",
    readTime: "5 min",
    primaryServiceHref: INTERNAL_PATHS.clinics,
    relatedServiceLinks: [
      { href: INTERNAL_PATHS.clinics, label: INTERNAL_ANCHORS.clinics },
      { href: INTERNAL_PATHS.smartWebsites, label: INTERNAL_ANCHORS.smartWebsites },
    ],
  },
  {
    slug: "website-vs-google-business-profile-leads",
    title: "Website vs Google Business Profile: What Actually Gets More Leads?",
    excerpt:
      "Your Google Business Profile helps people find you. Your website converts them. Here is how clinics and local businesses should use both.",
    metaDescription:
      "Website vs Google Business Profile for lead generation — what each channel does best and how to connect them for more enquiries.",
    category: "Websites",
    accent: "#c3a4f6",
    date: "2026-05-15",
    readTime: "5 min",
    primaryServiceHref: INTERNAL_PATHS.smartWebsites,
    relatedServiceLinks: [
      { href: INTERNAL_PATHS.smartWebsites, label: INTERNAL_ANCHORS.smartWebsites },
      { href: INTERNAL_PATHS.seoAeo, label: INTERNAL_ANCHORS.seoAeo },
    ],
  },
  {
    slug: "how-whatsapp-automation-converts-missed-leads",
    title: "How WhatsApp Automation Converts Missed Leads",
    excerpt:
      "Most Indian patients and customers prefer WhatsApp. Automated follow-ups turn cold enquiries into booked calls without manual typing.",
    metaDescription:
      "How WhatsApp automation converts missed leads with instant replies, reminders, and nurture flows for clinics and local businesses.",
    category: "WhatsApp",
    accent: "#2fdf92",
    date: "2026-05-22",
    readTime: "5 min",
    primaryServiceHref: INTERNAL_PATHS.whatsappAutomation,
    relatedServiceLinks: [
      { href: INTERNAL_PATHS.whatsappAutomation, label: INTERNAL_ANCHORS.whatsappAutomation },
      { href: INTERNAL_PATHS.businessAutomation, label: INTERNAL_ANCHORS.businessAutomation },
    ],
  },
  {
    slug: "seo-vs-aeo-vs-geo-what-businesses-need",
    title: "SEO vs AEO vs GEO: What Businesses Need to Know",
    excerpt:
      "SEO ranks you on Google. AEO helps AI tools recommend you. GEO is the next layer of visibility. Here is what growing businesses should prioritize.",
    metaDescription:
      "SEO vs AEO vs GEO explained for business owners — what to invest in for Google search, AI answers, and generative engine visibility.",
    category: "SEO/AEO",
    accent: "#ff4e00",
    date: "2026-05-29",
    readTime: "6 min",
    primaryServiceHref: INTERNAL_PATHS.seoAeo,
    relatedServiceLinks: [
      { href: INTERNAL_PATHS.seoAeo, label: INTERNAL_ANCHORS.seoAeo },
      { href: INTERNAL_PATHS.services, label: INTERNAL_ANCHORS.services },
    ],
  },
  {
    slug: "best-website-features-clinics-hospitals",
    title: "Best Website Features for Clinics and Hospitals",
    excerpt:
      "Trust, clarity, and easy booking matter more than fancy animations. These website features help clinics convert visitors into appointments.",
    metaDescription:
      "Best website features for clinics and hospitals — service pages, online booking, doctor profiles, WhatsApp, and local SEO foundations.",
    category: "Clinics",
    accent: "#fca5cc",
    date: "2026-06-05",
    readTime: "5 min",
    primaryServiceHref: INTERNAL_PATHS.clinics,
    relatedServiceLinks: [
      { href: INTERNAL_PATHS.clinics, label: INTERNAL_ANCHORS.clinics },
      { href: INTERNAL_PATHS.smartWebsites, label: INTERNAL_ANCHORS.smartWebsites },
    ],
  },
  {
    slug: "how-ai-automation-saves-time-small-businesses",
    title: "How AI Automation Saves Time for Small Businesses",
    excerpt:
      "Small teams lose hours on repetitive follow-ups, data entry, and missed calls. AI automation connects your tools so work runs without constant manual effort.",
    metaDescription:
      "How AI automation saves time for small businesses — call agents, WhatsApp flows, CRM updates, and workflow automation explained simply.",
    category: "Automation",
    accent: "#2fdf92",
    date: "2026-06-12",
    readTime: "5 min",
    primaryServiceHref: INTERNAL_PATHS.businessAutomation,
    relatedServiceLinks: [
      { href: INTERNAL_PATHS.businessAutomation, label: INTERNAL_ANCHORS.businessAutomation },
      { href: INTERNAL_PATHS.aiCallAgents, label: INTERNAL_ANCHORS.aiCallAgents },
    ],
  },
] as const;

export const featuredPost =
  blogPostCatalog.find((p) => p.featured) ?? blogPostCatalog[0];
