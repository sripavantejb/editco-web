import type { LeadStatus, ProjectStatus, TaskStatus } from "@/lib/os/constants";

/** Allowed lead stage moves. `converted` is only set by the conversion service. */
export const LEAD_TRANSITIONS: Partial<Record<LeadStatus, LeadStatus[]>> = {
  new: ["contacted", "qualified", "lost", "on_hold"],
  contacted: ["new", "qualified", "proposal", "lost", "on_hold"],
  qualified: ["contacted", "proposal", "negotiation", "lost", "on_hold"],
  proposal: ["qualified", "negotiation", "lost", "on_hold"],
  negotiation: ["proposal", "lost", "on_hold"],
  on_hold: ["new", "contacted", "qualified", "proposal", "negotiation", "lost"],
  lost: ["new", "contacted", "on_hold"],
  converted: [],
};

export function canTransitionLead(from: LeadStatus, to: LeadStatus): boolean {
  if (from === to) return true;
  if (to === "converted") return false;
  return LEAD_TRANSITIONS[from]?.includes(to) ?? false;
}

export function leadTransitionReasonRequired(from: LeadStatus, to: LeadStatus): boolean {
  return to === "lost" || to === "on_hold" || from === "lost";
}

/** Spec-aligned project status moves (Phase 4). */
export const PROJECT_TRANSITIONS: Partial<Record<ProjectStatus, ProjectStatus[]>> = {
  planned: ["onboarding", "in_progress", "cancelled"],
  onboarding: ["planned", "in_progress", "waiting_for_client", "blocked", "cancelled"],
  in_progress: [
    "onboarding",
    "waiting_for_client",
    "blocked",
    "in_review",
    "completed",
    "cancelled",
  ],
  waiting_for_client: ["in_progress", "blocked", "in_review", "cancelled"],
  blocked: ["onboarding", "in_progress", "waiting_for_client", "in_review", "cancelled"],
  in_review: ["in_progress", "waiting_for_client", "blocked", "completed"],
  completed: [],
  cancelled: [],
};

export function canTransitionProject(from: ProjectStatus, to: ProjectStatus): boolean {
  if (from === to) return true;
  return PROJECT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function projectTransitionReasonRequired(
  from: ProjectStatus,
  to: ProjectStatus
): boolean {
  return to === "blocked" || to === "cancelled" || from === "blocked";
}

export const TASK_TRANSITIONS: Partial<Record<TaskStatus, TaskStatus[]>> = {
  todo: ["in_progress", "blocked", "on_hold", "cancelled"],
  in_progress: ["blocked", "on_hold", "completed", "cancelled", "todo"],
  blocked: ["in_progress", "on_hold", "cancelled", "todo"],
  on_hold: ["in_progress", "todo", "blocked", "cancelled"],
  completed: [],
  cancelled: ["todo"],
};

export function canTransitionTask(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return true;
  return TASK_TRANSITIONS[from]?.includes(to) ?? false;
}

