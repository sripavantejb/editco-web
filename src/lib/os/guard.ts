import { cache } from "react";
import { getAdminSession } from "@/lib/session";
import { hasPermission } from "@/lib/os/permissions";
import { loadStaffByEmail, type StaffContext } from "@/lib/os/staff";

/** Deduped per RSC request — layout + page share one staff lookup. */
export const getStaffContext = cache(async (): Promise<StaffContext | null> => {
  const session = await getAdminSession();
  if (!session) return null;
  return loadStaffByEmail(session.email);
});

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
