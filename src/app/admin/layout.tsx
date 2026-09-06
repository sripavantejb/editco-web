export const dynamic = "force-dynamic";

import { getStaffContext } from "@/lib/os/guard";
import { AdminShell } from "@/components/referral/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getStaffContext is React.cache()'d and already reads the admin session —
  // one JWT verify + one staff lookup shared with page guards.
  const staff = await getStaffContext();

  return (
    <AdminShell
      email={staff?.email ?? null}
      role={staff?.role}
      permissions={staff?.permissions}
    >
      {children}
    </AdminShell>
  );
}
