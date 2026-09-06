import { cache } from "react";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import {
  getEffectiveSalesPermissions,
  getSalesEmployeeContext,
  ensureSuperAdminSalesAccess,
  type SalesEmployeeContext,
} from "@/lib/sales/permissions";
import { applyEmployeePortalPolicy, SALES_ADMIN_ONLY_MODULE_SET } from "@/lib/sales/portal";
import type { SalesModuleKey } from "@/lib/sales/modules";
import { isSuperAdminEmail } from "@/lib/os/super-admin";
import "@/models/sales/register";

export type SalesPageContext = SalesEmployeeContext & {
  effective: Record<SalesModuleKey, boolean>;
};

export type StaffPortal = "os" | "sales_admin" | "sales_employee" | "sales";

const SALES_ADMIN_LOGIN = "/admin/sales";
const SALES_EMPLOYEE_LOGIN = "/sales/login/employee";

/**
 * Auth-only guard for the /sales/employee landing page itself — no module
 * check, so it can never redirect-loop into itself.
 */
export const requireSalesEmployeeSession = cache(async (): Promise<SalesPageContext> => {
  const session = await getAdminSession();
  if (!session) redirect(`${SALES_EMPLOYEE_LOGIN}?next=/sales/employee`);
  await connectDB();
  const employee = await getSalesEmployeeContext(session.email);
  if (!employee) redirect(`${SALES_EMPLOYEE_LOGIN}?next=/sales/employee`);
  if (employee!.isSalesAdmin) redirect("/sales/admin");
  const effective = applyEmployeePortalPolicy(
    await getEffectiveSalesPermissions(employee!.employeeId, false)
  );
  return { ...employee!, effective };
});

/**
 * Guards a /sales/employee/** sub-page. Admin-only modules bounce to sales admin.
 */
export const requireSalesPage = cache(async (moduleKey: SalesModuleKey): Promise<SalesPageContext> => {
  const session = await getAdminSession();
  if (!session) redirect(`${SALES_EMPLOYEE_LOGIN}?next=/sales/employee`);
  await connectDB();
  const employee = await getSalesEmployeeContext(session.email);
  if (!employee) redirect(`${SALES_EMPLOYEE_LOGIN}?next=/sales/employee`);

  if (SALES_ADMIN_ONLY_MODULE_SET.has(moduleKey)) {
    redirect("/sales/admin");
  }

  if (employee!.isSalesAdmin) redirect("/sales/admin");

  const effective = applyEmployeePortalPolicy(
    await getEffectiveSalesPermissions(employee!.employeeId, false)
  );
  if (!effective[moduleKey]) {
    redirect("/sales/employee");
  }
  return { ...employee!, effective };
});

/** Guards a /sales/admin/** page — sales admin OR super admin. Deduped per request. */
export const requireSalesAdminPage = cache(async (): Promise<SalesEmployeeContext> => {
  const session = await getAdminSession();
  if (!session) redirect(`${SALES_ADMIN_LOGIN}?next=/sales/admin`);
  await connectDB();

  if (isSuperAdminEmail(session.email)) {
    const ensured = await ensureSuperAdminSalesAccess(session.email);
    if (ensured) return ensured;
  }

  const employee = await getSalesEmployeeContext(session.email);
  // Never bounce "has session but no Sales Admin row" back through the admin
  // login page — that page used to auto-redirect to /sales/admin and loop.
  if (!employee) redirect(SALES_ADMIN_LOGIN);
  if (!employee!.isSalesAdmin) redirect("/sales/employee");
  return employee!;
});

/**
 * Where a logged-in user should go for a portal — or `null` if they must stay
 * on the login screen (prevents login ↔ /sales/admin redirect loops).
 */
export async function resolvePortalDestination(
  email: string,
  opts: { portal: StaffPortal; next?: string | null }
): Promise<string | null> {
  await connectDB();
  const next = opts.next?.trim() || null;
  const portal = opts.portal === "sales" ? "sales_admin" : opts.portal;

  if (portal === "sales_admin") {
    if (isSuperAdminEmail(email)) {
      await ensureSuperAdminSalesAccess(email);
      return next?.startsWith("/sales/admin") ? next : "/sales/admin";
    }
    const employee = await getSalesEmployeeContext(email);
    if (employee?.isSalesAdmin) {
      return next?.startsWith("/sales/admin") ? next : "/sales/admin";
    }
    // Regular sales employee → their home. No sales profile → stay on login.
    if (employee) return "/sales/employee";
    return null;
  }

  if (portal === "sales_employee") {
    const employee = await getSalesEmployeeContext(email);
    if (!employee) return null;
    if (employee.isSalesAdmin) return "/sales/admin";
    return next?.startsWith("/sales/employee") ? next : "/sales/employee";
  }

  if (portal === "os") {
    if (!isSuperAdminEmail(email)) return null;
    if (
      next?.startsWith("/admin") &&
      !next.startsWith("/admin/login") &&
      !next.startsWith("/admin/sales")
    ) {
      return next;
    }
    return "/admin/os";
  }

  return null;
}

/**
 * Landing after login:
 * - Super admin → Editco OS (unless opening Sales Admin)
 * - Sales admin → /sales/admin
 * - Sales employee → /sales/employee
 */
export async function getStaffLandingPath(
  email: string,
  opts?: { portal?: StaffPortal; next?: string | null }
): Promise<string> {
  await connectDB();
  const next = opts?.next?.trim() || null;
  const portal = opts?.portal === "sales" ? "sales_admin" : opts?.portal;

  if (portal === "sales_employee" || portal === "sales_admin" || portal === "os") {
    const dest = await resolvePortalDestination(email, {
      portal: portal || "os",
      next,
    });
    if (dest) return dest;
    if (portal === "sales_admin") return SALES_ADMIN_LOGIN;
    if (portal === "sales_employee") return SALES_EMPLOYEE_LOGIN;
    return "/admin/login";
  }

  if (isSuperAdminEmail(email)) {
    if (next?.startsWith("/sales")) {
      await ensureSuperAdminSalesAccess(email);
      return next.startsWith("/sales/employee") ? "/sales/admin" : next;
    }
    if (
      next?.startsWith("/admin") &&
      !next.startsWith("/admin/login") &&
      !next.startsWith("/admin/sales")
    ) {
      return next;
    }
    return "/admin/os";
  }

  const employee = await getSalesEmployeeContext(email);
  if (employee) {
    const salesHome = employee.isSalesAdmin ? "/sales/admin" : "/sales/employee";
    if (next?.startsWith("/sales")) {
      if (employee.isSalesAdmin && next.startsWith("/sales/employee")) return "/sales/admin";
      if (!employee.isSalesAdmin && next.startsWith("/sales/admin")) return "/sales/employee";
      return next;
    }
    return salesHome;
  }

  // Never dump unknown cookies into /admin/os — that caused the flicker loop.
  return "/admin/login";
}

/** @deprecated use getStaffLandingPath */
export async function getSalesLandingPath(email: string): Promise<string | null> {
  const employee = await getSalesEmployeeContext(email);
  if (!employee) return null;
  return employee.isSalesAdmin ? "/sales/admin" : "/sales/employee";
}
