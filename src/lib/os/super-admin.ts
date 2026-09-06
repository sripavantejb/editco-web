/**
 * Hard allowlist — these are the only accounts that may hold `super_admin`.
 * Sales CRM admins are a separate role (`SalesEmployee.isSalesAdmin`).
 */
export const SUPER_ADMIN_EMAILS = [
  "sripavantejb@gmail.com",
  "deepikamundla54@gmail.com",
  "harshapolina1@gmail.com",
] as const;

export type SuperAdminEmail = (typeof SUPER_ADMIN_EMAILS)[number];

const SUPER_ADMIN_SET = new Set<string>(
  SUPER_ADMIN_EMAILS.map((e) => e.toLowerCase())
);

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPER_ADMIN_SET.has(email.toLowerCase().trim());
}
