import type { LeadStatus } from "@/lib/os/constants";
import {
  canTransitionLead,
  leadTransitionReasonRequired,
} from "@/lib/os/transitions";

export type LeadStageChangeInput = {
  from: LeadStatus;
  to: LeadStatus;
  reason?: string;
};

export type LeadStageChangeResult =
  | { ok: true }
  | { ok: false; error: string };

/** Validates lead stage transitions before persistence (used by server actions). */
export function validateLeadStageChange(input: LeadStageChangeInput): LeadStageChangeResult {
  const { from, to, reason } = input;

  if (to === "converted") {
    return { ok: false, error: "Use the conversion wizard to mark a lead as converted." };
  }

  if (!canTransitionLead(from, to)) {
    return { ok: false, error: `Cannot move lead from ${from} to ${to}.` };
  }

  if (leadTransitionReasonRequired(from, to) && !reason?.trim()) {
    return { ok: false, error: "A reason is required for this status change." };
  }

  return { ok: true };
}
