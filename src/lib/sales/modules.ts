/**
 * Single source of truth for every toggleable Sales CRM module. Used by:
 * the permission editor UI, the per-employee sidebar builder, and the
 * page/action guards (`requireSalesPage` / `requireSalesAction`).
 */

export const SALES_MODULE_GROUPS = [
  "Dashboard",
  "Leads",
  "Sales",
  "Customers",
  "Communication",
  "Documents",
  "Performance",
  "Workforce",
  "Tasks & Calendar",
  "Analytics",
  "Reports",
  "Administration",
] as const;
export type SalesModuleGroup = (typeof SALES_MODULE_GROUPS)[number];

export const SALES_MODULE_KEYS = [
  "dashboard.sales",
  "dashboard.manager",
  "leads.management",
  "leads.qualification",
  "leads.assignment",
  "sales.pipeline",
  "sales.deals",
  "sales.negotiation",
  "sales.closure",
  "sales.forecast",
  "customers.management",
  "customers.documents",
  "comm.calls",
  "comm.meetings",
  "comm.followups",
  "comm.email_whatsapp",
  "docs.quotations",
  "docs.proposals",
  "docs.sales_documents",
  "perf.targets",
  "perf.performance",
  "perf.leaderboard",
  "perf.daily_report",
  "perf.productivity",
  "perf.daily_work_status",
  "workforce.attendance_sync",
  "workforce.attendance_dashboard",
  "workforce.live_status",
  "workforce.activity_tracking",
  "workforce.activity_timeline",
  "tasks.management",
  "tasks.calendar",
  "analytics.revenue",
  "analytics.conversion",
  "analytics.lead_source",
  "analytics.lost_deals",
  "reports.reports",
  "reports.export",
  "admin.notifications",
  "admin.approvals",
  "admin.teams",
  "admin.territories",
  "admin.audit_logs",
] as const;
export type SalesModuleKey = (typeof SALES_MODULE_KEYS)[number];

export type SalesModule = {
  key: SalesModuleKey;
  label: string;
  group: SalesModuleGroup;
  /** Route prefixes under /sales/employee this module gates. Empty = no dedicated page yet. */
  employeeRoutes: string[];
  /** Route prefixes under /sales/admin when this is an admin-portal module. */
  adminRoutes?: string[];
};

export const SALES_MODULES: SalesModule[] = [
  { key: "dashboard.sales", label: "Sales Dashboard", group: "Dashboard", employeeRoutes: ["/sales/employee"] },
  { key: "dashboard.manager", label: "Manager Dashboard", group: "Dashboard", employeeRoutes: [], adminRoutes: ["/sales/admin"] },

  { key: "leads.management", label: "Lead Management", group: "Leads", employeeRoutes: ["/sales/employee/leads"] },
  { key: "leads.qualification", label: "Lead Qualification", group: "Leads", employeeRoutes: ["/sales/employee/leads/qualification"] },
  { key: "leads.assignment", label: "Lead Assignment", group: "Leads", employeeRoutes: [], adminRoutes: ["/sales/admin/leads/assignment"] },

  { key: "sales.pipeline", label: "Sales Pipeline", group: "Sales", employeeRoutes: ["/sales/employee/pipeline"] },
  { key: "sales.deals", label: "Deal Management", group: "Sales", employeeRoutes: ["/sales/employee/deals"] },
  { key: "sales.negotiation", label: "Negotiation Tracking", group: "Sales", employeeRoutes: ["/sales/employee/deals/negotiation"] },
  { key: "sales.closure", label: "Deal Closure", group: "Sales", employeeRoutes: ["/sales/employee/deals/closure"] },
  { key: "sales.forecast", label: "Sales Forecast", group: "Sales", employeeRoutes: ["/sales/employee/forecast"] },

  { key: "customers.management", label: "Customer Management", group: "Customers", employeeRoutes: ["/sales/employee/customers"] },
  { key: "customers.documents", label: "Customer Documents", group: "Customers", employeeRoutes: ["/sales/employee/customers/documents"] },

  { key: "comm.calls", label: "Call Tracking", group: "Communication", employeeRoutes: ["/sales/employee/calls"] },
  { key: "comm.meetings", label: "Meeting Management", group: "Communication", employeeRoutes: ["/sales/employee/meetings"] },
  { key: "comm.followups", label: "Follow-up Management", group: "Communication", employeeRoutes: ["/sales/employee/follow-ups"] },
  { key: "comm.email_whatsapp", label: "Email / WhatsApp Activity", group: "Communication", employeeRoutes: ["/sales/employee/activity/messages"] },

  { key: "docs.quotations", label: "Quotation Management", group: "Documents", employeeRoutes: ["/sales/employee/quotations"] },
  { key: "docs.proposals", label: "Proposal Management", group: "Documents", employeeRoutes: ["/sales/employee/proposals"] },
  { key: "docs.sales_documents", label: "Sales Documents", group: "Documents", employeeRoutes: ["/sales/employee/documents"] },

  { key: "perf.targets", label: "Sales Targets", group: "Performance", employeeRoutes: ["/sales/employee/targets"] },
  { key: "perf.performance", label: "Sales Performance", group: "Performance", employeeRoutes: ["/sales/employee/performance"] },
  { key: "perf.leaderboard", label: "Leaderboard", group: "Performance", employeeRoutes: ["/sales/employee/leaderboard"] },
  { key: "perf.daily_report", label: "Daily Sales Report", group: "Performance", employeeRoutes: ["/sales/employee/reports/daily"] },
  { key: "perf.productivity", label: "Productivity Tracking", group: "Performance", employeeRoutes: ["/sales/employee/productivity"] },
  { key: "perf.daily_work_status", label: "Daily Work Status", group: "Performance", employeeRoutes: ["/sales/employee/work-status"] },

  { key: "workforce.attendance_sync", label: "Attendance", group: "Workforce", employeeRoutes: ["/sales/employee/attendance"] },
  { key: "workforce.attendance_dashboard", label: "Attendance Dashboard", group: "Workforce", employeeRoutes: [], adminRoutes: ["/sales/admin/attendance/dashboard"] },
  { key: "workforce.live_status", label: "Live Employee Status", group: "Workforce", employeeRoutes: [], adminRoutes: ["/sales/admin/live-status"] },
  { key: "workforce.activity_tracking", label: "Activity Tracking", group: "Workforce", employeeRoutes: [], adminRoutes: ["/sales/admin/activity"] },
  { key: "workforce.activity_timeline", label: "Activity Timeline", group: "Workforce", employeeRoutes: [], adminRoutes: ["/sales/admin/activity/timeline"] },

  { key: "tasks.management", label: "Task Management", group: "Tasks & Calendar", employeeRoutes: ["/sales/employee/tasks"] },
  { key: "tasks.calendar", label: "Sales Calendar", group: "Tasks & Calendar", employeeRoutes: ["/sales/employee/calendar"] },

  { key: "analytics.revenue", label: "Revenue Analytics", group: "Analytics", employeeRoutes: [], adminRoutes: ["/sales/admin/analytics/revenue"] },
  { key: "analytics.conversion", label: "Conversion Analytics", group: "Analytics", employeeRoutes: [], adminRoutes: ["/sales/admin/analytics/conversion"] },
  { key: "analytics.lead_source", label: "Lead Source Analytics", group: "Analytics", employeeRoutes: [], adminRoutes: ["/sales/admin/analytics/lead-source"] },
  { key: "analytics.lost_deals", label: "Lost Deal Analysis", group: "Analytics", employeeRoutes: [], adminRoutes: ["/sales/admin/analytics/lost-deals"] },

  { key: "reports.reports", label: "Reports", group: "Reports", employeeRoutes: [], adminRoutes: ["/sales/admin/reports"] },
  { key: "reports.export", label: "Export Reports", group: "Reports", employeeRoutes: [], adminRoutes: [] },

  { key: "admin.notifications", label: "Notifications", group: "Administration", employeeRoutes: ["/sales/employee/notifications"] },
  { key: "admin.approvals", label: "Approval System", group: "Administration", employeeRoutes: ["/sales/employee/approvals"] },
  { key: "admin.teams", label: "Team Management", group: "Administration", employeeRoutes: [], adminRoutes: ["/sales/admin/team"] },
  { key: "admin.territories", label: "Territory Management", group: "Administration", employeeRoutes: [], adminRoutes: ["/sales/admin/territories"] },
  { key: "admin.audit_logs", label: "Audit Logs", group: "Administration", employeeRoutes: [], adminRoutes: ["/sales/admin/audit-logs"] },
];

export const SALES_MODULE_BY_KEY: Record<SalesModuleKey, SalesModule> = Object.fromEntries(
  SALES_MODULES.map((m) => [m.key, m])
) as Record<SalesModuleKey, SalesModule>;

export function salesModulesByGroup(group: SalesModuleGroup): SalesModule[] {
  return SALES_MODULES.filter((m) => m.group === group);
}

/** Default ON modules for a freshly-created employee with no admin overrides yet. */
export const DEFAULT_EMPLOYEE_MODULES: SalesModuleKey[] = [
  "dashboard.sales",
  "leads.management",
  "leads.qualification",
  "sales.pipeline",
  "sales.deals",
  "customers.management",
  "comm.calls",
  "comm.meetings",
  "comm.followups",
  "tasks.management",
  "tasks.calendar",
  "perf.daily_work_status",
  "admin.notifications",
];

export function defaultModuleMapForRole(isSalesAdmin: boolean): Record<SalesModuleKey, boolean> {
  const map = {} as Record<SalesModuleKey, boolean>;
  const onSet = new Set<SalesModuleKey>(isSalesAdmin ? SALES_MODULE_KEYS : DEFAULT_EMPLOYEE_MODULES);
  for (const key of SALES_MODULE_KEYS) map[key] = onSet.has(key);
  return map;
}

/** Given a pathname under /sales/employee, find the module that gates it (longest-prefix match). */
export function findModuleForEmployeeRoute(pathname: string): SalesModule | null {
  let best: SalesModule | null = null;
  for (const mod of SALES_MODULES) {
    for (const prefix of mod.employeeRoutes) {
      if (pathname === prefix || pathname.startsWith(prefix + "/")) {
        if (!best || prefix.length > (best.employeeRoutes.find((p) => pathname.startsWith(p))?.length ?? 0)) {
          best = mod;
        }
      }
    }
  }
  return best;
}
