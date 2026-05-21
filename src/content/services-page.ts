import {
  INTERNAL_ANCHORS,
  INTERNAL_PATHS,
  serviceLearnMoreLabel,
} from "@/content/internal-links";
import { richText } from "@/lib/rich-content";

export const servicesPage = {
  hero: {
    eyebrow: "OUR SERVICES",
    h1: "AI-Powered Services to Automate and Grow Your Business",
    descriptionRich: richText(
      { type: "text", value: "Editco Media helps clinics, agencies, and local businesses with " },
      { type: "link", href: INTERNAL_PATHS.smartWebsites, label: INTERNAL_ANCHORS.smartWebsites },
      { type: "text", value: ", " },
      { type: "link", href: INTERNAL_PATHS.aiCallAgents, label: INTERNAL_ANCHORS.aiCallAgents },
      { type: "text", value: ", " },
      { type: "link", href: INTERNAL_PATHS.whatsappAutomation, label: INTERNAL_ANCHORS.whatsappAutomation },
      { type: "text", value: ", " },
      { type: "link", href: INTERNAL_PATHS.businessAutomation, label: INTERNAL_ANCHORS.businessAutomation },
      { type: "text", value: ", " },
      { type: "link", href: INTERNAL_PATHS.seoAeo, label: INTERNAL_ANCHORS.seoAeo },
      { type: "text", value: ", and our " },
      { type: "link", href: INTERNAL_PATHS.clinics, label: INTERNAL_ANCHORS.clinics },
      { type: "text", value: "." }
    ),
    primaryCta: "Book a Free Growth Audit",
    secondaryCta: "Back to Home",
    secondaryHref: "/",
  },
  services: [
    {
      id: "smart-websites",
      title: "Smart Website Development",
      icon: "globe",
      accent: "orange" as const,
      whatItIs:
        "Conversion-focused websites built by our website development team — fast, mobile-friendly, and structured to explain your services clearly and capture enquiries.",
      whyNeedIt:
        "Most businesses lose leads because their website looks outdated, loads slowly, or does not guide visitors to book a call or send a message.",
      benefits: [
        "Professional brand presence that builds trust instantly",
        "Clear service pages and strong calls-to-action",
        "Mobile-first layouts for local and global audiences",
        "SEO-ready structure for better Google visibility",
        "Integrated WhatsApp, forms, and booking flows",
      ],
      cta: "Build My Website",
      learnMoreLabel: serviceLearnMoreLabel("smart-websites"),
      sectionHref: INTERNAL_PATHS.smartWebsites,
    },
    {
      id: "ai-call-agents",
      title: "AI Call Agents",
      detailHref: INTERNAL_PATHS.aiCallAgents,
      icon: "phone",
      accent: "purple" as const,
      whatItIs:
        "AI voice agents that answer calls 24/7, handle common questions, qualify leads, and share summaries with your team — so missed calls stop costing you revenue.",
      whyNeedIt:
        "When enquiries come in after hours or during busy periods, unanswered calls often go straight to competitors.",
      benefits: [
        "Instant response to inbound calls and enquiries",
        "Lead qualification and appointment information",
        "Multi-language support where required",
        "Call summaries logged for your team",
        "Human handoff when a conversation needs a person",
      ],
      cta: "Automate My Calls",
      learnMoreLabel: serviceLearnMoreLabel("ai-call-agents"),
    },
    {
      id: "business-automation",
      title: "Business Automation",
      icon: "workflow",
      accent: "green" as const,
      whatItIs:
        "Custom business automation that connects your tools — forms, CRM, sheets, email, and internal workflows — so repetitive tasks run reliably without manual effort.",
      whyNeedIt:
        "Teams waste hours on data entry, follow-up reminders, and copying information between apps instead of closing sales.",
      benefits: [
        "Automated lead capture and CRM updates",
        "Reminder and notification workflows",
        "Reduced manual errors and duplicate work",
        "Faster operations across sales and support",
        "Scalable systems as enquiry volume grows",
      ],
      cta: "Automate My Business",
      learnMoreLabel: serviceLearnMoreLabel("business-automation"),
      sectionHref: INTERNAL_PATHS.businessAutomation,
    },
    {
      id: "whatsapp-automation",
      title: "WhatsApp Automation",
      icon: "message",
      accent: "pink" as const,
      whatItIs:
        "WhatsApp automation for welcome messages, follow-ups, appointment reminders, and nurture sequences — keeping leads warm without constant manual typing.",
      whyNeedIt:
        "In India especially, customers expect fast WhatsApp replies. Delayed responses mean lost trust and lost deals.",
      benefits: [
        "Instant replies to new leads and enquiries",
        "Scheduled reminders for appointments and demos",
        "Structured follow-up journeys by lead stage",
        "Broadcast and personalized message flows",
        "Better attendance and conversion from WhatsApp leads",
      ],
      cta: "Automate WhatsApp",
      learnMoreLabel: serviceLearnMoreLabel("whatsapp-automation"),
      sectionHref: INTERNAL_PATHS.whatsappAutomation,
    },
    {
      id: "seo-aeo",
      title: "SEO + AEO Optimization",
      icon: "search",
      accent: "orange" as const,
      whatItIs:
        "SEO and AEO (Answer Engine Optimization) services to improve rankings on Google, local search, and AI answer platforms when customers ask for recommendations.",
      whyNeedIt:
        "If your business is hard to find online, you depend only on referrals and ads — while competitors capture organic demand.",
      benefits: [
        "Stronger Google and Google Maps visibility",
        "Service and location pages targeting real searches",
        "FAQ and content structured for AI tools",
        "Technical SEO foundations on every page",
        "Long-term organic lead flow alongside paid channels",
      ],
      cta: "Improve My Visibility",
      learnMoreLabel: serviceLearnMoreLabel("seo-aeo"),
      sectionHref: INTERNAL_PATHS.seoAeo,
    },
    {
      id: "clinic-growth",
      title: "Clinic Growth Systems",
      detailHref: INTERNAL_PATHS.clinics,
      icon: "clinic",
      accent: "purple" as const,
      whatItIs:
        "End-to-end clinic growth systems combining websites, AI call agents, appointment flows, WhatsApp automation, and patient lead tracking for healthcare brands.",
      whyNeedIt:
        "Clinics juggle patient calls, appointment requests, follow-ups, and visibility — often across phone, WhatsApp, and staff with no unified system.",
      benefits: [
        "Trust-building clinic websites with clear services",
        "AI support for appointment and enquiry calls",
        "Automated reminders and patient communication",
        "Lead and enquiry tracking in one place",
        "Local SEO so nearby patients can find you",
      ],
      cta: "Grow My Clinic",
      learnMoreLabel: serviceLearnMoreLabel("clinic-growth"),
    },
  ],
  introRich: richText(
    { type: "text", value: "Explore each service below — from " },
    { type: "link", href: INTERNAL_PATHS.aiCallAgents, label: INTERNAL_ANCHORS.aiCallAgents },
    { type: "text", value: " to " },
    { type: "link", href: INTERNAL_PATHS.clinics, label: INTERNAL_ANCHORS.clinics },
    { type: "text", value: " — and book a growth audit when you are ready." }
  ),
  comparison: {
    eyebrow: "THE DIFFERENCE",
    heading: "Business With Automation vs Without Automation",
    description:
      "See how connected websites, AI call agents, and automations change lead capture, speed, and revenue visibility.",
    withoutLabel: "Without Automation",
    withLabel: "With Editco Automation",
    rows: [
      {
        aspect: "Lead capture",
        without: "Leads slip through missed calls, slow forms, and scattered chats",
        with: "Every enquiry is captured from web, phone, and WhatsApp into one flow",
      },
      {
        aspect: "Response speed",
        without: "Customers wait hours or days for a reply",
        with: "AI agents and automations respond in seconds, 24/7",
      },
      {
        aspect: "Follow-ups",
        without: "Manual reminders get forgotten when teams are busy",
        with: "Automated WhatsApp and email follow-ups run on schedule",
      },
      {
        aspect: "Appointment booking",
        without: "Back-and-forth messages and phone tag to confirm slots",
        with: "Clear booking flows, confirmations, and reminders built in",
      },
      {
        aspect: "Customer experience",
        without: "Inconsistent answers and repeated questions frustrate buyers",
        with: "Consistent, professional responses across every channel",
      },
      {
        aspect: "Revenue tracking",
        without: "No clear view of lead status, conversions, or pipeline value",
        with: "CRM-style tracking shows every lead, stage, and outcome",
      },
    ],
  },
  faq: {
    id: "services-faq",
    eyebrow: "FAQ",
    heading: "Services — Common Questions",
    description:
      "Quick answers about what Editco Media offers and how our website, AI, and automation services work together.",
    items: [
      {
        q: "What services does Editco Media offer?",
        a: "We offer smart website development, AI call agents, business automation, WhatsApp automation, SEO and AEO optimization, and clinic growth systems — built to work as one connected growth stack.",
      },
      {
        q: "Who are your services best for?",
        a: "Growing businesses that receive calls, WhatsApp messages, or form enquiries but struggle with follow-up, booking, or online visibility — especially clinics, agencies, consultants, and local brands.",
      },
      {
        q: "Do you build only websites or full growth systems?",
        a: "We can launch a website alone, but most clients choose a full system: site plus AI call support, automations, and tracking so every lead is captured and nurtured.",
      },
      {
        q: "How do AI call agents fit into your services?",
        aRich: richText(
          { type: "text", value: "Our " },
          { type: "link", href: INTERNAL_PATHS.aiCallAgents, label: INTERNAL_ANCHORS.aiCallAgents },
          { type: "text", value: " answer calls 24/7, qualify leads, and book appointments — then sync summaries to WhatsApp or your CRM so your team picks up warm enquiries." }
        ),
      },
      {
        q: "Can you help clinics and local businesses?",
        aRich: richText(
          { type: "text", value: "Yes. We build " },
          { type: "link", href: INTERNAL_PATHS.clinics, label: INTERNAL_ANCHORS.clinics },
          { type: "text", value: " for healthcare teams and " },
          { type: "link", href: INTERNAL_PATHS.smartWebsites, label: INTERNAL_ANCHORS.smartWebsites },
          { type: "text", value: " for local brands that need more enquiries from Google and phone." }
        ),
      },
      {
        q: "How do I book a free growth audit?",
        a: "Scroll to the booking section on this page or contact us. We will review your current setup and suggest the right mix of website, automation, and visibility services.",
      },
    ],
  },
  finalCta: {
    eyebrow: "GET STARTED",
    heading: "Start Your Business Transformation with Editco Media",
    description:
      "Book a free growth audit. We will map the right mix of websites, AI call agents, WhatsApp automation, and SEO/AEO for your business.",
    cta: "Book a Free Growth Audit",
  },
} as const;
