import { connectDB } from "@/lib/db";
import { redirect } from "next/navigation";
import { getAdminSession, type AdminSession } from "@/lib/session";
import { getStaffContext } from "@/lib/os/guard";
import { canAccessLegacyAdmin, hasPermission } from "@/lib/os/permissions";
import type { StaffContext } from "@/lib/os/staff";
import "@/models/os/register";

export async function requireOsPage(permission: string): Promise<StaffContext> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const staff = await getStaffContext();
  if (!staff) redirect("/admin/login");
  if (!hasPermission(staff.permissions, permission)) {
    redirect("/admin/os");
  }
  await connectDB();
  return staff;
}

/** Guards legacy growth domains (Refer & Earn, Careers, EGA). */
export async function requireLegacyPage(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const staff = await getStaffContext();
  if (staff && !canAccessLegacyAdmin(staff.role)) {
    redirect("/admin/os");
  }
  await connectDB();
  return session;
}
