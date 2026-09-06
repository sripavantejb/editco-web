"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity } from "@/lib/os/activity";
import { csv, str } from "@/lib/os/form";
import type { ActionState } from "@/actions/auth";
import { LeadList } from "@/models/os/LeadList";

function revalidateLeads() {
  revalidatePath("/admin/os", "layout");
  revalidatePath("/admin/os/leads", "page");
  revalidatePath("/admin/os/leads/lists", "page");
}

export async function createLeadList(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("leads:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const name = str(formData, "name");
  const description = str(formData, "description");
  const statuses = csv(formData, "statuses");
  const sources = csv(formData, "sources");
  const priorities = csv(formData, "priorities");
  const excludeStatuses = csv(formData, "excludeStatuses");
  const industry = str(formData, "industry");
  const assignedOwner = str(formData, "assignedOwner");

  if (!name) return { error: "List name is required" };

  const filters: Record<string, unknown> = {};
  if (statuses.length) filters.status = statuses;
  if (excludeStatuses.length) filters.excludeStatuses = excludeStatuses;
  if (sources.length) filters.source = sources;
  if (priorities.length) filters.priority = priorities;
  if (industry) filters.industry = industry;
  if (assignedOwner) filters.assignedOwner = assignedOwner;

  const list = await LeadList.create({
    name,
    description,
    filters,
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  await logActivity({
    title: "Lead list created",
    detail: name,
    createdBy: gate.staff.email,
    leadId: undefined,
    entityType: "lead_list",
    entityId: list._id.toString(),
  });

  revalidateLeads();
  redirect(`/admin/os/leads/lists/${list._id}`);
}

export async function archiveLeadList(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("leads:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const list = await LeadList.findById(str(formData, "id"));
  if (!list || list.recordStatus !== "active") {
    return { error: "Lead list not found" };
  }
  list.recordStatus = "archived";
  list.updatedBy = gate.staff.email;
  await list.save();
  await logActivity({
    title: "Lead list deleted",
    detail: list.name,
    createdBy: gate.staff.email,
    entityType: "lead_list",
    entityId: list._id.toString(),
  });
  revalidateLeads();
  return { success: "Lead list deleted" };
}

