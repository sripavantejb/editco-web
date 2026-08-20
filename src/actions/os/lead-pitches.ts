"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity } from "@/lib/os/activity";
import { str } from "@/lib/os/form";
import { PITCH_STATUSES, type PitchStatus } from "@/lib/os/constants";
import { Lead } from "@/models/os/Lead";
import { LeadActivity } from "@/models/os/LeadActivity";
import { LeadProjectPitch } from "@/models/os/LeadProjectPitch";
import { VaultProject } from "@/models/os/VaultProject";
import type { ActionState } from "@/actions/auth";

function revalidatePitch(leadId: string, projectId?: string) {
  revalidatePath("/admin/os/leads", "layout");
  revalidatePath(`/admin/os/leads/${leadId}`, "layout");
  revalidatePath("/admin/os/projects-vault", "layout");
  if (projectId) {
    revalidatePath(`/admin/os/projects-vault/${projectId}`, "layout");
  }
}

export type PitchActionState = ActionState & {
  convertHint?: boolean;
};

export async function addLeadProjectPitch(
  _prev: PitchActionState,
  formData: FormData
): Promise<PitchActionState> {
  const gate = await requireStaff("leads:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const leadId = str(formData, "leadId");
  const projectId = str(formData, "projectId");
  const notes = str(formData, "notes");
  const statusRaw = (str(formData, "status") || "pitched") as PitchStatus;

  if (!leadId || !projectId) return { error: "Lead and project are required" };
  if (!PITCH_STATUSES.includes(statusRaw)) return { error: "Invalid pitch status" };

  const [lead, project] = await Promise.all([
    Lead.findById(leadId),
    VaultProject.findById(projectId),
  ]);
  if (!lead || lead.recordStatus !== "active") return { error: "Lead not found" };
  if (!project || project.recordStatus !== "active") {
    return { error: "Vault project not found" };
  }
  if (project.status !== "active") {
    return { error: "Only active vault projects can be pitched" };
  }

  const existing = await LeadProjectPitch.findOne({
    leadId,
    projectId,
    recordStatus: "active",
  });

  if (existing) {
    existing.attemptCount = (existing.attemptCount || 1) + 1;
    existing.pitchedAt = new Date();
    existing.pitchedBy = gate.staff.name || gate.staff.email;
    existing.updatedBy = gate.staff.email;
    if (notes) existing.notes = notes;
    await existing.save();

    await LeadActivity.create({
      leadId,
      eventType: "note",
      note: `Re-pitched ${project.name} (attempt ${existing.attemptCount})`,
      createdBy: gate.staff.email,
    });
    await logActivity({
      title: "Project re-pitched",
      detail: `${lead.name} → ${project.name}`,
      createdBy: gate.staff.email,
      leadId,
      entityType: "lead_pitch",
      entityId: existing._id.toString(),
    });
    revalidatePitch(leadId, projectId);
    return { success: `Updated pitch for ${project.name}` };
  }

  const pitch = await LeadProjectPitch.create({
    leadId,
    projectId,
    projectName: project.name,
    pitchedBy: gate.staff.name || gate.staff.email,
    pitchedAt: new Date(),
    status: statusRaw,
    notes,
    attemptCount: 1,
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  await LeadActivity.create({
    leadId,
    eventType: "note",
    note: `Pitched ${project.name}`,
    createdBy: gate.staff.email,
  });
  await logActivity({
    title: "Project pitched",
    detail: `${lead.name} → ${project.name}`,
    createdBy: gate.staff.email,
    leadId,
    entityType: "lead_pitch",
    entityId: pitch._id.toString(),
  });

  revalidatePitch(leadId, projectId);
  return { success: `Pitched ${project.name}` };
}

export async function updateLeadPitchStatus(
  _prev: PitchActionState,
  formData: FormData
): Promise<PitchActionState> {
  const gate = await requireStaff("leads:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const pitchId = str(formData, "pitchId");
  const status = str(formData, "status") as PitchStatus;
  const notes = str(formData, "notes");

  if (!PITCH_STATUSES.includes(status)) return { error: "Invalid pitch status" };

  const pitch = await LeadProjectPitch.findById(pitchId);
  if (!pitch || pitch.recordStatus !== "active") {
    return { error: "Pitch not found" };
  }

  const from = pitch.status;
  pitch.status = status;
  if (notes) pitch.notes = notes;
  pitch.updatedBy = gate.staff.email;
  await pitch.save();

  const leadId = String(pitch.leadId);
  const projectId = String(pitch.projectId);
  const label = pitch.projectName || "project";

  await LeadActivity.create({
    leadId: pitch.leadId,
    eventType: "note",
    note: `Pitch ${label}: ${from} → ${status}`,
    createdBy: gate.staff.email,
  });
  await logActivity({
    title: `Pitch status: ${from} → ${status}`,
    detail: `${label}`,
    createdBy: gate.staff.email,
    leadId,
    entityType: "lead_pitch",
    entityId: pitchId,
  });

  revalidatePitch(leadId, projectId);

  if (status === "won") {
    return {
      success: `Marked ${label} as won. Use Convert Lead to create the client conversion.`,
      convertHint: true,
    };
  }
  return { success: "Pitch status updated" };
}

export async function removeLeadProjectPitch(
  formData: FormData
): Promise<void> {
  const gate = await requireStaff("leads:write");
  if (!gate.ok) return;
  await connectDB();
  const pitchId = str(formData, "pitchId");
  const pitch = await LeadProjectPitch.findById(pitchId);
  if (!pitch) return;
  pitch.recordStatus = "archived";
  pitch.updatedBy = gate.staff.email;
  await pitch.save();
  revalidatePitch(String(pitch.leadId), String(pitch.projectId));
}
