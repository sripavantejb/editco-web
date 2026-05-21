import { INTERNAL_PATHS } from "@/content/internal-links";

export type SeoLandingBreadcrumb = {
  label: string;
  href: string;
};

export type SeoLandingPageContent = {
  path: string;
  /** Primary SEO keyword phrase for this landing page */
  keyword: string;
  accent: "orange" | "purple" | "green";
  meta: {
    titleAbsolute: string;
    description: string;
  };
  service: {
    id: string;
    name: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    h1: string;
    description: string;
    breadcrumbs: readonly SeoLandingBreadcrumb[];
    primaryCta: string;
    secondaryCta: string;
    secondaryHref: string;
  };
  problem: {
    heading: string;
    description: string;
    points: readonly string[];
  };
  benefits: {
    heading: string;
    description: string;
    items: readonly { title: string; body: string }[];
  };
  deliverables: {
    heading: string;
    items: readonly string[];
  };
  faq: {
    eyebrow: string;
    heading: string;
    items: readonly { q: string; a: string }[];
  };
  finalCta: {
    heading: string;
    description: string;
    primaryCta: string;
  };
};

export const websiteDesignHyderabad = {
  path: INTERNAL_PATHS.websiteDesignHyderabad,
  keyword: "website design agency Hyderabad",
  accent: "orange",
  meta: {
    titleAbsolute: "Website Design Agency Hyderabad | Fast, Conversion‑Focused Sites | Editco Media",
    description:
      "Editco Media is a website design agency in Hyderabad helping local businesses launch fast, mobile‑first sites built for enquiries, WhatsApp taps, maps, and clear calls‑to‑action — not vague “pretty” pages.",
  },
  service: {
    id: "website-design-agency-hyderabad",
    name: "Website design agency — Hyderabad",
    description:
      "Strategy, UX, branding‑aligned visuals, CMS‑friendly builds, analytics, and launch support tuned for Hyderabad’s competitive SERPs and local buyer behaviour.",
  },
  hero: {
    eyebrow: "HYDERABAD · SMART WEB DESIGN",
    h1: "Website Design Agency in Hyderabad Built for Leads — Not Decoration",
    description:
      "Whether you operate from Gachibowli, Jubilee Hills, or a growing storefront in Banjara Hills, your buyers Google you first. We design and ship websites that load fast on mobile, earn trust instantly, and turn scrolls into calls, WhatsApp chats, and form fills.",
    breadcrumbs: [
      { label: "Home", href: INTERNAL_PATHS.home },
      { label: "Services", href: INTERNAL_PATHS.services },
      { label: "Website design — Hyderabad", href: INTERNAL_PATHS.websiteDesignHyderabad },
    ] as const,
    primaryCta: "Plan my website roadmap",
    secondaryCta: "See smart websites",
    secondaryHref: INTERNAL_PATHS.smartWebsites,
  },
  problem: {
    heading: "Thin Templates and Slow Pages Lose Hyderabad Customers to Competitors",
    description:
      "Visitors compare three tabs in minutes. Generic themes, cluttered layouts, missing trust signals, and Core Web Vital issues silently push enquiries to whoever looks more credible.",
    points: [
      "Mobile‑first UX is neglected on many local builds, leading to taps that never scroll to pricing or enquiry forms.",
      "Stock layouts look identical to rivals in your category, weakening perceived quality for premium services.",
      "Weak information architecture hides key pages like packages, FAQs, locality proof, or doctor and team bios.",
      "Analytics and pixel hygiene are inconsistent, making it unclear which SERP clicks or reels actually converted.",
      "Publishing updates depends on unreliable vendors, delaying campaigns, launches, or pricing changes.",
    ] as const,
  },
  benefits: {
    heading: "Website Design Built for Credibility at First Glance — and Compounding SEO",
    description:
      "We pair visual clarity with disciplined structure so Google, AI overviews, and human visitors all understand what you sell in seconds.",
    items: [
      {
        title: "Conversion pathways that match Hyderabad buying habits",
        body: "Regional expectations around trust badges, timelines, multilingual copy (where relevant), WhatsApp prominence, and map placement are accounted for upfront.",
      },
      {
        title: "Technical foundations aligned with measurable performance",
        body: "We architect pages for Lighthouse‑friendly UX, sane heading hierarchy, and schema‑ready sections so SERP visibility strengthens over quarters — not regressing after redesign.",
      },
      {
        title: "Composable sections your team can actually maintain",
        body: "We avoid brittle one‑off gimmicks unless they earn their keep operationally — your marketing calendar should not bottleneck on obscure code.",
      },
      {
        title: "Integrated growth lens from day zero",
        body: "We tie site structure to funnel reality: nurture flows that pair with WhatsApp, AI agents, bookings, CRM automations later — whichever stack you mature into.",
      },
    ] as const,
  },
  deliverables: {
    heading: "What You Receive With Our Hyderabad Website Builds",
    items: [
      "Discovery workshop covering personas, neighbourhoods served, objections, benchmarks, KPIs.",
      "UX wireflows for hero, offerings, proofs, FAQs, locality touchpoints.",
      "High‑trust visual system (not random fonts and colours scraped from unrelated niches).",
      "Responsive build with guarded performance budgets.",
      "On‑page SEO baseline: titles, metas where applicable, headings, structured internal linking.",
      "Launch checklist covering analytics snippets, redirections when migrations apply, uptime smoke tests.",
    ] as const,
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Answers for Hyderabad Teams Exploring a Website Upgrade",
    items: [
      {
        q: "How fast can we realistically launch?",
        a: "Depends on approvals, integrations, migrations, multilingual scope, CMS choice, photography readiness, compliance copy (where relevant). We sequence parallel work aggressively but never gamble with stability weekends before major campaigns.",
      },
      {
        q: "Do you handle migrations from outdated stacks?",
        a: "Yes — we crawl legacy URLs, plan redirects thoughtfully, reconcile analytics conversions, minimise duplicate content fallout, optionally schedule staged rollouts for riskier inventories.",
      },
      {
        q: "Will the site degrade when we iterate content weekly?",
        a: "We document guardrails, component semantics, forbidden layout hacks — so iterative pages stay fast and searchable instead of collapsing into unstructured patchwork.",
      },
      {
        q: "What if SEO is already sabotaged?",
        a: "We audit thin cannibal clusters, orphaned pages, poisonous backlinks patterns (high‑level guidance), sluggish assets — then refactor IA before chasing net‑new fluff pages.",
      },
    ] as const,
  },
  finalCta: {
    heading: "Ship a Hyderabad Site That Pays for Its Retainer",
    description:
      "Book a pragmatic session: we dissect your funnel leaks, quantify rewrite vs rebuild realistically, optionally pair website scope with WhatsApp journeys or automation later.",
    primaryCta: "Book strategy call — 15 minutes",
  },
} satisfies SeoLandingPageContent;

export const aiCallAgentClinics = {
  path: INTERNAL_PATHS.aiCallAgentClinics,
  keyword: "AI call agent for clinics",
  accent: "purple",
  meta: {
    titleAbsolute: "AI Call Agent for Clinics | 24×7 Appointment Handling | Hyderabad | Editco Media",
    description:
      "Implement an AI call agent tailored for Hyderabad clinics — answers routine enquiries books slots escalates urgencies summarises transcripts syncs workflows so front desks stop drowning.",
  },
  service: {
    id: "ai-call-agent-clinics",
    name: "AI call agent — clinics",
    description:
      "Voice automation layer trained on speciality vocabulary triage etiquette privacy guardrails multilingual nuance escalation paths integrations with calendars CRM sheets WhatsApp relays.",
  },
  hero: {
    eyebrow: "CLINICS · VOICE AUTOMATION",
    h1: "AI Call Agent for Clinics That Never Lets a Patient Call Evaporate",
    description:
      "Peak OPD mornings, influencer campaigns or seasonal flu spikes inundate reception — yet every missed ring is leakage. Deploy an AI clinic call agent blending empathy with protocol: capture intent qualify urgency push bookings surface directions route callbacks.",
    breadcrumbs: [
      { label: "Home", href: INTERNAL_PATHS.home },
      { label: "Services", href: INTERNAL_PATHS.services },
      { label: "AI call agent — clinics", href: INTERNAL_PATHS.aiCallAgentClinics },
    ] as const,
    primaryCta: "Run a scripted pilot scenario",
    secondaryCta: "Deep dive — AI voice agents",
    secondaryHref: INTERNAL_PATHS.aiCallAgents,
  },
  problem: {
    heading: "Human Bottlenecks Multiply Clinical Frustration Revenue Drift Complaints",
    description:
      "Front desks juggle paperwork walk‑ins prescriptions insurance queries — callers on hold churn silently Google next nearest provider.",
    points: [
      "Burst traffic exceeds staffing elasticity — especially post reels ads community outreach.",
      "After‑hours/weekend abandonment leaves high intent IVF cosmetic dental speciality leads cold.",
      "Inconsistent scripting produces contradictory answers eroding speciality trust fragile in competitive micromarkets.",
      "Manual note transcription mistakes pollute calendars causing double bookings resentment.",
      "Lead attribution fog obscures ROI on performance marketing clinician brand building initiatives.",
    ] as const,
  },
  benefits: {
    heading: "Operational Air Cover Without Removing Human Oversight Layers",
    description:
      "We architect voice flows so automation amplifies clinicians administrators instead of hallucinating unauthorised clinical assertions.",
    items: [
      {
        title: "Always‑on humane first responder",
        body: "Controlled tone mirrors brand warmth while disclaiming appropriately — routing nuanced concerns to nurses doctors rather than improvising dangerously.",
      },
      {
        title: "Operational telemetry leadership craves",
        body: "Call intent clustering peak hour heatmaps abandonment points inform roster planning marketing budget reallocation speciality expansion conversations.",
      },
      {
        title: "Tight escalation matrix",
        body: "True emergencies escalate fast — while routine reschedule medication timing clarifications offload without moral hazard.",
      },
      {
        title: "Composable with WhatsApp automations portals",
        body: "Post‑call confirmations nudges attachments slot changes propagate across channels shrinking administrative thrash Hyderabad teams suffer.",
      },
    ] as const,
  },
  deliverables: {
    heading: "Clinic‑Grade Deployment Checklist Beyond Toy Demos",
    items: [
      "Scenario mapping consultations OPD coordinators marketing leads speciality nuance ingestion.",
      "Voice persona tone guardrail library regulatory sensitivity review iterations.",
      "Calendar booking policies buffer rules blackout integration testing.",
      "Staff training overlay — when humans intercept seamlessly without caller friction.",
      "QA harness synthetic regression calls before promotions go live weekends.",
      "Post‑launch tuning cadence — reviewing transcripts weekly refining confusion clusters.",
    ] as const,
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Clinical Teams Ask Practical Questions Before Trusting Automation",
    items: [
      {
        q: "Does this replace our reception?",
        a: "No baseline — AI absorbs repetitive deterministic segments escalates nuanced ones your policy defines ratio shifts not wholesale replacement.",
      },
      {
        q: "Regional language variance across Hyderabad?",
        a: "We tune phonetic quirks code switching behaviour test with native speakers iterate prompt guardrails multilingual fallback ordering.",
      },
      {
        q: "Compliance posture?",
        a: "We align recording consent retention summaries access workflows with templates your counsel validates — automation never substitutes legal hygiene.",
      },
      {
        q: "Connectivity stack fragility?",
        a: "We discuss PSTN Vs SIP failover latency monitoring escalation SMS backup paths — resilience planning not glossed launch day panic.",
      },
    ] as const,
  },
  finalCta: {
    heading: "Stop Paying Acquisition Tax on Leaky Phones",
    description:
      "Model economic uplift — fewer ghosted calls higher qualified booked slots reclaimed staff hours redirected patient facing empathy.",
    primaryCta: "Book clinic voice demo",
  },
} satisfies SeoLandingPageContent;

export const clinicWebsiteDevelopment = {
  path: INTERNAL_PATHS.clinicWebsiteDevelopment,
  keyword: "clinic website development Hyderabad",
  accent: "green",
  meta: {
    titleAbsolute: "Clinic Website Development Hyderabad | Trust‑First UX | Editco Media",
    description:
      "Clinic website development in Hyderabad from Editco Media: speciality storytelling evidence led design booking clarity WhatsApp linkage performance tuned for neighbourhood SEO competition.",
  },
  service: {
    id: "clinic-website-development-hyderabad",
    name: "Clinic website development — Hyderabad",
    description:
      "End‑to‑end digital front door aligning medical positioning trust architecture conversion instrumentation ongoing iteration hooks for AI voice WhatsApp nurture stacks.",
  },
  hero: {
    eyebrow: "HYDERABAD CLINICS · DIGITAL STOREFRONTS",
    h1: "Clinic Website Development in Hyderabad That Converts Science Into Trust Quickly",
    description:
      "Patients compare outcomes reviews pricing transparency logistical convenience — mediocre clinic sites leak margin silently. We design structured experiences emphasising speciality proof empathetic readability operational clarity aligning marketing clinical leadership revenue goals jointly.",
    breadcrumbs: [
      { label: "Home", href: INTERNAL_PATHS.home },
      { label: "Services", href: INTERNAL_PATHS.services },
      { label: "Clinic websites — Hyderabad", href: INTERNAL_PATHS.clinicWebsiteDevelopment },
    ] as const,
    primaryCta: "Audit my clinic funnel",
    secondaryCta: "Explore clinic growth",
    secondaryHref: INTERNAL_PATHS.clinics,
  },
  problem: {
    heading: "Clinic Websites Often Look Clinical — But Forget Conversion Psychiatry",
    description:
      "Dense jargon Walls of unstructured bullet lists buried pricing opaque booking discourage comparison shoppers primed digitally.",
    points: [
      "Poor mobile scanning drives impatient scrollers toward competitors optimised thumb journeys.",
      "Doctor authority stories underutilised burying relatability reassurance differentiators speciality depth.",
      "Services taxonomy mirrors internal org chart not patient symptom thinking confusing navigation.",
      "Integration gaps between portals payments WhatsApp degrade perceived operational maturity.",
      "Thin locality signals weaken hyperlocal Hyderabad queries near me intent capture.",
    ] as const,
  },
  benefits: {
    heading: "Balance Medical Precision With Emotional Safety UX Discipline",
    description:
      "We translate complex care pathways into hierarchies aligning anxiety reduction clarity compliance marketing ambition simultaneously.",
    items: [
      {
        title: "Structured storytelling per speciality pillar",
        body: "Procedures FAQs risks recovery timelines FAQs mapped empathetically not dumped intimidating walls.",
      },
      {
        title: "Friction reduced booking escalation",
        body: "Strategic prominence of calendars WhatsApp relays callback capture tuned device context peak anxiety moments.",
      },
      {
        title: "Reputation harmonisation loops",
        body: "Selective weaving proof external validation without unethical cherry picking maintaining medico‑legal realism.",
      },
      {
        title: "Composable growth scaffolding",
        body: "IA anticipates branching into AI inbound calling automation multilingual expansions drip education — reducing costly rewrites eighteen months later.",
      },
    ] as const,
  },
  deliverables: {
    heading: "Clinic Website Deliverables Rooted in Operational Reality",
    items: [
      "Stakeholder discovery bridging clinical marketers admin finance perspectives.",
      "Information architecture resisting vanity page sprawl aligning search demand maps.",
      "Visual system balancing warmth sanitation cues premium positioning speciality nuance.",
      "Performance conscious component build lazy media strategies.",
      "Schema planning treatment condition locality entities high level responsibly.",
      "Launch governance analytics event naming training quick edit CMS guidance.",
    ] as const,
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Operational Leaders Ask Tactical Questions Early",
    items: [
      {
        q: "Can we phased launch sub‑specialties?",
        a: "Yes phased releases reduce choke risk aligning campaign calendars seasonal demand cycles maintaining canonical discipline.",
      },
      {
        q: "Migrating ageing WordPress nightmares?",
        a: "We inventory toxic plugins bloated revisions craft redirect parity testing avoiding silent ranking collapses unnoticed weeks.",
      },
      {
        q: "Content ownership ongoing?",
        a: "We supply editorial scaffolding guardrails optionally pair with disciplined refresh retainers predictable not chaotic burst rewrite cycles.",
      },
      {
        q: "ROI measurement tangibility?",
        a: "We align KPI trees — enriched qualified enquiries directional not vanity traffic alone bridging CRM discipline.",
      },
    ] as const,
  },
  finalCta: {
    heading: "Make Your Hyderabad Clinic’s First Impression as Sharp as Surgical Precision",
    description:
      "Schedule consult — quantify leaks benchmark peers architect rebuild vs incremental roadmap responsibly.",
    primaryCta: "Book clarity session — 15 minutes",
  },
} satisfies SeoLandingPageContent;

export const whatsappAutomationAgency = {
  path: INTERNAL_PATHS.whatsappAutomationAgency,
  keyword: "WhatsApp automation agency",
  accent: "orange",
  meta: {
    titleAbsolute: "WhatsApp Automation Agency | Playbooks Booking Nurtures | Hyderabad | Editco Media",
    description:
      "Editco Media — WhatsApp automation agency helping Hyderabad retailers clinics schools service brands orchestrate scripted yet human journeys beyond broadcast spam burnout.",
  },
  service: {
    id: "whatsapp-automation-agency",
    name: "WhatsApp automation agency",
    description:
      "Flow design template governance CRM integration escalation analytics compliance aware messaging reducing manual copy paste churn raising conversion continuity.",
  },
  hero: {
    eyebrow: "WHATSAPP · AUTOMATED JOURNEYS",
    h1: "WhatsApp Automation That Feels Assistive — Not Robotic Spam",
    description:
      "Hyderabad enterprises already converse where customers live — fragmented manual threads leak revenue. Architect triggers journeys guardrails multilingual tone consistency escalation paths analytics loops scaling personalisation responsibly.",
    breadcrumbs: [
      { label: "Home", href: INTERNAL_PATHS.home },
      { label: "Services", href: INTERNAL_PATHS.services },
      { label: "WhatsApp automation agency", href: INTERNAL_PATHS.whatsappAutomationAgency },
    ] as const,
    primaryCta: "Map conversational flows",
    secondaryCta: "WhatsApp automation pillar",
    secondaryHref: INTERNAL_PATHS.whatsappAutomation,
  },
  problem: {
    heading: "Unstructured Reactive Chat Buried Promise Strains Teams Silently",
    description:
      "Broadcast blasts degrade trust unstructured group chaos operational fatigue missed follow‑ups degrade LTV subtly.",
    points: [
      "No consistent qualification sequences — reps improvise inconsistently harming brand perception uniformity.",
      "Promotional overwhelm triggers opt‑out spikes eroding warm audiences painstakingly nurtured.",
      "Routing gaps between bots humans delay resolution fueling abandonment toxic reviews.",
      "Attribution fragmentation obscures funnel contribution versus paid channels misallocating budgets.",
      "Compliance neglect risks punitive platform policy violations legal exposure careless.",
    ] as const,
  },
  benefits: {
    heading: "Scale Personal Touch Without Turning Teams Into Clipboard Zombies",
    description:
      "Automation should eliminate mechanical repetition amplify judgment heavy human moments premium experiences demand.",
    items: [
      {
        title: "Segment‑aware choreography",
        body: "Trigger trees branch by SKU interest locality behaviour consent state — no one‑shot blast delusion pretending homogeneity Hyderabad markets lack.",
      },
      {
        title: "Throughput without tone dilution",
        body: "Template libraries maintain brand lexical discipline micro variation prevents robotic fatigue testing.",
      },
      {
        title: "Operational sync beyond chat silo",
        body: "Sheets CRM ticketing inventory awareness reduces double entry conflicting promises frontline embarrassment.",
      },
      {
        title: "Instrumentation feeding optimisation discipline",
        body: "Funnel stage reporting highlights drop clusters enabling iterative conversational experiments scientifically.",
      },
    ] as const,
  },
  deliverables: {
    heading: "WhatsApp Automation Engagements Produce Tangible Artefacts",
    items: [
      "Journey blueprint workshops covering lifecycle mapping trigger inventory.",
      "Copy architecture tone matrix multilingual variants compliance checkpoints.",
      "Integration wiring validations webhooks acknowledgement latency tests.",
      "Human takeover routing queue SLAs training overlay documentation.",
      "Experiment backlog prioritisation hypotheses measurement guardrails.",
      "Governance playbook opt‑out handling audit logging periodic reviews.",
    ] as const,
  },
  faq: {
    eyebrow: "FAQ",
    heading: "WhatsApp Strategy Questions Hyderabad Operators Raise",
    items: [
      {
        q: "Green tick necessity immediately?",
        a: "Not always pragmatic — we roadmap verification economics volume thresholds alternative trust accumulation meanwhile.",
      },
      {
        q: "Spam perception mitigation?",
        a: "Through consent hygiene frequency caps value reciprocity conversational spacing — automation amplifies relevance not brute force blasting.",
      },
      {
        q: "Hybrid bot human latency fears?",
        a: "We architect warm handoffs context packets preventing users repeating painfully eroding goodwill.",
      },
      {
        q: "Regional nuance slang code switching?",
        a: "We script adaptive tone layers test with bilingual operators iterate misrecognition fallout handling.",
      },
    ] as const,
  },
  finalCta: {
    heading: "Stop Renting Chaos — Engineer WhatsApp Compound Returns",
    description:
      "Book short workshop — quantify automation ROI backlog prioritise ethically sustainable sequences.",
    primaryCta: "Book WhatsApp workshop",
  },
} satisfies SeoLandingPageContent;

export const aiAutomationHyderabad = {
  path: INTERNAL_PATHS.aiAutomationHyderabad,
  keyword: "AI automation agency Hyderabad",
  accent: "purple",
  meta: {
    titleAbsolute: "AI Automation Agency Hyderabad | Process Copilots Agents | Editco Media",
    description:
      "Hyderabad AI automation agency services by Editco Media — pragmatic copilots agentic workflows bridging sheets CRM ticketing voice reducing manual rework preserving human judgment gates.",
  },
  service: {
    id: "ai-automation-agency-hyderabad",
    name: "AI automation agency — Hyderabad",
    description:
      "Discovery led automation layering language models deterministic scripts integrations observability escalation guardrails iterating measurable labour savings responsibly.",
  },
  hero: {
    eyebrow: "HYDERABAD · ENTERPRISE PRAGMATISM",
    h1: "AI Automation Agency in Hyderabad Turning Manual Grind Into Measurable Leverage",
    description:
      "AI hype drowned nuance — we cut through: map painful repetitive workflows propose minimal viable augmentation validate ROI ethically scale integrations voice agents document summarisers internal copilots without governance theater only.",
    breadcrumbs: [
      { label: "Home", href: INTERNAL_PATHS.home },
      { label: "Services", href: INTERNAL_PATHS.services },
      { label: "AI automation — Hyderabad", href: INTERNAL_PATHS.aiAutomationHyderabad },
    ] as const,
    primaryCta: "Expose automation backlog",
    secondaryCta: "Business automation services",
    secondaryHref: INTERNAL_PATHS.businessAutomation,
  },
  problem: {
    heading: "Tool Sprawl and Shadow Experiments Poison Trust Before Wins Surface",
    description:
      "Teams paste sensitive data unmanaged experiments hallucinate summaries leadership pulls plug prematurely — squandered runway.",
    points: [
      "No workflow mapping — flashy demos masking integration debt eventual abandonment.",
      "Missing evaluation harnesses — accuracy drift unnoticed eroding stakeholder confidence catastrophically.",
      "Fragmented orchestration spreadsheets email chaos persist defeating unified automation narratives.",
      "Security reviews absent — regulatory exposure risking painful reversals reputational blows.",
      "Under‑instrumented KPIs — savings claims anecdotal scepticism finance withholds renewal budgets.",
    ] as const,
  },
  benefits: {
    heading: "Engineer Reliable Augmentation Layers Leadership Can Audit Reconcile",
    description:
      "We bias toward operational transparency incremental compounding autonomy not premature full lights‑out fantasies irresponsible sectors.",
    items: [
      {
        title: "Process archaeology before model theatre",
        body: "We quantify rework pain points prerequisites data hygiene realities integration surfaces candidly refusing magical thinking.",
      },
      {
        title: "Guardrailed experimentation discipline",
        body: "Human approval gates escalation paths anomaly detection logging retention policies proportionate risk posture.",
      },
      {
        title: "Composable building blocks interoperability",
        body: "Design agents triggers knowledge bases plugging evolving stack choices reducing future rewrite taxation.",
      },
      {
        title: "Economics narration finance understands",
        body: "Unit economics labour hours reclaimed error reduction velocity uplift articulated credibly sustaining investment cycles.",
      },
    ] as const,
  },
  deliverables: {
    heading: "AI Automation Engagements Yield Concrete Engineering Outputs",
    items: [
      "Workflow decomposition workshops stakeholder alignment prioritisation matrices.",
      "Data access governance review templates proportionate Hyderabad regulatory context nuances.",
      "Prototype harness benchmark suite qualitative operator feedback loops.",
      "Integration implementation observability alerting dashboards escalation paths.",
      "Runbook documentation training sessions shadow parallel operations.",
      "Iteration roadmap scaling criteria kill switch policies ethical review checkpoints.",
    ] as const,
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Leaders Probe Risk ROI Before Institutionalising Agents",
    items: [
      {
        q: "LLM hallucination containment strategy?",
        a: "Retrieval augmentation citation policies bounded tool permissions deterministic confirmations high stakes domains refusing unsafe autonomy.",
      },
      {
        q: "Talent displacement fears politically?",
        a: "We frame copilot ergonomics relieving repetitive burnout elevating judgement heavy talent storytelling metrics transparently avoiding naive headcount narratives alone.",
      },
      {
        q: "Privacy residency constraints?",
        a: "We architect deployment patterns respecting data residency minimizing cross border leakage aligning vendor contracts cautiously documented.",
      },
      {
        q: "Time to first measurable uplift?",
        a: "Varies backlog hygiene — phased pilots deliberately scoped weeks not fantasy enterprise horizon lines anchoring realism.",
      },
    ] as const,
  },
  finalCta: {
    heading: "Build Hyderabad’s Next Ops Advantage Without Betting the Farm on Buzzwords",
    description:
      "Schedule intro — collaboratively pressure test three candidate automations quantify feasibility responsibly.",
    primaryCta: "Book AI automation intro",
  },
} satisfies SeoLandingPageContent;

export const SEO_LANDING_PAGES = {
  [INTERNAL_PATHS.websiteDesignHyderabad]: websiteDesignHyderabad,
  [INTERNAL_PATHS.aiCallAgentClinics]: aiCallAgentClinics,
  [INTERNAL_PATHS.clinicWebsiteDevelopment]: clinicWebsiteDevelopment,
  [INTERNAL_PATHS.whatsappAutomationAgency]: whatsappAutomationAgency,
  [INTERNAL_PATHS.aiAutomationHyderabad]: aiAutomationHyderabad,
} satisfies Record<string, SeoLandingPageContent>;

export type SeoLandingPath = keyof typeof SEO_LANDING_PAGES;

export const SEO_LANDING_PATHS = [
  INTERNAL_PATHS.websiteDesignHyderabad,
  INTERNAL_PATHS.aiCallAgentClinics,
  INTERNAL_PATHS.clinicWebsiteDevelopment,
  INTERNAL_PATHS.whatsappAutomationAgency,
  INTERNAL_PATHS.aiAutomationHyderabad,
] as const satisfies readonly SeoLandingPath[];

export function getSeoLandingPage(path: string): SeoLandingPageContent | undefined {
  if (path in SEO_LANDING_PAGES) {
    return SEO_LANDING_PAGES[path as SeoLandingPath];
  }
  return undefined;
}
