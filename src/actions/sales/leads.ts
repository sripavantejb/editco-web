"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SalesLead } from "@/models/sales/SalesLead";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { requireSalesAction } from "@/lib/sales/guard";
import { logSalesActivity } from "@/lib/sales/activity";
import {
  SALES_LEAD_PRIORITIES,
  SALES_LEAD_SOURCES,
  SALES_LEAD_STATUSES,
  SALES_LEAD_TEMPERATURES,
} from "@/lib/sales/constants";
import type { ActionState } from "@/actions/auth";

const leadSchema = z.object({
  company: z.string().optional(),
  contactPerson: z.string().min(2, "Contact person is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  source: z.enum(SALES_LEAD_SOURCES).optional(),
  industry: z.string().optional(),
  requirement: z.string().optional(),
  priority: z.enum(SALES_LEAD_PRIORITIES).optional(),
  temperature: z.enum(SALES_LEAD_TEMPERATURES).optional(),
  notes: z.string().optional(),
});

export async function createSalesLead(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("leads.management");
  if (!gate.ok) return { error: gate.error };

  const parsed = leadSchema.safeParse({
    company: formData.get("company") || undefined,
    contactPerson: formData.get("contactPerson"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || "",
    website: formData.get("website") || undefined,
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
    country: formData.get("country") || undefined,
    source: formData.get("source") || undefined,
    industry: formData.get("industry") || undefined,
    requirement: formData.get("requirement") || undefined,
    priority: formData.get("priority") || undefined,
    temperature: formData.get("temperature") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  const lead = await SalesLead.create({
    ...parsed.data,
    assignedEmployeeId: gate.employee.isSalesAdmin ? undefined : gate.employee.employeeId,
    createdBy: gate.employee.email,
    updatedBy: gate.employee.email,
  });

  await logSalesActivity({
    type: "lead_created",
    title: `Lead created: ${parsed.data.contactPerson}${parsed.data.company ? ` (${parsed.data.company})` : ""}`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    leadId: lead._id.toString(),
  });

  revalidatePath("/sales/employee/leads");
  revalidatePath("/sales/admin/leads");
  redirect(`/sales/employee/leads/${lead._id.toString()}`);
}

const statusSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum(SALES_LEAD_STATUSES),
});

export async function updateSalesLeadStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("leads.management");
  if (!gate.ok) return { error: gate.error };

  const parsed = statusSchema.safeParse({
    leadId: formData.get("leadId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  const lead = await SalesLead.findById(parsed.data.leadId);
  if (!lead) return { error: "Lead not found" };

  const oldStatus = lead.status;
  lead.status = parsed.data.status;
  lead.updatedBy = gate.employee.email;
  if (parsed.data.status === "contacted" && !lead.lastContactedAt) lead.lastContactedAt = new Date();
  await lead.save();

  await logSalesActivity({
    type: "lead_updated",
    title: `Lead moved from ${oldStatus} to ${parsed.data.status}`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    leadId: lead._id.toString(),
  });

  revalidatePath("/sales/employee/leads");
  revalidatePath(`/sales/employee/leads/${parsed.data.leadId}`);
  return { success: "Lead updated." };
}

const qualificationSchema = z.object({
  leadId: z.string().min(1),
  qualificationNotes: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  decisionMaker: z.string().optional(),
  businessNeed: z.string().optional(),
  probability: z.string().optional(),
  nextAction: z.string().optional(),
});

export async function updateSalesLeadQualification(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("leads.qualification");
  if (!gate.ok) return { error: gate.error };

  const parsed = qualificationSchema.safeParse({
    leadId: formData.get("leadId"),
    qualificationNotes: formData.get("qualificationNotes") || undefined,
    budget: formData.get("budget") || undefined,
    timeline: formData.get("timeline") || undefined,
    decisionMaker: formData.get("decisionMaker") || undefined,
    businessNeed: formData.get("businessNeed") || undefined,
    probability: formData.get("probability") || undefined,
    nextAction: formData.get("nextAction") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  const lead = await SalesLead.findById(parsed.data.leadId);
  if (!lead) return { error: "Lead not found" };

  lead.qualificationNotes = parsed.data.qualificationNotes || "";
  lead.budget = Number(parsed.data.budget || 0);
  lead.timeline = parsed.data.timeline || "";
  lead.decisionMaker = parsed.data.decisionMaker || "";
  lead.businessNeed = parsed.data.businessNeed || "";
  lead.probability = Math.min(100, Math.max(0, Number(parsed.data.probability || 0)));
  lead.nextAction = parsed.data.nextAction || "";
  lead.updatedBy = gate.employee.email;
  await lead.save();

  await logSalesActivity({
    type: "lead_updated",
    title: `Qualification updated`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    leadId: lead._id.toString(),
  });

  revalidatePath(`/sales/employee/leads/${parsed.data.leadId}`);
  return { success: "Qualification saved." };
}

const assignSchema = z.object({
  leadId: z.string().min(1),
  employeeId: z.string().min(1),
});

export async function assignSalesLead(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("leads.assignment");
  if (!gate.ok) return { error: gate.error };

  const parsed = assignSchema.safeParse({
    leadId: formData.get("leadId"),
    employeeId: formData.get("employeeId"),
  });
  if (!parsed.success) return { error: "Invalid input" };

  await connectDB();
  const [lead, employee] = await Promise.all([
    SalesLead.findById(parsed.data.leadId),
    SalesEmployee.findById(parsed.data.employeeId),
  ]);
  if (!lead || !employee) return { error: "Lead or employee not found" };

  lead.assignedEmployeeId = employee._id;
  lead.updatedBy = gate.employee.email;
  await lead.save();

  await logSalesActivity({
    type: "lead_assigned",
    title: `Lead assigned`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    leadId: lead._id.toString(),
    metadata: { assignedToEmployeeId: employee._id.toString() },
  });

  revalidatePath("/sales/employee/leads");
  revalidatePath("/sales/admin/leads");
  revalidatePath(`/sales/employee/leads/${parsed.data.leadId}`);
  return { success: "Lead assigned." };
}

export async function deleteSalesLead(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("leads.management");
  if (!gate.ok) return { error: gate.error };

  const leadId = String(formData.get("leadId") || "");
  if (!leadId) return { error: "Invalid lead" };

  await connectDB();
  const lead = await SalesLead.findById(leadId);
  if (!lead) return { error: "Lead not found" };

  lead.recordStatus = "archived";
  lead.updatedBy = gate.employee.email;
  await lead.save();

  await logSalesActivity({
    type: "lead_updated",
    title: `Lead archived`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    leadId: lead._id.toString(),
  });

  revalidatePath("/sales/employee/leads");
  revalidatePath("/sales/admin/leads");
  return { success: "Lead removed." };
}
