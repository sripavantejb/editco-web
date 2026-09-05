"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SalesNotification } from "@/models/sales/SalesNotification";
import { requireSalesAction } from "@/lib/sales/guard";
import type { ActionState } from "@/actions/auth";

export async function markSalesNotificationRead(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction();
  if (!gate.ok) return { error: gate.error };

  const notificationId = String(formData.get("notificationId") || "");
  await connectDB();
  await SalesNotification.updateOne(
    { _id: notificationId, recipientEmployeeId: gate.employee.employeeId },
    { $set: { readAt: new Date() } }
  );

  revalidatePath("/sales/employee/notifications");
  return { success: "Marked as read." };
}

export async function markAllSalesNotificationsRead(_prev: ActionState): Promise<ActionState> {
  const gate = await requireSalesAction();
  if (!gate.ok) return { error: gate.error };

  await connectDB();
  await SalesNotification.updateMany(
    { recipientEmployeeId: gate.employee.employeeId, readAt: { $exists: false } },
    { $set: { readAt: new Date() } }
  );

  revalidatePath("/sales/employee/notifications");
  return { success: "All caught up." };
}
