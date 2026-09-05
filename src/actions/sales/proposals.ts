"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SalesProposal } from "@/models/sales/SalesProposal";
import { requireSalesAction } from "@/lib/sales/guard";
import { logSalesActivity } from "@/lib/sales/activity";
import { SALES_PROPOSAL_STATUSES } from "@/lib/sales/constants";
import type { ActionState } from "@/actions/auth";

const createSchema = z.object({
  title: z.string().min(2, "Title is required"),
  dealId: z.string().optional(),
  scope: z.string().optional(),
  pricing: z.string().optional(),
  timeline: z.string().optional(),
  terms: z.string().optional(),
});

export async function createSalesProposal(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("docs.proposals");
  if (!gate.ok) return { error: gate.error };

  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    dealId: formData.get("dealId") || undefined,
    scope: formData.get("scope") || undefined,
    pricing: formData.get("pricing") || undefined,
    timeline: formData.get("timeline") || undefined,
    terms: formData.get("terms") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  await SalesProposal.create({
    title: parsed.data.title,
    dealId: parsed.data.dealId || undefined,
    ownerEmployeeId: gate.employee.employeeId,
    scope: parsed.data.scope || "",
    pricing: Number(parsed.data.pricing || 0),
    timeline: parsed.data.timeline || "",
    terms: parsed.data.terms || "",
    status: "draft",
    createdBy: gate.employee.email,
    updatedBy: gate.employee.email,
  });

  await logSalesActivity({
    type: "proposal_created",
    title: `Proposal created: ${parsed.data.title}`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    dealId: parsed.data.dealId,
  });

  revalidatePath("/sales/employee/proposals");
  return { success: "Proposal created." };
}

const statusSchema = z.object({
  proposalId: z.string().min(1),
  status: z.enum(SALES_PROPOSAL_STATUSES),
});

export async function updateSalesProposalStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("docs.proposals");
  if (!gate.ok) return { error: gate.error };

  const parsed = statusSchema.safeParse({
    proposalId: formData.get("proposalId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Invalid input" };

  await connectDB();
  const proposal = await SalesProposal.findById(parsed.data.proposalId);
  if (!proposal) return { error: "Proposal not found" };

  proposal.status = parsed.data.status;
  proposal.updatedBy = gate.employee.email;
  await proposal.save();

  await logSalesActivity({
    type: "proposal_created",
    title: `Proposal "${proposal.title}" marked ${parsed.data.status}`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
  });

  revalidatePath("/sales/employee/proposals");
  return { success: "Proposal updated." };
}
