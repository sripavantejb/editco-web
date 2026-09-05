"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { EditcoTrackerRow, EDITCO_TRACKER_STATUSES } from "@/models/os/EditcoTrackerRow";
import { requireStaff } from "@/lib/os/guard";
import type { ActionState } from "@/actions/auth";

const createSchema = z.object({
  date: z.string().min(1, "Date is required"),
  projectName: z.string().min(1, "Project name is required"),
  taskName: z.string().min(1, "Task name is required"),
  dependency: z.array(z.string()).optional(),
  poc: z.string().optional(),
  status: z.enum(EDITCO_TRACKER_STATUSES).optional(),
  remarks: z.string().optional(),
});

export async function createEditcoTrackerRow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };

  const parsed = createSchema.safeParse({
    date: formData.get("date"),
    projectName: formData.get("projectName"),
    taskName: formData.get("taskName"),
    dependency: formData.getAll("dependency").filter(Boolean),
    poc: formData.get("poc") || undefined,
    status: formData.get("status") || undefined,
    remarks: formData.get("remarks") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  await EditcoTrackerRow.create({
    date: new Date(parsed.data.date),
    projectName: parsed.data.projectName,
    taskName: parsed.data.taskName,
    dependency: parsed.data.dependency ?? [],
    poc: parsed.data.poc || "",
    status: parsed.data.status || "not_yet_started",
    remarks: parsed.data.remarks || "",
    createdBy: gate.staff.email,
  });

  revalidatePath("/admin/os/editco");
  return { success: "Row added." };
}

const statusSchema = z.object({
  rowId: z.string().min(1),
  status: z.enum(EDITCO_TRACKER_STATUSES),
});

export async function updateEditcoTrackerRowStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };

  const parsed = statusSchema.safeParse({
    rowId: formData.get("rowId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Invalid input" };

  await connectDB();
  await EditcoTrackerRow.findByIdAndUpdate(parsed.data.rowId, { status: parsed.data.status });

  revalidatePath("/admin/os/editco");
  return { success: "Status updated." };
}
