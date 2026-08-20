"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity, notifyStaff } from "@/lib/os/activity";
import { optDate, str } from "@/lib/os/form";
import {
  CALL_OUTCOMES,
  type CallOutcome,
  type LeadStatus,
} from "@/lib/os/constants";
import { Lead } from "@/models/os/Lead";
import { Call } from "@/models/os/Call";
import { FollowUp } from "@/models/os/FollowUp";
import { LeadActivity } from "@/models/os/LeadActivity";
import type { ActionState } from "@/actions/auth";
import { validateLeadStageChange } from "@/lib/os/services";

const VALUE_STATUSES: LeadStatus[] = ["qualified", "proposal", "negotiation"];

function revalidateSales() {
  revalidatePath("/admin/os", "layout");
  revalidatePath("/admin/os/calling", "page");
  revalidatePath("/admin/os/follow-ups", "page");
  revalidatePath("/admin/os/pipeline", "page");
  revalidatePath("/admin/os/leads", "page");
}

export async function createCall(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("calls:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const leadId = str(formData, "leadId");
  const startedAt = optDate(formData, "startedAt");
  const endedAt = optDate(formData, "endedAt");
  const outcome = str(formData, "outcome") as CallOutcome;
  const notes = str(formData, "notes");
  const nextFollowUpAt = optDate(formData, "nextFollowUpAt");

  if (!leadId) return { error: "Lead is required" };
  if (!startedAt) return { error: "Call start time is required" };
  if (!CALL_OUTCOMES.includes(outcome)) return { error: "Invalid call outcome" };

  const lead = await Lead.findById(leadId);
  if (!lead || lead.recordStatus !== "active") return { error: "Lead not found" };
  if (lead.status === "converted") return { error: "Converted leads are locked" };

  const callEndedAt = endedAt ?? new Date();
  const durationSeconds =
    Math.max(0, Math.round((callEndedAt.getTime() - startedAt.getTime()) / 1000));

  // Create the call record first (single source of truth for the event)
  const call = await Call.create({
    leadId: lead._id,
    callerId: gate.staff.userId,
    callerEmail: gate.staff.email,
    startedAt,
    endedAt: callEndedAt,
    durationSeconds,
    outcome,
    notes,
    nextFollowUp: nextFollowUpAt,
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  // Optional: update lead stage (minimal, outcome-driven mapping)
  let fromStatus: LeadStatus = lead.status as LeadStatus;
  let toStatus: LeadStatus | null = null;

  if (outcome === "qualified" || outcome === "connected") {
    toStatus = fromStatus === "new" ? "contacted" : "qualified";
  } else if (outcome === "follow_up_required") {
    toStatus = "on_hold";
  } else if (outcome === "wrong_number") {
    toStatus = "lost";
  } else if (outcome === "not_interested") {
    toStatus = "lost";
  } else if (outcome === "no_answer" || outcome === "voicemail") {
    toStatus = "on_hold";
  }

  if (toStatus && toStatus !== lead.status) {
    const transition = validateLeadStageChange({
      from: fromStatus,
      to: toStatus,
      reason: `Call outcome: ${outcome}`,
    });
    if (!transition.ok) {
      // Don't fail the call record; just skip a stage transition that violates rules.
      toStatus = null;
    }

    // Keep parity with changeLeadStatus: require estimatedValue when touching value stages.
    if (
      toStatus &&
      (VALUE_STATUSES.includes(fromStatus) || VALUE_STATUSES.includes(toStatus)) &&
      !(lead.estimatedValue || 0)
    ) {
      toStatus = null;
    }

    if (toStatus) {
      lead.status = toStatus;
      lead.updatedBy = gate.staff.email;
      await lead.save();

      await LeadActivity.create({
        leadId: lead._id,
        eventType: "status_change",
        fromStatus,
        toStatus,
        reason: `Call outcome: ${outcome}`,
        expectedValue: lead.estimatedValue,
        createdBy: gate.staff.email,
      });
    }
  }

  // Schedule follow-up when needed
  if (outcome === "follow_up_required") {
    if (!nextFollowUpAt) {
      return { error: "Next follow-up date/time is required for follow-up outcomes." };
    }

    const followUp = await FollowUp.create({
      leadId: lead._id,
      callId: call._id,
      assigneeId: gate.staff.userId,
      assigneeEmail: gate.staff.email,
      dueAt: nextFollowUpAt,
      status: "pending",
      notes: "",
      createdBy: gate.staff.email,
      updatedBy: gate.staff.email,
    });

    await notifyStaff({
      type: "followup",
      title: "Follow-up scheduled",
      body: `Due ${nextFollowUpAt.toLocaleString()} · ${lead.name}`,
      href: `/admin/os/follow-ups`,
      conversionUuid: lead.conversionUuid || undefined,
      recipientEmail: gate.staff.email,
    });

    await logActivity({
      title: "Follow-up scheduled",
      detail: `${lead.name} · due ${nextFollowUpAt.toISOString()}`,
      createdBy: gate.staff.email,
      conversionUuid: lead.conversionUuid || undefined,
      leadId: String(lead._id),
      entityType: "followup",
      entityId: String(followUp._id),
    });

    await LeadActivity.create({
      leadId: lead._id,
      eventType: "note",
      note: `Follow-up scheduled · due ${nextFollowUpAt.toISOString()}`,
      createdBy: gate.staff.email,
    });
  }

  await LeadActivity.create({
    leadId: lead._id,
    eventType: "note",
    note: `Call recorded · ${outcome}`,
    createdBy: gate.staff.email,
  });

  await logActivity({
    title: "Call recorded",
    detail: `${lead.name} · ${outcome}`,
    createdBy: gate.staff.email,
    conversionUuid: lead.conversionUuid || undefined,
    leadId: String(lead._id),
    entityType: "call",
    entityId: String(call._id),
  });

  revalidateSales();
  // Stay on page; if user started from a dedicated "calling" UI they'll navigate later
  return { success: "Call saved" };
}

