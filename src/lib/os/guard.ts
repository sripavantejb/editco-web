import { getAdminSession } from "@/lib/session";
import { hasPermission } from "@/lib/os/permissions";
import { loadStaffByEmail, type StaffContext } from "@/lib/os/staff";

export async function getStaffContext(): Promise<StaffContext | null> {
  const session = await getAdminSession();
  if (!session) return null;
  return loadStaffByEmail(session.email);
}

export async function requireStaff(permission?: string): Promise<
  { ok: true; staff: StaffContext } | { ok: false; error: string }
> {
  const staff = await getStaffContext();
  if (!staff) return { ok: false, error: "Unauthorized" };
  if (permission && !hasPermission(staff.permissions, permission)) {
    return { ok: false, error: "You do not have permission for this action" };
  }
  return { ok: true, staff };
}
