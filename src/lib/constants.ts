export const STAGES = [
  "submitted",
  "contacted",
  "qualified_call",
  "proposal_sent",
  "won",
  "lost",
] as const;

export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  submitted: "Submitted",
  contacted: "Contacted",
  qualified_call: "Qualified Call",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
};

export const PIPELINE_STEPS: Stage[] = [
  "submitted",
  "contacted",
  "qualified_call",
  "proposal_sent",
  "won",
];

export const LOST_REASONS = [
  { value: "timing", label: "Timing wasn't right" },
  { value: "budget", label: "Budget didn't align" },
  { value: "went_elsewhere", label: "Went with another provider" },
  { value: "not_a_fit", label: "Not a fit for our services" },
  { value: "no_response", label: "Couldn't reach them" },
  { value: "other", label: "Other" },
] as const;

export const LOST_REASON_LABELS: Record<string, string> = Object.fromEntries(
  LOST_REASONS.map((r) => [r.value, r.label])
);

export const NEED_OPTIONS = [
  "Website",
  "AI Calling Agent",
  "CRM",
  "Automation",
  "Not sure",
] as const;

export const PROJECT_TYPES = [
  { value: "website", label: "Website only", baseReward: 3000 },
  { value: "website_crm", label: "Website + CRM/Automation", baseReward: 7000 },
  {
    value: "ai_growth",
    label: "AI Calling Agent / Full Growth System",
    baseReward: 15000,
  },
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number]["value"];

export const TIERS = ["standard", "growth_partner", "elite_partner"] as const;
export type Tier = (typeof TIERS)[number];

export const TIER_LABELS: Record<Tier, string> = {
  standard: "Standard",
  growth_partner: "Growth Partner",
  elite_partner: "Elite Partner",
};

export const TIER_BONUS: Record<Tier, number> = {
  standard: 0,
  growth_partner: 0.2,
  elite_partner: 0.3,
};

export const REF_COOKIE = "editco_ref";
export const SESSION_COOKIE = "editco_session";
export const ADMIN_SESSION_COOKIE = "editco_admin_session";
