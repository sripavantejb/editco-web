import type { SalesModuleKey } from "@/lib/sales/modules";

/**
 * Modules that belong on Sales Admin only — never on the employee portal,
 * even if an override somehow turns them on.
 */
export const SALES_ADMIN_ONLY_MODULES: SalesModuleKey[] = [
  "dashboard.manager",
  "leads.assignment",
  "workforce.attendance_dashboard",
  "workforce.live_status",
  "workforce.activity_tracking",
  "workforce.activity_timeline",
  "analytics.revenue",
  "analytics.conversion",
  "analytics.lead_source",
  "analytics.lost_deals",
  "reports.reports",
  "reports.export",
  "admin.teams",
  "admin.territories",
  "admin.audit_logs",
];

export const SALES_ADMIN_ONLY_MODULE_SET = new Set<SalesModuleKey>(SALES_ADMIN_ONLY_MODULES);

/** Strip admin-only modules from an employee effective map. */
export function applyEmployeePortalPolicy(
  effective: Record<SalesModuleKey, boolean>
): Record<SalesModuleKey, boolean> {
  const next = { ...effective };
  for (const key of SALES_ADMIN_ONLY_MODULES) next[key] = false;
  return next;
}
