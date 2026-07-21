export const dynamic = "force-dynamic";

import { getAdminSession } from "@/lib/session";
import { AdminShell } from "@/components/referral/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  return <AdminShell email={session?.email ?? null}>{children}</AdminShell>;
}
