export const dynamic = "force-dynamic";

import { getAdminSession } from "@/lib/session";
import { isEGAAdminEmail } from "@/lib/admin";
import { AdminShell } from "@/components/referral/AdminShell";

export default async function AdminEGALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  const egaOnlyUser = session ? isEGAAdminEmail(session.email) : false;

  return (
    <AdminShell
      email={session?.email ?? null}
      theme="ega"
      egaOnly
      showMainAdmin={Boolean(session && !egaOnlyUser)}
    >
      {children}
    </AdminShell>
  );
}
