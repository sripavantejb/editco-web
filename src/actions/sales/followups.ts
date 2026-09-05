"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SalesFollowUp } from "@/models/sales/SalesFollowUp";
import { requireSalesAction } from "@/lib/sales/guard";
import { logSalesActivity } from "@/lib/sales/activity";
import { SALES_FOLLOWUP_TYPES, SALES_LEAD_PRIORITIES } from "@/lib/sales/constants";
import type { ActionState } from "@/actions/auth";

const createSchema = z.object({
  leadId: z.string().optional(),
  type: z.enum(SALES_FOLLOWUP_TYPES).optional(),
  dueAt: z.string().min(1, "Due date is required"),
  priority: z.enum(SALES_LEAD_PRIORITIES).optional(),
  notes: z.string().optional(),
});

export async function createSalesFollowUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("comm.followups");
  if (!gate.ok) return { error: gate.error };

  const parsed = createSchema.safeParse({
    leadId: formData.get("leadId") || undefined,
    type: formData.get("type") || undefined,
    dueAt: formData.get("dueAt"),
    priority: formData.get("priority") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  const followUp = await SalesFollowUp.create({
    leadId: parsed.data.leadId || undefined,
    ownerEmployeeId: gate.employee.employeeId,
    type: parsed.data.type || "call",
    dueAt: new Date(parsed.data.dueAt),
    priority: parsed.data.priority || "medium",
    notes: parsed.data.notes || "",
    status: "pending",
    createdBy: gate.employee.email,
  });

  if (parsed.data.leadId) {
    const { SalesLead } = await import("@/models/sales/SalesLead");
    await SalesLead.findByIdAndUpdate(parsed.data.leadId, { nextFollowUpAt: new Date(parsed.data.dueAt) });
  }

  await logSalesActivity({
    type: "followup_completed",
    title: "Follow-up scheduled",
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    leadId: parsed.data.leadId,
    metadata: { followUpId: followUp._id.toString() },
  });

  revalidatePath("/sales/employee/follow-ups");
  return { success: "Follow-up scheduled." };
}

const completeSchema = z.object({
  followUpId: z.string().min(1),
  status: z.enum(["completed", "missed", "cancelled"]),
});

export async function updateSalesFollowUpStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("comm.followups");
  if (!gate.ok) return { error: gate.error };

  const parsed = completeSchema.safeParse({
    followUpId: formData.get("followUpId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Invalid input" };

  await connectDB();
  const followUp = await SalesFollowUp.findById(parsed.data.followUpId);
  if (!followUp) return { error: "Follow-up not found" };

  followUp.status = parsed.data.status;
  if (parsed.data.status === "completed") followUp.completedAt = new Date();
  await followUp.save();

  await logSalesActivity({
    type: "followup_completed",
    title: `Follow-up ${parsed.data.status}`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
  });

  revalidatePath("/sales/employee/follow-ups");
  return { success: "Follow-up updated." };
}
