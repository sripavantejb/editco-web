import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import {
  getEffectiveSalesPermissions,
  getSalesEmployeeContext,
  type SalesEmployeeContext,
} from "@/lib/sales/permissions";
import type { SalesModuleKey } from "@/lib/sales/modules";
import "@/models/sales/register";

export type SalesPageContext = SalesEmployeeContext & {
  effective: Record<SalesModuleKey, boolean>;
};

/**
 * Auth-only guard for the /sales/employee landing page itself — no module
 * check, so it can never redirect-loop into itself. The page uses the
 * returned `effective` map to decide what to render (e.g. hide dashboard
 * widgets if "dashboard.sales" is off), rather than being blocked outright.
 */
export async function requireSalesEmployeeSession(): Promise<SalesPageContext> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login?next=/sales/employee");
  await connectDB();
  const employee = await getSalesEmployeeContext(session.email);
  if (!employee) redirect("/admin/login?next=/sales/employee");
  const effective = await getEffectiveSalesPermissions(employee!.employeeId, employee!.isSalesAdmin);
  return { ...employee!, effective };
}

/**
 * Guards a /sales/employee/** sub-page (leads, customers, etc). Redirects to
 * /admin/login if there's no session, to /sales/employee if the module isn't
 * enabled for this employee — this is the server-side enforcement that makes
 * URL manipulation a no-op regardless of what the sidebar shows. Safe to
 * redirect to /sales/employee because that page never gates on a module
 * itself (see requireSalesEmployeeSession above) — no redirect loop.
 */
export async function requireSalesPage(moduleKey: SalesModuleKey): Promise<SalesPageContext> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login?next=/sales/employee");
  await connectDB();
  const employee = await getSalesEmployeeContext(session.email);
  if (!employee) redirect("/admin/login?next=/sales/employee");
  const effective = await getEffectiveSalesPermissions(employee!.employeeId, employee!.isSalesAdmin);
  if (!employee!.isSalesAdmin && !effective[moduleKey]) {
    redirect("/sales/employee");
  }
  return { ...employee!, effective };
}

/** Guards a /sales/admin/** page — requires an active session with isSalesAdmin. */
export async function requireSalesAdminPage(): Promise<SalesEmployeeContext> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login?next=/sales/admin");
  await connectDB();
  const employee = await getSalesEmployeeContext(session.email);
  if (!employee) redirect("/admin/login?next=/sales/admin");
  if (!employee!.isSalesAdmin) redirect("/sales/employee");
  return employee!;
}

/** Used by /sales root + /admin/login to route a logged-in staff member to the right area. */
export async function getSalesLandingPath(email: string): Promise<string | null> {
  await connectDB();
  const employee = await getSalesEmployeeContext(email);
  if (!employee) return null;
  return employee.isSalesAdmin ? "/sales/admin" : "/sales/employee";
}
