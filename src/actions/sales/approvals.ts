"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SalesApproval } from "@/models/sales/SalesApproval";
import { requireSalesAction } from "@/lib/sales/guard";
import { logSalesActivity, writeSalesAudit } from "@/lib/sales/activity";
import { SALES_APPROVAL_TYPES } from "@/lib/sales/constants";
import type { ActionState } from "@/actions/auth";

const requestSchema = z.object({
  type: z.enum(SALES_APPROVAL_TYPES),
  dealId: z.string().optional(),
  requestedValue: z.string().optional(),
  reason: z.string().min(2, "Reason is required"),
});

export async function requestSalesApproval(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("admin.approvals");
  if (!gate.ok) return { error: gate.error };

  const parsed = requestSchema.safeParse({
    type: formData.get("type"),
    dealId: formData.get("dealId") || undefined,
    requestedValue: formData.get("requestedValue") || undefined,
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  await SalesApproval.create({
    type: parsed.data.type,
    dealId: parsed.data.dealId || undefined,
    requesterEmployeeId: gate.employee.employeeId,
    requestedValue: parsed.data.requestedValue || "",
    reason: parsed.data.reason,
    status: "pending",
  });

  await logSalesActivity({
    type: "deal_updated",
    title: `Approval requested (${parsed.data.type})`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
  });

  revalidatePath("/sales/employee/approvals");
  return { success: "Approval requested." };
}

const decideSchema = z.object({
  approvalId: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
  reviewerComment: z.string().optional(),
});

export async function decideSalesApproval(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction();
  if (!gate.ok) return { error: gate.error };
  if (!gate.employee.isSalesAdmin) return { error: "Sales admin access required" };

  const parsed = decideSchema.safeParse({
    approvalId: formData.get("approvalId"),
    decision: formData.get("decision"),
    reviewerComment: formData.get("reviewerComment") || undefined,
  });
  if (!parsed.success) return { error: "Invalid input" };

  await connectDB();
  const approval = await SalesApproval.findById(parsed.data.approvalId);
  if (!approval) return { error: "Approval not found" };

  approval.status = parsed.data.decision;
  approval.reviewerEmployeeId = gate.employee.employeeId as unknown as typeof approval.reviewerEmployeeId;
  approval.reviewerComment = parsed.data.reviewerComment || "";
  approval.decidedAt = new Date();
  await approval.save();

  await writeSalesAudit({
    action: "approval_decided",
    entityType: "SalesApproval",
    entityId: approval._id.toString(),
    newValue: parsed.data.decision,
    reason: parsed.data.reviewerComment || "",
    actorEmail: gate.employee.email,
  });

  revalidatePath("/sales/admin/approvals");
  revalidatePath("/sales/employee/approvals");
  return { success: `Approval ${parsed.data.decision}.` };
}
