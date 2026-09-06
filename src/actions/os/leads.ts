"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity, notifyStaff } from "@/lib/os/activity";
import { num, str } from "@/lib/os/form";
import {
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  type LeadStatus,
} from "@/lib/os/constants";
import { Lead } from "@/models/os/Lead";
import { LeadActivity } from "@/models/os/LeadActivity";
import { validateLeadStageChange } from "@/lib/os/services";
import type { ActionState } from "@/actions/auth";

function revalidateLeads() {
  revalidatePath("/admin/os", "layout");
  revalidatePath("/admin/os/leads", "layout");
  revalidatePath("/admin/os/pipeline", "layout");
}

const VALUE_STATUSES: LeadStatus[] = ["qualified", "proposal", "negotiation"];

const createSchema = z.object({
  name: z.string().min(2, "Lead name is required"),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  source: z.enum(LEAD_SOURCES).optional(),
  industry: z.string().optional(),
  industrySlug: z.string().optional(),
  sector: z.string().optional(),
  interestedServices: z.array(z.string()).optional(),
  requirement: z.string().optional(),
  estimatedValue: z.number().optional(),
  assignedOwner: z.string().optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  priority: z.enum(LEAD_PRIORITIES).optional(),
  notes: z.string().optional(),
  referralId: z.string().optional(),
});

export async function createLead(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("leads:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const interestedServices = formData
    .getAll("interestedServices")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const parsed = createSchema.safeParse({
    name: str(formData, "name"),
    company: str(formData, "company"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    source: str(formData, "source") || "inbound",
    industry: str(formData, "industry"),
    industrySlug: str(formData, "industrySlug"),
    sector: str(formData, "sector"),
    interestedServices,
    requirement: str(formData, "requirement"),
    estimatedValue: num(formData, "estimatedValue"),
    assignedOwner: str(formData, "assignedOwner") || gate.staff.name,
    status: str(formData, "status") || "new",
    priority: str(formData, "priority") || "medium",
    notes: str(formData, "notes"),
    referralId: str(formData, "referralId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid lead" };
  }

  const lead = await Lead.create({
    ...parsed.data,
    interestedServices: parsed.data.interestedServices || [],
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  const vaultProjectIds = formData
    .getAll("vaultProjectIds")
    .map((v) => String(v).trim())
    .filter(Boolean);
  if (vaultProjectIds.length > 0) {
    const { VaultProject } = await import("@/models/os/VaultProject");
    const { LeadProjectPitch } = await import("@/models/os/LeadProjectPitch");
    const projects = await VaultProject.find({
      _id: { $in: vaultProjectIds },
      recordStatus: "active",
      status: "active",
    }).lean();
    if (projects.length) {
      await LeadProjectPitch.insertMany(
        projects.map((p) => ({
          leadId: lead._id,
          projectId: p._id,
          projectName: p.name,
          pitchedBy: gate.staff.name || gate.staff.email,
          pitchedAt: new Date(),
          status: "pitched",
          attemptCount: 1,
          createdBy: gate.staff.email,
          updatedBy: gate.staff.email,
        }))
      );
    }
  }

  await LeadActivity.create({
    leadId: lead._id,
    eventType: "created",
    toStatus: lead.status,
    reason: "Lead created",
    expectedValue: lead.estimatedValue,
    createdBy: gate.staff.email,
  });
  await logActivity({
    title: "Lead created",
    detail: `${lead.name} (${lead.company || "no company"})`,
    createdBy: gate.staff.email,
    leadId: lead._id.toString(),
    entityType: "lead",
    entityId: lead._id.toString(),
  });
  if (lead.assignedOwner) {
    await notifyStaff({
      type: "lead",
      title: "New lead assigned",
      body: `${lead.name} assigned to ${lead.assignedOwner}`,
      href: `/admin/os/leads/${lead._id}`,
      recipientEmail: gate.staff.email,
    });
  }

  revalidateLeads();
  redirect(`/admin/os/leads/${lead._id}`);
}

export async function updateLeadDetails(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("leads:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const id = str(formData, "id");
  const lead = await Lead.findById(id);
  if (!lead || lead.recordStatus !== "active") return { error: "Lead not found" };
  if (lead.status === "converted") {
    return { error: "Converted leads are locked. Edit the vendor instead." };
  }

  const prevOwner = lead.assignedOwner;
  lead.company = str(formData, "company");
  lead.phone = str(formData, "phone");
  lead.email = str(formData, "email");
  lead.source = (str(formData, "source") || lead.source) as typeof lead.source;
  lead.industry = str(formData, "industry");
  lead.requirement = str(formData, "requirement");
  lead.estimatedValue = num(formData, "estimatedValue");
  lead.assignedOwner = str(formData, "assignedOwner");
  lead.priority = (str(formData, "priority") || lead.priority) as typeof lead.priority;
  lead.notes = str(formData, "notes");
  lead.updatedBy = gate.staff.email;
  await lead.save();

  if (prevOwner !== lead.assignedOwner) {
    await LeadActivity.create({
      leadId: lead._id,
      eventType: "assignment",
      note: `Assigned to ${lead.assignedOwner || "unassigned"}`,
      createdBy: gate.staff.email,
    });
    await logActivity({
      title: "Lead assigned",
      detail: `${lead.name} → ${lead.assignedOwner}`,
      createdBy: gate.staff.email,
      leadId: id,
      entityType: "lead",
      entityId: id,
    });
    await notifyStaff({
      type: "lead",
      title: "Lead assigned",
      body: `${lead.name} assigned to ${lead.assignedOwner}`,
      href: `/admin/os/leads/${id}`,
    });
  }

  revalidateLeads();
  return { success: "Lead updated" };
}

export async function changeLeadStatus(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("leads:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const id = str(formData, "id");
  const toStatus = str(formData, "status") as LeadStatus;
  const reason = str(formData, "reason");
  const expectedValue = num(formData, "expectedValue");

  if (!LEAD_STATUSES.includes(toStatus)) return { error: "Invalid status" };
  if (!reason) return { error: "A reason is required for every status change" };
  if (toStatus === "converted") {
    return { error: "Use Convert Lead to create a conversion UUID" };
  }

  const lead = await Lead.findById(id);
  if (!lead || lead.recordStatus !== "active") return { error: "Lead not found" };
  if (lead.status === "converted") return { error: "Lead already converted" };

  const fromStatus = lead.status as LeadStatus;
  if (fromStatus === toStatus) return { error: "Status is unchanged" };

  const transition = validateLeadStageChange({
    from: fromStatus,
    to: toStatus,
    reason,
  });
  if (!transition.ok) return { error: transition.error };

  if (
    VALUE_STATUSES.includes(fromStatus) ||
    VALUE_STATUSES.includes(toStatus)
  ) {
    if (!expectedValue && !lead.estimatedValue) {
      return { error: "Expected value is required at this stage" };
    }
  }

  lead.status = toStatus;
  if (expectedValue) lead.estimatedValue = expectedValue;
  lead.updatedBy = gate.staff.email;
  await lead.save();

  await LeadActivity.create({
    leadId: lead._id,
    eventType: "status_change",
    fromStatus,
    toStatus,
    reason,
    expectedValue: expectedValue || lead.estimatedValue,
    createdBy: gate.staff.email,
  });
  await logActivity({
    title: `Lead moved: ${fromStatus} → ${toStatus}`,
    detail: `${reason}${expectedValue ? ` · ₹${expectedValue}` : ""}`,
    createdBy: gate.staff.email,
    leadId: id,
    entityType: "lead",
    entityId: id,
  });

  revalidateLeads();
  return { success: "Status recorded" };
}

export async function archiveLead(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("leads:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const id = str(formData, "id");
  const lead = await Lead.findById(id);
  if (!lead) return { error: "Lead not found" };
  if (lead.status === "converted") {
    return { error: "Cannot delete a converted lead" };
  }
  lead.recordStatus = "archived";
  lead.updatedBy = gate.staff.email;
  await lead.save();
  revalidateLeads();
  return { success: "Lead deleted" };
}
