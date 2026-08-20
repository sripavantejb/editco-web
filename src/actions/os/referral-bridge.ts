"use server";

import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity, notifyStaff } from "@/lib/os/activity";
import { str } from "@/lib/os/form";
import { Referral } from "@/models/Referral";
import { Lead } from "@/models/os/Lead";
import { LeadActivity } from "@/models/os/LeadActivity";

export async function promoteReferralToLead(formData: FormData): Promise<void> {
  const gate = await requireStaff("leads:write");
  if (!gate.ok) return;
  await connectDB();
  const referralId = str(formData, "referralId");
  const referral = await Referral.findById(referralId);
  if (!referral) return;

  const existing = await Lead.findOne({ referralId: referral._id });
  if (existing) {
    redirect(`/admin/os/leads/${existing._id}`);
  }

  const lead = await Lead.create({
    name: referral.referredName,
    company: referral.referredBusiness || "",
    phone: referral.referredPhone || "",
    email: referral.referredEmail || "",
    source: "referral",
    requirement: referral.referredNeeds || "",
    estimatedValue: referral.projectValue || 0,
    assignedOwner: gate.staff.name,
    status: "new",
    notes: referral.adminInternalNotes || referral.referrerNotes || "",
    referralId: referral._id,
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  await LeadActivity.create({
    leadId: lead._id,
    eventType: "created",
    toStatus: "new",
    reason: "Promoted from Refer & Earn",
    createdBy: gate.staff.email,
  });
  await logActivity({
    title: "Lead created from referral",
    detail: referral.referredName,
    createdBy: gate.staff.email,
    leadId: lead._id.toString(),
    entityType: "lead",
    entityId: lead._id.toString(),
  });
  await notifyStaff({
    type: "lead",
    title: "Referral promoted to CRM lead",
    body: referral.referredName,
    href: `/admin/os/leads/${lead._id}`,
    recipientEmail: gate.staff.email,
  });

  redirect(`/admin/os/leads/${lead._id}`);
}
