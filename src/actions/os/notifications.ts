"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { OsNotification } from "@/models/os/Notification";
import { str } from "@/lib/os/form";

export async function markNotificationRead(formData: FormData) {
  const gate = await requireStaff("notifications:read");
  if (!gate.ok) return;
  await connectDB();
  await OsNotification.updateOne(
    { _id: str(formData, "id"), recipientEmail: gate.staff.email },
    { readAt: new Date() }
  );
  revalidatePath("/admin/os/notifications");
}

export async function markAllNotificationsRead() {
  const gate = await requireStaff("notifications:read");
  if (!gate.ok) return;
  await connectDB();
  await OsNotification.updateMany(
    { recipientEmail: gate.staff.email, readAt: { $exists: false } },
    { readAt: new Date() }
  );
  revalidatePath("/admin/os/notifications");
  revalidatePath("/admin/os");
}
