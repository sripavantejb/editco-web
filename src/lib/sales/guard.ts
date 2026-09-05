import { getAdminSession } from "@/lib/session";
import {
  getEffectiveSalesPermissions,
  getSalesEmployeeContext,
  type SalesEmployeeContext,
} from "@/lib/sales/permissions";
import type { SalesModuleKey } from "@/lib/sales/modules";

export type SalesGuardResult =
  | { ok: true; employee: SalesEmployeeContext }
  | { ok: false; error: string };

async function getContext(): Promise<SalesEmployeeContext | null> {
  const session = await getAdminSession();
  if (!session) return null;
  return getSalesEmployeeContext(session.email);
}

/** For Sales server actions. Pass a module key to require that module be enabled for the actor. */
export async function requireSalesAction(moduleKey?: SalesModuleKey): Promise<SalesGuardResult> {
  const employee = await getContext();
  if (!employee) return { ok: false, error: "Unauthorized" };
  if (moduleKey && !employee.isSalesAdmin) {
    const effective = await getEffectiveSalesPermissions(employee.employeeId, employee.isSalesAdmin);
    if (!effective[moduleKey]) {
      return { ok: false, error: "This module is not enabled for your account" };
    }
  }
  return { ok: true, employee };
}

/** For actions only Sales Admins may perform (permission edits, employee management, etc). */
export async function requireSalesAdminAction(): Promise<SalesGuardResult> {
  const employee = await getContext();
  if (!employee) return { ok: false, error: "Unauthorized" };
  if (!employee.isSalesAdmin) return { ok: false, error: "Sales admin access required" };
  return { ok: true, employee };
}
