"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { SalesLead } from "@/models/sales/SalesLead";
import { requireSalesAction } from "@/lib/sales/guard";
import { logSalesActivity } from "@/lib/sales/activity";
import { SALES_DEAL_STAGES, SALES_LOST_REASONS } from "@/lib/sales/constants";
import type { ActionState } from "@/actions/auth";

const createSchema = z.object({
  dealName: z.string().min(2, "Deal name is required"),
  leadId: z.string().optional(),
  value: z.string().optional(),
  probability: z.string().optional(),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function createSalesDeal(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("sales.deals");
  if (!gate.ok) return { error: gate.error };

  const parsed = createSchema.safeParse({
    dealName: formData.get("dealName"),
    leadId: formData.get("leadId") || undefined,
    value: formData.get("value") || undefined,
    probability: formData.get("probability") || undefined,
    expectedCloseDate: formData.get("expectedCloseDate") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  const deal = await SalesDeal.create({
    dealName: parsed.data.dealName,
    leadId: parsed.data.leadId || undefined,
    value: Number(parsed.data.value || 0),
    probability: Number(parsed.data.probability || 10),
    expectedCloseDate: parsed.data.expectedCloseDate ? new Date(parsed.data.expectedCloseDate) : undefined,
    notes: parsed.data.notes || "",
    ownerEmployeeId: gate.employee.employeeId,
    stage: "new",
    lastActivityAt: new Date(),
    createdBy: gate.employee.email,
    updatedBy: gate.employee.email,
  });

  await logSalesActivity({
    type: "deal_created",
    title: `Deal created: ${parsed.data.dealName}`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    dealId: deal._id.toString(),
  });

  revalidatePath("/sales/employee/deals");
  revalidatePath("/sales/employee/pipeline");
  redirect(`/sales/employee/deals/${deal._id.toString()}`);
}

const moveSchema = z.object({
  dealId: z.string().min(1),
  stage: z.enum(SALES_DEAL_STAGES),
});

export async function moveSalesDealStage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("sales.pipeline");
  if (!gate.ok) return { error: gate.error };

  const parsed = moveSchema.safeParse({
    dealId: formData.get("dealId"),
    stage: formData.get("stage"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  const deal = await SalesDeal.findById(parsed.data.dealId);
  if (!deal) return { error: "Deal not found" };

  const oldStage = deal.stage;
  deal.stage = parsed.data.stage;
  deal.lastActivityAt = new Date();
  deal.updatedBy = gate.employee.email;
  if (parsed.data.stage === "won" || parsed.data.stage === "lost") {
    deal.closedAt = new Date();
  }
  await deal.save();

  await logSalesActivity({
    type: "deal_moved",
    title: `Deal moved from ${oldStage} to ${parsed.data.stage}`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    dealId: deal._id.toString(),
  });

  revalidatePath("/sales/employee/pipeline");
  revalidatePath("/sales/employee/deals");
  revalidatePath(`/sales/employee/deals/${parsed.data.dealId}`);
  return { success: "Deal moved." };
}

const negotiationSchema = z.object({
  dealId: z.string().min(1),
  competitor: z.string().optional(),
  discountRequested: z.string().optional(),
  discountApproved: z.string().optional(),
  currentOffer: z.string().optional(),
  notes: z.string().optional(),
});

export async function updateSalesDealNegotiation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("sales.negotiation");
  if (!gate.ok) return { error: gate.error };

  const parsed = negotiationSchema.safeParse({
    dealId: formData.get("dealId"),
    competitor: formData.get("competitor") || undefined,
    discountRequested: formData.get("discountRequested") || undefined,
    discountApproved: formData.get("discountApproved") || undefined,
    currentOffer: formData.get("currentOffer") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: "Invalid input" };

  await connectDB();
  const deal = await SalesDeal.findById(parsed.data.dealId);
  if (!deal) return { error: "Deal not found" };

  deal.competitor = parsed.data.competitor || "";
  deal.discountRequested = Number(parsed.data.discountRequested || 0);
  deal.discountApproved = Number(parsed.data.discountApproved || 0);
  deal.currentOffer = Number(parsed.data.currentOffer || 0);
  deal.notes = parsed.data.notes || deal.notes;
  deal.lastActivityAt = new Date();
  deal.updatedBy = gate.employee.email;
  await deal.save();

  await logSalesActivity({
    type: "deal_updated",
    title: "Negotiation updated",
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    dealId: deal._id.toString(),
  });

  revalidatePath(`/sales/employee/deals/${parsed.data.dealId}`);
  return { success: "Negotiation saved." };
}

const closureSchema = z.object({
  dealId: z.string().min(1),
  outcome: z.enum(["won", "lost"]),
  finalOffer: z.string().optional(),
  paymentStatus: z.string().optional(),
  lostReason: z.enum([...SALES_LOST_REASONS, ""]).optional(),
  lostNotes: z.string().optional(),
});

export async function closeSalesDeal(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("sales.closure");
  if (!gate.ok) return { error: gate.error };

  const parsed = closureSchema.safeParse({
    dealId: formData.get("dealId"),
    outcome: formData.get("outcome"),
    finalOffer: formData.get("finalOffer") || undefined,
    paymentStatus: formData.get("paymentStatus") || undefined,
    lostReason: formData.get("lostReason") || "",
    lostNotes: formData.get("lostNotes") || undefined,
  });
  if (!parsed.success) return { error: "Invalid input" };

  await connectDB();
  const deal = await SalesDeal.findById(parsed.data.dealId);
  if (!deal) return { error: "Deal not found" };

  deal.stage = parsed.data.outcome;
  deal.closedAt = new Date();
  deal.finalOffer = Number(parsed.data.finalOffer || deal.value);
  deal.paymentStatus = parsed.data.paymentStatus || "";
  deal.lostReason = parsed.data.outcome === "lost" ? parsed.data.lostReason || "other" : "";
  deal.lostNotes = parsed.data.lostNotes || "";
  deal.updatedBy = gate.employee.email;
  await deal.save();

  if (parsed.data.outcome === "won" && deal.leadId) {
    await SalesLead.findByIdAndUpdate(deal.leadId, { status: "converted", updatedBy: gate.employee.email });
  }

  await logSalesActivity({
    type: parsed.data.outcome === "won" ? "deal_won" : "deal_lost",
    title: `Deal ${parsed.data.outcome === "won" ? "won" : "lost"}: ${deal.dealName}`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    dealId: deal._id.toString(),
  });

  revalidatePath("/sales/employee/pipeline");
  revalidatePath("/sales/employee/deals");
  revalidatePath(`/sales/employee/deals/${parsed.data.dealId}`);
  return { success: `Deal marked ${parsed.data.outcome}.` };
}
