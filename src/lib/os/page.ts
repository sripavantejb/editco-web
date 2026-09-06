import { connectDB } from "@/lib/db";
import { redirect } from "next/navigation";
import { getAdminSession, type AdminSession } from "@/lib/session";
import { getStaffContext } from "@/lib/os/guard";
import { canAccessLegacyAdmin, hasPermission } from "@/lib/os/permissions";
import { isSuperAdminEmail } from "@/lib/os/super-admin";
import { getSalesEmployeeContext } from "@/lib/sales/permissions";
import type { StaffContext } from "@/lib/os/staff";
import "@/models/os/register";
import "@/models/sales/register";

async function bounceNonOsUser(email: string): Promise<never> {
  const sales = await getSalesEmployeeContext(email);
  if (sales?.isSalesAdmin) redirect("/sales/admin");
  if (sales) redirect("/sales/employee");
  redirect("/admin/login");
}

export async function requireOsPage(permission: string): Promise<StaffContext> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const staff = await getStaffContext();
  if (!staff) {
    await connectDB();
    await bounceNonOsUser(session.email);
  }

  // Sales CRM accounts must not enter Editco OS (stops login ↔ /admin/os flicker).
  if (staff!.role === "sales" && !isSuperAdminEmail(staff!.email)) {
    await bounceNonOsUser(staff!.email);
  }

  if (!hasPermission(staff!.permissions, permission)) {
    redirect("/admin/os");
  }
  await connectDB();
  return staff!;
}

/** Guards legacy growth domains (Refer & Earn, Careers, EGA). */
export async function requireLegacyPage(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const staff = await getStaffContext();
  if (!staff) {
    await connectDB();
    await bounceNonOsUser(session.email);
  }
  if (staff!.role === "sales" && !isSuperAdminEmail(staff!.email)) {
    await bounceNonOsUser(staff!.email);
  }
  if (staff && !canAccessLegacyAdmin(staff.role)) {
    redirect("/admin/os");
  }
  await connectDB();
  return session;
}
