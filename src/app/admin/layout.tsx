export const dynamic = "force-dynamic";

import { getAdminSession } from "@/lib/session";
import { getStaffContext } from "@/lib/os/guard";
import { AdminShell } from "@/components/referral/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  const staff = session ? await getStaffContext() : null;

  return (
    <AdminShell
      email={session?.email ?? null}
      role={staff?.role}
      permissions={staff?.permissions}
    >
      {children}
    </AdminShell>
  );
}
