import type { StaffRole } from "@/lib/os/constants";

const ADMIN_OPS: string[] = [
  "users:read",
  "leads:*",
  "conversions:*",
  "proposals:*",
  "calls:*",
  "followups:*",
  "pipeline:manage",
  "vendors:*",
  "projects:*",
  "meetings:*",
  "tasks:*",
  "documents:*",
  "milestones:*",
  "project_updates:*",
  "invoices:*",
  "payments:*",
  "finance:read",
  "dashboard:read",
  "notifications:*",
  "search:read",
  "services:read",
  "analytics:read",
  "vault:read",
  "vault:write",
  "activity:read",
];

export const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  super_admin: ["*"],
  admin: ADMIN_OPS,
  sales: [
    "leads:*",
    "conversions:write",
    "conversions:read",
    "proposals:*",
    "calls:*",
    "followups:*",
    "pipeline:manage",
    "vendors:read",
    "projects:read",
    "meetings:read",
    "dashboard:read",
    "notifications:read",
    "search:read",
    "services:read",
    "analytics:read",
    "vault:read",
    "vault:write",
    "activity:read",
  ],
  project_manager: [
    "projects:*",
    "meetings:*",
    "tasks:*",
    "documents:*",
    "milestones:*",
    "project_updates:*",
    "vendors:read",
    "conversions:read",
    "leads:read",
    "proposals:read",
    "followups:read",
    "dashboard:read",
    "notifications:*",
    "search:read",
    "services:read",
    "analytics:read",
    "vault:read",
    "activity:read",
  ],
  team_member: [
    "dashboard:read",
    "notifications:*",
    "projects:read",
    "tasks:*",
    "meetings:read",
    "documents:read",
    "milestones:read",
    "project_updates:read",
    "search:read",
    "activity:read",
  ],
  finance: [
    "invoices:*",
    "payments:*",
    "finance:read",
    "vendors:read",
    "projects:read",
    "conversions:read",
    "dashboard:read",
    "notifications:read",
    "search:read",
    "analytics:read",
    "activity:read",
  ],
  viewer: [
    "leads:read",
    "conversions:read",
    "proposals:read",
    "calls:read",
    "followups:read",
    "vendors:read",
    "projects:read",
    "milestones:read",
    "project_updates:read",
    "meetings:read",
    "tasks:read",
    "documents:read",
    "invoices:read",
    "payments:read",
    "dashboard:read",
    "notifications:read",
    "search:read",
    "analytics:read",
    "services:read",
    "finance:read",
    "vault:read",
    "activity:read",
  ],
};

export function hasPermission(perms: string[], needed: string) {
  if (perms.includes("*") || perms.includes(needed)) return true;
  const [resource] = needed.split(":");
  if (perms.includes(`${resource}:*`)) return true;
  if (needed.endsWith(":read") && perms.includes(`${resource}:write`)) {
    return true;
  }
  return false;
}

export function permissionsForRole(role: StaffRole) {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function canAccessLegacyAdmin(role: StaffRole) {
  return role === "super_admin" || role === "admin";
}

export function canManageUsers(role: StaffRole) {
  return role === "super_admin";
}

export function canManageAllProjects(perms: string[]) {
  return hasPermission(perms, "projects:write") || hasPermission(perms, "*");
}
