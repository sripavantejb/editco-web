export const CLIENT_SESSION_COOKIE = "editco_client_session";

export const STAFF_ROLES = [
  "super_admin",
  "admin",
  "sales",
  "project_manager",
  "team_member",
  "finance",
  "viewer",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  sales: "Sales",
  project_manager: "Project manager",
  team_member: "Team member",
  finance: "Finance",
  viewer: "Viewer",
};

export const RECORD_STATUSES = ["active", "archived", "cancelled"] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "converted",
  "lost",
  "on_hold",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  converted: "Converted",
  lost: "Lost",
  on_hold: "On hold",
};

export const LEAD_PIPELINE: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "converted",
];

export const LEAD_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];

export const LEAD_SOURCES = [
  "inbound",
  "website",
  "referral",
  "cold",
  "partner",
  "other",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

/** Spec-aligned delivery statuses (Phase 4). */
export const PROJECT_STATUSES = [
  "planned",
  "onboarding",
  "in_progress",
  "waiting_for_client",
  "blocked",
  "in_review",
  "completed",
  "cancelled",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Planned",
  onboarding: "Onboarding",
  in_progress: "In progress",
  waiting_for_client: "Waiting for client",
  blocked: "Blocked",
  in_review: "In review",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Map pre–Phase 4 statuses → canonical statuses. */
export const LEGACY_PROJECT_STATUS_MAP: Record<string, ProjectStatus> = {
  not_started: "planned",
  planning: "onboarding",
  in_progress: "in_progress",
  client_review: "in_review",
  revision: "in_progress",
  on_hold: "blocked",
  completed: "completed",
  cancelled: "cancelled",
};

export function normalizeProjectStatus(status: string | undefined | null): ProjectStatus {
  if (!status) return "planned";
  if ((PROJECT_STATUSES as readonly string[]).includes(status)) {
    return status as ProjectStatus;
  }
  return LEGACY_PROJECT_STATUS_MAP[status] ?? "planned";
}

export const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = [
  "planned",
  "onboarding",
  "in_progress",
  "waiting_for_client",
  "blocked",
  "in_review",
];

export const PROJECT_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

export const DEFAULT_PROJECT_MILESTONES = [
  "Discovery",
  "Design",
  "Development",
  "Testing",
  "Launch",
] as const;

export const INVOICE_STATUSES = [
  "draft",
  "issued",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  partially_paid: "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "blocked",
  "on_hold",
  "completed",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  blocked: "Blocked",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const ACTIVITY_ACTION_TYPES = [
  "PROJECT_CREATED",
  "PROJECT_UPDATED",
  "PROJECT_POC_CHANGED",
  "PROJECT_MEMBER_ADDED",
  "PROJECT_MEMBER_REMOVED",
  "TASK_CREATED",
  "TASK_ASSIGNED",
  "TASK_REASSIGNED",
  "TASK_STATUS_CHANGED",
  "TASK_STARTED",
  "TASK_PAUSED",
  "TASK_COMPLETED",
  "TASK_COMMENT_ADDED",
  "TASK_DUE_DATE_CHANGED",
  "TASK_DEPENDENCY_ADDED",
  "TASK_DEPENDENCY_REMOVED",
  "USER_ADDED",
  "USER_ROLE_CHANGED",
] as const;
export type ActivityActionType = (typeof ACTIVITY_ACTION_TYPES)[number];

export const MEETING_TYPES = [
  "kickoff",
  "strategy",
  "review",
  "internal",
  "other",
] as const;
export type MeetingType = (typeof MEETING_TYPES)[number];

export const PROPOSAL_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "negotiation",
  "accepted",
  "rejected",
  "expired",
] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  negotiation: "Negotiation",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
};

export const CALL_OUTCOMES = [
  "connected",
  "no_answer",
  "voicemail",
  "wrong_number",
  "follow_up_required",
  "not_interested",
  "qualified",
  "other",
] as const;
export type CallOutcome = (typeof CALL_OUTCOMES)[number];

export const CALL_OUTCOME_LABELS: Record<CallOutcome, string> = {
  connected: "Connected",
  no_answer: "No answer",
  voicemail: "Voicemail",
  wrong_number: "Wrong number",
  follow_up_required: "Follow-up required",
  not_interested: "Not interested",
  qualified: "Qualified",
  other: "Other",
};

export const FOLLOWUP_STATUSES = [
  "pending",
  "completed",
  "cancelled",
  "rescheduled",
] as const;
export type FollowUpStatus = (typeof FOLLOWUP_STATUSES)[number];

export const MILESTONE_STATUSES = [
  "pending",
  "in_progress",
  "completed",
] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
};

export const VISIBILITY_LEVELS = ["internal", "client_visible"] as const;
export type VisibilityLevel = (typeof VISIBILITY_LEVELS)[number];

export const VISIBILITY_LEVEL_LABELS: Record<VisibilityLevel, string> = {
  internal: "Internal",
  client_visible: "Client visible",
};

export const DEFAULT_TAX_RATE = 0.18;

export const DEFAULT_SERVICES = [
  { slug: "website", name: "Website" },
  { slug: "seo", name: "SEO" },
  { slug: "crm", name: "CRM" },
  { slug: "ai_agent", name: "AI Agent" },
  { slug: "automation", name: "Automation" },
  { slug: "branding", name: "Branding" },
] as const;

export const INDUSTRY_SECTORS = [
  "Technology",
  "Healthcare & Life Sciences",
  "Education",
  "Financial Services",
  "Retail & Commerce",
  "Real Estate & Construction",
  "Manufacturing & Industry",
  "Travel & Hospitality",
  "Logistics & Transport",
  "Professional Services",
  "Media & Entertainment",
  "Other",
] as const;
export type IndustrySector = (typeof INDUSTRY_SECTORS)[number];

export const DEFAULT_INDUSTRIES: {
  slug: string;
  name: string;
  sector: IndustrySector;
}[] = [
  { slug: "saas", name: "SaaS / Technology", sector: "Technology" },
  { slug: "healthcare", name: "Healthcare", sector: "Healthcare & Life Sciences" },
  { slug: "education", name: "Education", sector: "Education" },
  { slug: "fintech", name: "Fintech", sector: "Financial Services" },
  { slug: "banking", name: "Banking / Insurance", sector: "Financial Services" },
  { slug: "ecommerce", name: "E-commerce", sector: "Retail & Commerce" },
  { slug: "retail", name: "Retail", sector: "Retail & Commerce" },
  { slug: "real_estate", name: "Real Estate", sector: "Real Estate & Construction" },
  { slug: "manufacturing", name: "Manufacturing", sector: "Manufacturing & Industry" },
  { slug: "hospitality", name: "Hospitality", sector: "Travel & Hospitality" },
  { slug: "logistics", name: "Logistics", sector: "Logistics & Transport" },
  { slug: "agency", name: "Agency / Marketing", sector: "Professional Services" },
  { slug: "legal", name: "Legal", sector: "Professional Services" },
  { slug: "media", name: "Media & Entertainment", sector: "Media & Entertainment" },
  { slug: "other", name: "Other", sector: "Other" },
];

/** Projects Vault (sellable products) — separate from delivery OsProject. */
export const VAULT_PROJECT_STATUSES = ["active", "inactive", "archived"] as const;
export type VaultProjectStatus = (typeof VAULT_PROJECT_STATUSES)[number];

export const VAULT_PROJECT_STATUS_LABELS: Record<VaultProjectStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

export const VAULT_MESSAGE_TYPES = [
  "whatsapp_cold",
  "email",
  "follow_up",
  "linkedin",
  "general_pitch",
] as const;
export type VaultMessageType = (typeof VAULT_MESSAGE_TYPES)[number];

export const VAULT_MESSAGE_TYPE_LABELS: Record<VaultMessageType, string> = {
  whatsapp_cold: "WhatsApp cold message",
  email: "Email message",
  follow_up: "Follow-up message",
  linkedin: "LinkedIn message",
  general_pitch: "General pitch",
};

export const PITCH_STATUSES = [
  "pitched",
  "interested",
  "follow_up",
  "demo",
  "negotiation",
  "working",
  "won",
  "lost",
] as const;
export type PitchStatus = (typeof PITCH_STATUSES)[number];

export const PITCH_STATUS_LABELS: Record<PitchStatus, string> = {
  pitched: "Pitched",
  interested: "Interested",
  follow_up: "Follow-up",
  demo: "Demo",
  negotiation: "Negotiation",
  working: "Working",
  won: "Won",
  lost: "Lost",
};

/** Active opportunity statuses (exclude terminal won/lost). */
export const PITCH_WORKING_STATUSES: PitchStatus[] = [
  "interested",
  "follow_up",
  "demo",
  "negotiation",
  "working",
];

export const PITCH_FUNNEL_ORDER: PitchStatus[] = [
  "pitched",
  "interested",
  "follow_up",
  "demo",
  "negotiation",
  "working",
  "won",
];
