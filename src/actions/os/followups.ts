"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity } from "@/lib/os/activity";
import { optDate, str } from "@/lib/os/form";
import {
  FOLLOWUP_STATUSES,
  type FollowUpStatus,
} from "@/lib/os/constants";
import { FollowUp } from "@/models/os/FollowUp";
import { Lead } from "@/models/os/Lead";
import { LeadActivity } from "@/models/os/LeadActivity";
import type { ActionState } from "@/actions/auth";
import { validateLeadStageChange } from "@/lib/os/services";

function revalidateSales() {
  revalidatePath("/admin/os", "layout");
  revalidatePath("/admin/os/follow-ups", "page");
  revalidatePath("/admin/os/leads", "page");
  revalidatePath("/admin/os/leads", "layout");
}

export async function createFollowUp(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("followups:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const leadId = str(formData, "leadId");
  const dueAt = optDate(formData, "dueAt");
  const notes = str(formData, "notes");

  if (!leadId) return { error: "Lead is required" };
  if (!dueAt) return { error: "Due date/time is required" };

  const lead = await Lead.findById(leadId);
  if (!lead || lead.recordStatus !== "active") return { error: "Lead not found" };
  if (lead.status === "converted") {
    return { error: "Converted leads are locked" };
  }

  const followUp = await FollowUp.create({
    leadId: lead._id,
    assigneeId: gate.staff.userId,
    assigneeEmail: gate.staff.email,
    dueAt,
    status: "pending",
    notes,
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  await LeadActivity.create({
    leadId: lead._id,
    eventType: "note",
    note: `Follow-up scheduled · due ${dueAt.toISOString()}${notes ? ` · ${notes}` : ""}`,
    createdBy: gate.staff.email,
  });

  await logActivity({
    title: "Follow-up scheduled",
    detail: `${lead.name} · due ${dueAt.toISOString()}`,
    createdBy: gate.staff.email,
    leadId: String(lead._id),
    entityType: "followup",
    entityId: String(followUp._id),
  });

  revalidateSales();
  revalidatePath(`/admin/os/leads/${leadId}`);
  return { success: "Follow-up scheduled" };
}

export async function updateFollowUpStatus(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("followups:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const id = str(formData, "id");
  const status = str(formData, "status") as FollowUpStatus;
  const dueAt = optDate(formData, "dueAt");

  if (!id) return { error: "Follow-up id is required" };
  if (!FOLLOWUP_STATUSES.includes(status)) return { error: "Invalid status" };

  const followUp = await FollowUp.findById(id);
  if (!followUp || followUp.recordStatus !== "active") {
    return { error: "Follow-up not found" };
  }

  if ((status === "pending" || status === "rescheduled") && !dueAt) {
    return { error: "Due date/time is required" };
  }

  followUp.status = status;
  followUp.updatedBy = gate.staff.email;

  if (status === "completed") {
    followUp.completedAt = new Date();
  } else if (status === "cancelled") {
    followUp.completedAt = undefined;
  } else if (dueAt) {
    followUp.dueAt = dueAt;
    if (status === "rescheduled") {
      followUp.completedAt = undefined;
    }
  }

  await followUp.save();

  const lead = await Lead.findById(followUp.leadId);

  // Minimal lifecycle polish: completing a follow-up moves the lead out of "on_hold" when allowed.
  if (status === "completed" && lead && lead.status === "on_hold") {
    const transition = validateLeadStageChange({
      from: "on_hold",
      to: "contacted",
      reason: "Follow-up completed",
    });
    if (transition.ok) {
      const fromStatus = lead.status;
      lead.status = "contacted" as any;
      lead.updatedBy = gate.staff.email;
      await lead.save();

      await LeadActivity.create({
        leadId: lead._id,
        eventType: "status_change",
        fromStatus,
        toStatus: "contacted" as any,
        reason: "Follow-up completed",
        expectedValue: lead.estimatedValue,
        createdBy: gate.staff.email,
      });
    }
  }

  const leadLean = lead ? await lead.lean() : null;

  await logActivity({
    title: "Follow-up updated",
    detail: `${leadLean?.name || "Lead"} · ${status}`,
    createdBy: gate.staff.email,
    conversionUuid: leadLean?.conversionUuid || undefined,
    leadId: leadLean?._id ? String(leadLean._id) : String(followUp.leadId),
    entityType: "followup",
    entityId: String(followUp._id),
  });

  revalidateSales();
  return { success: "Follow-up updated" };
}

export async function archiveFollowUp(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("followups:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const followUp = await FollowUp.findById(str(formData, "id"));
  if (!followUp || followUp.recordStatus !== "active") {
    return { error: "Follow-up not found" };
  }
  followUp.recordStatus = "archived";
  followUp.updatedBy = gate.staff.email;
  await followUp.save();
  revalidateSales();
  revalidatePath("/admin/os/follow-ups");
  return { success: "Follow-up deleted" };
}

