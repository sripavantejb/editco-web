export const SALES_RECORD_STATUSES = ["active", "archived"] as const;
export type SalesRecordStatus = (typeof SALES_RECORD_STATUSES)[number];

export const SALES_EMPLOYEE_STATUSES = ["active", "inactive", "on_leave"] as const;
export type SalesEmployeeStatus = (typeof SALES_EMPLOYEE_STATUSES)[number];

export const SALES_EMPLOYEE_STATUS_LABELS: Record<SalesEmployeeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  on_leave: "On leave",
};

export const SALES_LEAD_SOURCES = [
  "website",
  "referral",
  "instagram",
  "facebook",
  "linkedin",
  "google",
  "ads",
  "campaign",
  "cold_outreach",
  "existing_customer",
  "other",
] as const;
export type SalesLeadSource = (typeof SALES_LEAD_SOURCES)[number];

export const SALES_LEAD_SOURCE_LABELS: Record<SalesLeadSource, string> = {
  website: "Website",
  referral: "Referral",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  google: "Google",
  ads: "Ads",
  campaign: "Campaign",
  cold_outreach: "Cold outreach",
  existing_customer: "Existing customer",
  other: "Other",
};

export const SALES_LEAD_TEMPERATURES = ["hot", "warm", "cold"] as const;
export type SalesLeadTemperature = (typeof SALES_LEAD_TEMPERATURES)[number];

export const SALES_LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "unqualified",
  "converted",
  "lost",
] as const;
export type SalesLeadStatus = (typeof SALES_LEAD_STATUSES)[number];

export const SALES_LEAD_STATUS_LABELS: Record<SalesLeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  unqualified: "Unqualified",
  converted: "Converted",
  lost: "Lost",
};

export const SALES_LEAD_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type SalesLeadPriority = (typeof SALES_LEAD_PRIORITIES)[number];

/** Lead qualification -> deal pipeline stages (spec: New -> Contacted -> Qualified -> Meeting -> Proposal -> Negotiation -> Won/Lost). */
export const SALES_DEAL_STAGES = [
  "new",
  "contacted",
  "qualified",
  "meeting",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;
export type SalesDealStage = (typeof SALES_DEAL_STAGES)[number];

export const SALES_DEAL_STAGE_LABELS: Record<SalesDealStage, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  meeting: "Meeting",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const SALES_DEAL_PIPELINE: SalesDealStage[] = [
  "new",
  "contacted",
  "qualified",
  "meeting",
  "proposal",
  "negotiation",
];

export const SALES_LOST_REASONS = [
  "price_objection",
  "timing_issue",
  "requirement_mismatch",
  "chose_competitor",
  "no_response",
  "other",
] as const;
export type SalesLostReason = (typeof SALES_LOST_REASONS)[number];

export const SALES_LOST_REASON_LABELS: Record<SalesLostReason, string> = {
  price_objection: "Price objection",
  timing_issue: "Timing issue",
  requirement_mismatch: "Requirement mismatch",
  chose_competitor: "Chose a competitor",
  no_response: "No response",
  other: "Other",
};

export const SALES_CALL_OUTCOMES = [
  "connected",
  "no_answer",
  "busy",
  "interested",
  "not_interested",
  "callback",
  "qualified",
  "other",
] as const;
export type SalesCallOutcome = (typeof SALES_CALL_OUTCOMES)[number];
export const SALES_CALL_OUTCOME_LABELS: Record<SalesCallOutcome, string> = {
  connected: "Connected",
  no_answer: "No answer",
  busy: "Busy",
  interested: "Interested",
  not_interested: "Not interested",
  callback: "Callback",
  qualified: "Qualified",
  other: "Other",
};

export const SALES_MEETING_TYPES = ["discovery", "demo", "proposal", "negotiation", "internal", "other"] as const;
export type SalesMeetingType = (typeof SALES_MEETING_TYPES)[number];

export const SALES_MEETING_STATUSES = ["scheduled", "completed", "cancelled", "rescheduled", "no_show"] as const;
export type SalesMeetingStatus = (typeof SALES_MEETING_STATUSES)[number];
export const SALES_MEETING_STATUS_LABELS: Record<SalesMeetingStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
  no_show: "No show",
};

export const SALES_FOLLOWUP_TYPES = ["call", "email", "whatsapp", "meeting", "other"] as const;
export type SalesFollowUpType = (typeof SALES_FOLLOWUP_TYPES)[number];

export const SALES_FOLLOWUP_STATUSES = ["pending", "completed", "missed", "cancelled"] as const;
export type SalesFollowUpStatus = (typeof SALES_FOLLOWUP_STATUSES)[number];
export const SALES_FOLLOWUP_STATUS_LABELS: Record<SalesFollowUpStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  missed: "Missed",
  cancelled: "Cancelled",
};

export const SALES_QUOTATION_STATUSES = [
  "draft",
  "pending_approval",
  "approved",
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
] as const;
export type SalesQuotationStatus = (typeof SALES_QUOTATION_STATUSES)[number];
export const SALES_QUOTATION_STATUS_LABELS: Record<SalesQuotationStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending approval",
  approved: "Approved",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
};

export const SALES_PROPOSAL_STATUSES = [
  "draft",
  "review",
  "approved",
  "sent",
  "viewed",
  "accepted",
  "rejected",
] as const;
export type SalesProposalStatus = (typeof SALES_PROPOSAL_STATUSES)[number];
export const SALES_PROPOSAL_STATUS_LABELS: Record<SalesProposalStatus, string> = {
  draft: "Draft",
  review: "Review",
  approved: "Approved",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  rejected: "Rejected",
};

export const SALES_TASK_STATUSES = ["todo", "in_progress", "completed", "overdue"] as const;
export type SalesTaskStatusConst = (typeof SALES_TASK_STATUSES)[number];

export const SALES_APPROVAL_TYPES = ["discount", "quotation", "proposal", "deal"] as const;
export type SalesApprovalType = (typeof SALES_APPROVAL_TYPES)[number];

export const SALES_APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type SalesApprovalStatus = (typeof SALES_APPROVAL_STATUSES)[number];

export const SALES_ATTENDANCE_STATUSES = ["present", "absent", "leave", "half_day", "late"] as const;
export type SalesAttendanceStatus = (typeof SALES_ATTENDANCE_STATUSES)[number];
export const SALES_ATTENDANCE_STATUS_LABELS: Record<SalesAttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  leave: "Leave",
  half_day: "Half day",
  late: "Late",
};

export const SALES_ACTIVITY_STATUSES = ["online", "offline", "on_break"] as const;
export type SalesLiveStatus = (typeof SALES_ACTIVITY_STATUSES)[number];
