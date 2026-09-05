"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SalesMeeting } from "@/models/sales/SalesMeeting";
import { requireSalesAction } from "@/lib/sales/guard";
import { logSalesActivity } from "@/lib/sales/activity";
import { SALES_MEETING_STATUSES, SALES_MEETING_TYPES } from "@/lib/sales/constants";
import type { ActionState } from "@/actions/auth";

const createSchema = z.object({
  title: z.string().min(2, "Title is required"),
  leadId: z.string().optional(),
  type: z.enum(SALES_MEETING_TYPES).optional(),
  startsAt: z.string().min(1, "Date/time is required"),
  location: z.string().optional(),
  agenda: z.string().optional(),
});

export async function createSalesMeeting(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("comm.meetings");
  if (!gate.ok) return { error: gate.error };

  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    leadId: formData.get("leadId") || undefined,
    type: formData.get("type") || undefined,
    startsAt: formData.get("startsAt"),
    location: formData.get("location") || undefined,
    agenda: formData.get("agenda") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  const meeting = await SalesMeeting.create({
    title: parsed.data.title,
    leadId: parsed.data.leadId || undefined,
    ownerEmployeeId: gate.employee.employeeId,
    type: parsed.data.type || "discovery",
    startsAt: new Date(parsed.data.startsAt),
    location: parsed.data.location || "",
    agenda: parsed.data.agenda || "",
    status: "scheduled",
    createdBy: gate.employee.email,
  });

  await logSalesActivity({
    type: "meeting_created",
    title: `Meeting scheduled: ${parsed.data.title}`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    leadId: parsed.data.leadId,
    metadata: { meetingId: meeting._id.toString() },
  });

  revalidatePath("/sales/employee/meetings");
  revalidatePath("/sales/employee/calendar");
  return { success: "Meeting scheduled." };
}

const statusSchema = z.object({
  meetingId: z.string().min(1),
  status: z.enum(SALES_MEETING_STATUSES),
  notes: z.string().optional(),
  decisions: z.string().optional(),
  nextSteps: z.string().optional(),
});

export async function updateSalesMeetingStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("comm.meetings");
  if (!gate.ok) return { error: gate.error };

  const parsed = statusSchema.safeParse({
    meetingId: formData.get("meetingId"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
    decisions: formData.get("decisions") || undefined,
    nextSteps: formData.get("nextSteps") || undefined,
  });
  if (!parsed.success) return { error: "Invalid input" };

  await connectDB();
  const meeting = await SalesMeeting.findById(parsed.data.meetingId);
  if (!meeting) return { error: "Meeting not found" };

  meeting.status = parsed.data.status;
  if (parsed.data.notes !== undefined) meeting.notes = parsed.data.notes;
  if (parsed.data.decisions !== undefined) meeting.decisions = parsed.data.decisions;
  if (parsed.data.nextSteps !== undefined) meeting.nextSteps = parsed.data.nextSteps;
  await meeting.save();

  await logSalesActivity({
    type: "meeting_created",
    title: `Meeting ${parsed.data.status}: ${meeting.title}`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
  });

  revalidatePath("/sales/employee/meetings");
  revalidatePath("/sales/employee/calendar");
  return { success: "Meeting updated." };
}
