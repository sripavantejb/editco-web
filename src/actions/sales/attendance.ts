"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SalesAttendance } from "@/models/sales/SalesAttendance";
import { requireSalesAction } from "@/lib/sales/guard";
import { logSalesActivity } from "@/lib/sales/activity";
import type { ActionState } from "@/actions/auth";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function checkInSalesAttendance(_prev: ActionState): Promise<ActionState> {
  const gate = await requireSalesAction("workforce.attendance_sync");
  if (!gate.ok) return { error: gate.error };

  await connectDB();
  const date = todayKey();
  const existing = await SalesAttendance.findOne({ employeeId: gate.employee.employeeId, date });
  if (existing?.checkInAt) return { error: "Already checked in today." };

  await SalesAttendance.findOneAndUpdate(
    { employeeId: gate.employee.employeeId, date },
    { $set: { checkInAt: new Date(), status: "present" } },
    { upsert: true }
  );

  await logSalesActivity({
    type: "lead_updated",
    title: "Checked in for the day",
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
  });

  revalidatePath("/sales/employee/attendance");
  return { success: "Checked in." };
}

export async function checkOutSalesAttendance(_prev: ActionState): Promise<ActionState> {
  const gate = await requireSalesAction("workforce.attendance_sync");
  if (!gate.ok) return { error: gate.error };

  await connectDB();
  const date = todayKey();
  const existing = await SalesAttendance.findOne({ employeeId: gate.employee.employeeId, date });
  if (!existing?.checkInAt) return { error: "Check in first." };
  if (existing.checkOutAt) return { error: "Already checked out today." };

  existing.checkOutAt = new Date();
  await existing.save();

  revalidatePath("/sales/employee/attendance");
  return { success: "Checked out." };
}
