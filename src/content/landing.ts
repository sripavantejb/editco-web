export const hero = {
  eyebrow: "Editco Media",
  badge: "EDITCO MEDIA — Growth Systems Agency",
  marquee: "Editco Media — Smart Websites · AI Automations · Growth Systems — ",
  headline: "We Build Websites & Automations That Turn Visitors Into Booked Calls.",
  subheadline:
    "Editco Media helps clinics, agencies, startups, and service businesses build premium websites, AI calling agents, CRM workflows, and WhatsApp automations that generate and convert leads.",
  primaryCta: "Book a Free Strategy Call",
  secondaryCta: "View Our Services",
  serviceTags: [
    "Websites",
    "AI Calling Agents",
    "CRM Workflows",
    "WhatsApp Automation",
    "SEO/AEO",
  ],
  trustLine:
    "Built for businesses that want more than just a website — they want results.",
} as const;

export const problem = {
  id: "problem" as const,
  heading:
    "Businesses Don’t Lose Customers Because of Bad Products. They Lose Them Because of Broken Systems.",
  points: [
    { label: "Missed customer calls", icon: "phoneMissed" },
    { label: "Poor website design", icon: "layoutTemplate" },
    { label: "No proper lead tracking", icon: "listChecks" },
    { label: "Manual follow-ups", icon: "hand" },
    { label: "Weak online presence", icon: "globe2" },
    { label: "No automation", icon: "zapOff" },
    { label: "Leads coming in, but not converting", icon: "trendingDown" },
    {
      label: "Customers asking the same questions again and again",
      icon: "messagesSquare",
    },
    { label: "No proper booking or CRM system", icon: "calendarX2" },
  ],
  strongLine:
    "Your business may already be getting attention. The real question is — are you capturing, tracking, and converting it properly?",
} as const;

export const solution = {
  id: "solution" as const,
  heading: "Editco Media Builds Complete Digital Growth Systems.",
  description:
    "We don’t just create websites or run ads. We design complete systems that help businesses attract leads, respond faster, automate work, and convert more customers.",
  cards: [
    {
      title: "Premium Websites",
      body: "Modern, fast, and conversion-focused websites that build trust and generate leads.",
    },
    {
      title: "AI Calling Agents",
      body: "AI voice agents that answer customer queries, handle calls, and reduce missed opportunities.",
    },
    {
      title: "Workflow Automations",
      body: "Automate repetitive tasks like lead capture, follow-ups, reminders, form submissions, and CRM updates.",
    },
    {
      title: "UI/UX Design",
      body: "Clean, premium, user-friendly interfaces that make your brand look professional.",
    },
    {
      title: "CRM & Lead Management",
      body: "Track every lead from first contact to conversion with proper pipeline systems.",
    },
    {
      title: "SEO & AEO",
      body: "Improve your visibility on Google and AI search platforms so customers can find you easily.",
    },
  ],
} as const;

export const services = {
  id: "services" as const,
  label: "SERVICES",
  heading: "Growth Systems for Leads & Revenue",
  subtitle:
    "We do not just design websites. We build complete systems that bring leads, follow up automatically, track sales, and help businesses grow.",
  comparison: {
    title: "Before Editco vs After Editco",
    before: {
      title: "Before Editco",
      items: [
        "No proper website",
        "Missed customer calls",
        "Leads lost in WhatsApp",
        "No follow-up system",
        "No clarity on revenue",
      ],
    },
    after: {
      title: "After Editco",
      items: [
        "Premium lead-generating website",
        "AI calling agent handles queries",
        "CRM tracks every lead",
        "Automated WhatsApp reminders",
        "Dashboard shows status and money",
      ],
    },
  },
  stickyPanel: {
    label: "WHAT WE BUILD",
    heading: "Systems That Turn Attention Into Booked Revenue",
    paragraph:
      "Every system is built to solve one business problem: convert more people from visitors into leads, from leads into conversations, and from conversations into paying customers.",
    cta: "Build My Growth System",
    proof: "Websites • AI Calling • CRM • WhatsApp • Automations",
  },
  cards: [
    {
      number: "01",
      title: "Turn Visitors Into Leads",
      systemName: "Lead Generation System",
      description:
        "Premium websites, landing pages, SEO/AEO pages, and booking flows that turn visitors into enquiries.",
      tags: ["Websites", "Landing Pages", "SEO/AEO", "Booking Pages"],
      outcome: "More visitors become qualified leads.",
      bgColor: "bg-[#c3a4f6]", // Lavender / Purple
    },
    {
      number: "02",
      title: "Never Miss Customer Calls",
      systemName: "AI Conversion System",
      description:
        "AI calling agents handle customer queries, reduce missed calls, qualify leads, and push interested people toward bookings.",
      tags: ["AI Calling", "Missed Calls", "Lead Qualification", "Human Handoff"],
      outcome: "Your business never misses important conversations.",
      bgColor: "bg-gaude-orange", // Orange
    },
    {
      number: "03",
      title: "Track Every Lead & Rupee",
      systemName: "Sales Tracking System",
      description:
        "CRM dashboards to track every lead, follow-up, client status, payment, and revenue movement from one place.",
      tags: ["CRM", "Lead Status", "Follow-ups", "Revenue Tracking"],
      outcome: "Every lead and rupee becomes visible.",
      bgColor: "bg-white", // Cream / White
    },
    {
      number: "04",
      title: "Automate Repetitive Work",
      systemName: "Automation System",
      description:
        "Automate repetitive workflows using WhatsApp, email, Google Sheets, n8n, APIs, and internal task systems.",
      tags: ["WhatsApp", "Email", "Google Sheets", "n8n", "APIs"],
      outcome: "Your team saves time and works faster.",
      bgColor: "bg-[#36df93]", // Light Green
    },
  ],
} as const;

export const industries = {
  id: "industries" as const,
  heading: "Built for Businesses That Want to Grow Smarter",
  items: [
    {
      title: "Clinics & Healthcare",
      body: "For appointments, missed calls, patient queries, Google visibility, and booking systems.",
    },
    {
      title: "Startups",
      body: "For landing pages, MVP websites, dashboards, UI/UX, and automation systems.",
    },
    {
      title: "Marketing Agencies",
      body: "For white-label websites, automations, AI agents, and client delivery support.",
    },
    {
      title: "Local Businesses",
      body: "For lead generation, WhatsApp automation, website presence, and customer follow-ups.",
    },
    {
      title: "Coaches & Consultants",
      body: "For personal brand websites, booking flows, lead magnets, and automated follow-ups.",
    },
    {
      title: "Educational Businesses",
      body: "For counselling flows, student onboarding, webinar systems, and CRM dashboards.",
    },
  ],
} as const;

export const whyEditco = {
  id: "why-editco" as const,
  heading: "Why Businesses Choose Editco Media",
  points: [
    {
      title: "We Think Beyond Design",
      body: "We don’t just make things look good. We focus on what happens after a visitor lands on your website.",
    },
    {
      title: "We Build Outcome-Based Systems",
      body: "Our focus is leads, bookings, automation, and conversions.",
    },
    {
      title: "We Move Fast",
      body: "We understand business speed. We build quickly, test fast, and improve continuously.",
    },
    {
      title: "We Understand Real Business Problems",
      body: "From missed calls to poor follow-ups, we build solutions for practical business issues.",
    },
    {
      title: "We Combine Tech + Design + Growth",
      body: "Websites, AI agents, automation, CRM, SEO, and UI/UX come together in one system.",
    },
  ],
} as const;

export const process = {
  id: "process" as const,
  heading: "How We Work",
  steps: [
    {
      title: "Understand Your Business",
      body: "We study your business, customers, current problems, and goals.",
    },
    {
      title: "Find Growth Gaps",
      body: "We identify where leads are being lost — website, calls, follow-ups, booking, or tracking.",
    },
    {
      title: "Design the System",
      body: "We create a clear solution plan with website, automation, AI agent, or CRM flow.",
    },
    {
      title: "Build & Launch",
      body: "We design, develop, test, and launch the complete system.",
    },
    {
      title: "Optimize for Results",
      body: "We improve the system based on user behavior, leads, and business outcomes.",
    },
  ],
} as const;

export const works = [
  {
    id: "dentin-oral-experts",
    title: "Dentin Oral Experts",
    location: "Hyderabad, India",
    category: "Website & Appointment Booking",
    video:
      "https://res.cloudinary.com/dxeoibunj/video/upload/v1779709298/Dentin_oral_experts_phone_appoin__202605251704_fbt0vj.mp4",
    url: "https://www.dentinoralexperts.com/",
    fullWidth: true,
  },
  {
    id: "saipreethi-clinic",
    title: "Sai Preethi Clinic",
    location: "Chennai, India",
    category: "Website & Clinic Branding",
    video:
      "https://res.cloudinary.com/dxeoibunj/video/upload/v1779636713/animate_this_professioally_intro_202605242101_nszjco.mp4",
    url: "https://www.saipreethiclinic.com/",
    fullWidth: false,
  },
  {
    id: "lumaswitch",
    title: "LumaSwitch",
    location: "Brooklyn, USA",
    category: "E-Commerce & Interactive Website",
    video:
      "https://res.cloudinary.com/dxeoibunj/video/upload/v1779620543/Website_scrolling_inside_laptop_202605241631_afmhpo.mp4",
    url: "https://lumaswitch.vercel.app/",
    fullWidth: false,
  },
  {
    id: "easymove",
    title: "EasyMove",
    location: "India",
    category: "Physiotherapy WebApp",
    video:
      "https://res.cloudinary.com/dxeoibunj/video/upload/v1779709935/Initial_Scene_-_2026-05-25_202605251721_zqebvs.mp4",
    url: "https://easymove-alpha.vercel.app/",
    fullWidth: true,
  },
  {
    id: "buildtrack",
    title: "BuildTrack",
    location: "India",
    category: "Construction SaaS & Project Management",
    video:
      "https://res.cloudinary.com/dxeoibunj/video/upload/v1782963744/SaaS_product_showcase_dashboard___202607020911_raawgm.mp4",
    url: "https://buildtrack.editcomedia.com/",
    fullWidth: true,
  },
] as const;

export const caseStudy = {
  id: "case-study" as const,
  heading: "Selected Works",
} as const;

export const comparison = {
  id: "comparison" as const,
  heading: "Not Just Another Marketing Agency",
  rows: [
    { agency: "Focuses only on design", editco: "Focuses on business outcomes" },
    { agency: "Builds static websites", editco: "Builds conversion systems" },
    { agency: "Manual lead handling", editco: "Automated lead workflows" },
    { agency: "No AI support", editco: "AI calling and smart automation" },
    { agency: "Basic online presence", editco: "Complete digital growth system" },
    { agency: "Delivers pages", editco: "Delivers lead journeys" },
  ],
} as const;

export const testimonials = {
  id: "testimonials" as const,
  heading: "What People Say About Working With Us",
  cards: [
    {
      quote:
        "Editco Media helped us understand where our digital system was weak and built a solution that made our business look more professional and easier to manage.",
      author: "Client Name",
      business: "Business Name",
    },
  ],
  fallback:
    "Trusted by growing businesses, founders, and teams looking to build smarter digital systems.",
} as const;

export const tech = {
  id: "tech" as const,
  heading: "Tools & Technologies We Work With",
  description:
    "We use modern tools to build fast, scalable, and automation-ready digital systems.",
  items: [
    "React",
    "Next.js",
    "Node.js",
    "MongoDB",
    "WordPress",
    "n8n",
    "OpenAI",
    "WhatsApp API",
    "CRM tools",
    "Figma",
    "Framer",
    "Google Analytics",
    "Meta Ads",
    "SEO tools",
  ],
} as const;

export const finalCta = {
  id: "cta" as const,
  heading: "Ready to Build a Smarter Growth System for Your Business?",
  description:
    "Whether you need a premium website, AI calling agent, CRM, automation, or a complete digital growth system — Editco Media can help you build it.",
  primaryCta: "Book a Free Strategy Call",
  secondary:
    "Let’s understand your business and show you where automation, design, and AI can improve your growth.",
} as const;

export const faq = {
  id: "faq" as const,
  heading: "FAQ",
  items: [
    {
      q: "Do you only build websites?",
      a: "No. We build websites, AI agents, automations, CRM flows, and complete business growth systems.",
    },
    {
      q: "Can you help with missed calls and customer enquiries?",
      a: "Yes. We can build AI calling agents and automation flows to handle enquiries, qualify leads, and update your CRM.",
    },
    {
      q: "Do you work with clinics?",
      a: "Yes. We help clinics with websites, appointment flows, AI call support, patient enquiry systems, SEO, and lead management.",
    },
    {
      q: "Can you build custom automations?",
      a: "Yes. We can automate lead capture, WhatsApp messages, email follow-ups, reminders, CRM updates, and internal workflows.",
    },
    {
      q: "How much does it cost?",
      a: "Pricing depends on your requirements. A simple premium website may start from a basic one-time cost, while automation and AI systems depend on complexity.",
    },
    {
      q: "How do we start?",
      a: "You can book a free strategy call. We will understand your business, identify gaps, and suggest the best solution.",
    },
  ],
} as const;

export const positioning = {
  id: "positioning" as const,
  statement:
    "Editco Media is not just a web design agency. It is a digital growth partner that builds websites, AI agents, automation systems, and lead conversion flows for businesses.",
} as const;

export const footer = {
  id: "contact" as const,
  quickLinks: [
    { label: "Services", href: "#services" },
    { label: "Industries", href: "#industries" },
    { label: "Selected Works", href: "#case-study" },
    { label: "The Crew", href: "#why-editco" },
    { label: "Process", href: "#process" },
    { label: "Contact", href: "#contact" },
  ],
  serviceLinks: [
    { label: "Website Design", href: "#services" },
    { label: "AI Calling Agents", href: "#services" },
    { label: "Workflow Automation", href: "#services" },
    { label: "CRM Systems", href: "#services" },
    { label: "UI/UX Design", href: "#services" },
    { label: "SEO & AEO", href: "#services" },
  ],
  closing: "Built with passion by Editco Media.",
} as const;
