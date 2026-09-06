/** Client-safe constants for Master Tracker (no mongoose). */

export const EDITCO_TEAM_NAMES = ["Harsha", "Tej", "Deepika"] as const;
export type EditcoTeamName = (typeof EDITCO_TEAM_NAMES)[number];

export const EDITCO_TEAM_EMAILS: Record<EditcoTeamName, string> = {
  Harsha: "harshapolina1@gmail.com",
  Tej: "sripavantejb@gmail.com",
  Deepika: "deepikamundla54@gmail.com",
};

export const EDITCO_TRACKER_STATUSES = [
  "started",
  "in_progress",
  "completed",
  "not_needed",
  "blocked",
  "recursive",
  "not_yet_started",
] as const;
export type EditcoTrackerStatus = (typeof EDITCO_TRACKER_STATUSES)[number];

export const EDITCO_TRACKER_STATUS_LABELS: Record<EditcoTrackerStatus, string> = {
  started: "Started",
  in_progress: "In Progress",
  completed: "Completed",
  not_needed: "Not needed / cancelled",
  blocked: "Blocked",
  recursive: "Recursive",
  not_yet_started: "Not Yet started",
};

/** Light-theme status chips for the HRMS white portal. */
export const EDITCO_TRACKER_STATUS_CLASSES: Record<EditcoTrackerStatus, string> = {
  started: "bg-rose-100 text-rose-700",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  not_needed: "bg-slate-100 text-slate-600",
  blocked: "bg-violet-100 text-violet-700",
  recursive: "bg-pink-100 text-pink-700",
  not_yet_started: "bg-red-100 text-red-700",
};
