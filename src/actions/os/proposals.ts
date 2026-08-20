"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity, notifyStaff } from "@/lib/os/activity";
import { num, str } from "@/lib/os/form";
import {
  type ProposalStatus,
  PROPOSAL_STATUSES,
} from "@/lib/os/constants";
import type { ActionState } from "@/actions/auth";
import { Proposal } from "@/models/os/Proposal";
import { Lead } from "@/models/os/Lead";
import { LeadActivity } from "@/models/os/LeadActivity";
import { validateLeadStageChange } from "@/lib/os/services";

function revalidateSales() {
  revalidatePath("/admin/os", "layout");
  revalidatePath("/admin/os/proposals", "page");
  revalidatePath("/admin/os/pipeline", "page");
  revalidatePath("/admin/os/leads", "page");
}

export async function createProposal(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("proposals:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const leadId = str(formData, "leadId");
  const title = str(formData, "title");
  const summary = str(formData, "summary");
  const amount = num(formData, "amount");
  const status = (str(formData, "status") || "sent") as ProposalStatus;

  if (!leadId) return { error: "Lead is required" };
  if (!title) return { error: "Title is required" };
  if (!PROPOSAL_STATUSES.includes(status)) return { error: "Invalid proposal status" };

  const lead = await Lead.findById(leadId);
  if (!lead || lead.recordStatus !== "active") return { error: "Lead not found" };
  if (lead.status === "converted") return { error: "Converted leads are locked" };

  const proposal = await Proposal.create({
    leadId: lead._id,
    title,
    summary,
    amount,
    status,
    sentAt: status === "sent" || status === "viewed" || status === "negotiation" ? new Date() : undefined,
    viewedAt: status === "viewed" ? new Date() : undefined,
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  // Drive opportunity stage into proposal/negotiation
  const desiredLeadStatus = status === "negotiation" ? "negotiation" : "proposal";
  if (desiredLeadStatus !== lead.status) {
    const fromStatus = lead.status as any;
    const transition = validateLeadStageChange({
      from: fromStatus,
      to: desiredLeadStatus as any,
      reason: `Proposal created · ${status}`,
    });
    if (transition.ok) {
      lead.status = desiredLeadStatus as any;
      lead.updatedBy = gate.staff.email;
      await lead.save();
      await LeadActivity.create({
        leadId: lead._id,
        eventType: "status_change",
        fromStatus,
        toStatus: desiredLeadStatus as any,
        reason: `Proposal created · ${status}`,
        expectedValue: lead.estimatedValue,
        createdBy: gate.staff.email,
      });
    }
  }

  await logActivity({
    title: "Proposal created",
    detail: `${lead.name} · ${proposal.title}`,
    createdBy: gate.staff.email,
    conversionUuid: lead.conversionUuid || undefined,
    leadId: String(lead._id),
    entityType: "proposal",
    entityId: String(proposal._id),
  });

  await notifyStaff({
    type: "proposal",
    title: "New proposal created",
    body: `${lead.name} · ${proposal.title}`,
    href: `/admin/os/leads/${lead._id}`,
    conversionUuid: lead.conversionUuid || undefined,
  });

  revalidateSales();
  return { success: "Proposal created" };
}

export async function updateProposalStatus(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("proposals:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const id = str(formData, "id");
  const status = str(formData, "status") as ProposalStatus;
  const reason = str(formData, "reason");

  if (!id) return { error: "Proposal id is required" };
  if (!PROPOSAL_STATUSES.includes(status)) return { error: "Invalid proposal status" };
  if (!reason) return { error: "Reason is required" };

  const proposal = await Proposal.findById(id);
  if (!proposal || proposal.recordStatus !== "active") return { error: "Proposal not found" };

  proposal.status = status;
  proposal.updatedBy = gate.staff.email;

  if (status === "sent") proposal.sentAt = new Date();
  if (status === "viewed") proposal.viewedAt = new Date();
  if (status === "accepted") proposal.acceptedAt = new Date();
  if (status === "rejected") proposal.rejectedAt = new Date();
  if (status === "expired") proposal.expiresAt = new Date();

  await proposal.save();

  const lead = await Lead.findById(proposal.leadId);
  if (lead && lead.recordStatus === "active") {
    let desired: any = null;
    if (status === "accepted") desired = "negotiation";
    else if (status === "rejected") desired = "lost";
    else if (status === "expired") desired = "on_hold";
    else if (status === "negotiation") desired = "negotiation";
    else desired = "proposal";

    if (desired && desired !== lead.status) {
      const transition = validateLeadStageChange({
        from: lead.status as any,
        to: desired as any,
        reason,
      });
      if (transition.ok) {
        const fromStatus = lead.status as any;
        lead.status = desired;
        lead.updatedBy = gate.staff.email;
        await lead.save();

        await LeadActivity.create({
          leadId: lead._id,
          eventType: "status_change",
          fromStatus,
          toStatus: desired,
          reason,
          expectedValue: lead.estimatedValue,
          createdBy: gate.staff.email,
        });
      }
    }
  }

  await logActivity({
    title: "Proposal status updated",
    detail: `${proposal.title} · ${status}`,
    createdBy: gate.staff.email,
    conversionUuid: lead?.conversionUuid || undefined,
    leadId: lead?._id ? String(lead._id) : undefined,
    entityType: "proposal",
    entityId: String(proposal._id),
  });

  revalidateSales();
  return { success: "Proposal updated" };
}

