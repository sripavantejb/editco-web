"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SalesCall } from "@/models/sales/SalesCall";
import { requireSalesAction } from "@/lib/sales/guard";
import { logSalesActivity } from "@/lib/sales/activity";
import { SALES_CALL_OUTCOMES } from "@/lib/sales/constants";
import type { ActionState } from "@/actions/auth";

const schema = z.object({
  leadId: z.string().optional(),
  durationMinutes: z.string().optional(),
  outcome: z.enum(SALES_CALL_OUTCOMES).optional(),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  nextFollowUpAt: z.string().optional(),
});

export async function logSalesCall(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("comm.calls");
  if (!gate.ok) return { error: gate.error };

  const parsed = schema.safeParse({
    leadId: formData.get("leadId") || undefined,
    durationMinutes: formData.get("durationMinutes") || undefined,
    outcome: formData.get("outcome") || undefined,
    notes: formData.get("notes") || undefined,
    nextAction: formData.get("nextAction") || undefined,
    nextFollowUpAt: formData.get("nextFollowUpAt") || undefined,
  });
  if (!parsed.success) return { error: "Invalid input" };

  await connectDB();
  const call = await SalesCall.create({
    leadId: parsed.data.leadId || undefined,
    employeeId: gate.employee.employeeId,
    durationMinutes: Number(parsed.data.durationMinutes || 0),
    outcome: parsed.data.outcome || "connected",
    notes: parsed.data.notes || "",
    nextAction: parsed.data.nextAction || "",
    nextFollowUpAt: parsed.data.nextFollowUpAt ? new Date(parsed.data.nextFollowUpAt) : undefined,
    createdBy: gate.employee.email,
  });

  if (parsed.data.leadId) {
    const { SalesLead } = await import("@/models/sales/SalesLead");
    await SalesLead.findByIdAndUpdate(parsed.data.leadId, { lastContactedAt: new Date() });
  }

  await logSalesActivity({
    type: "call_logged",
    title: `Call logged (${parsed.data.outcome || "connected"})`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    leadId: parsed.data.leadId,
    metadata: { callId: call._id.toString() },
  });

  revalidatePath("/sales/employee/calls");
  if (parsed.data.leadId) revalidatePath(`/sales/employee/leads/${parsed.data.leadId}`);
  return { success: "Call logged." };
}
