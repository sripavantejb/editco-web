"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { EditcoTrackerRow, EDITCO_TRACKER_STATUSES, EDITCO_TEAM_EMAILS, type EditcoTeamName } from "@/models/os/EditcoTrackerRow";
import { requireStaff } from "@/lib/os/guard";
import { notifyStaff } from "@/lib/os/activity";
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
  const dependency = parsed.data.dependency ?? [];
  const poc = parsed.data.poc || "";
  await EditcoTrackerRow.create({
    date: new Date(parsed.data.date),
    projectName: parsed.data.projectName,
    taskName: parsed.data.taskName,
    dependency,
    poc,
    status: parsed.data.status || "not_yet_started",
    remarks: parsed.data.remarks || "",
    createdBy: gate.staff.email,
  });

  const notifyNames = new Set<string>();
  if (poc) notifyNames.add(poc);
  for (const name of dependency) notifyNames.add(name);
  await Promise.all(
    [...notifyNames].map((name) => {
      const email = EDITCO_TEAM_EMAILS[name as EditcoTeamName];
      if (!email) return Promise.resolve();
      const isPoc = name === poc;
      return notifyStaff({
        type: "editco_tracker",
        title: isPoc
          ? `You're the POC on "${parsed.data.projectName}"`
          : `You're a dependency on "${parsed.data.projectName}"`,
        body: parsed.data.taskName,
        href: "/admin/os/editco",
        recipientEmail: email,
      });
    })
  );

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

export async function deleteEditcoTrackerRow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };

  const rowId = String(formData.get("rowId") || "");
  if (!rowId) return { error: "Invalid row" };

  await connectDB();
  await EditcoTrackerRow.findByIdAndDelete(rowId);

  revalidatePath("/admin/os/editco");
  return { success: "Row deleted." };
}
