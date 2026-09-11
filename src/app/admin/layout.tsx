export const dynamic = "force-dynamic";

import { getStaffContext } from "@/lib/os/guard";
import { getAdminSession } from "@/lib/session";
import { AdminShell } from "@/components/referral/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, staff] = await Promise.all([
    getAdminSession(),
    getStaffContext(),
  ]);
  const email = staff?.email ?? session?.email ?? null;

  return (
    <AdminShell
      email={email}
      role={staff?.role}
      permissions={staff?.permissions}
    >
      {children}
    </AdminShell>
  );
}
