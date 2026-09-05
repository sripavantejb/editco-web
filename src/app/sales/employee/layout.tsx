export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { getEffectiveSalesPermissions, getSalesEmployeeContext } from "@/lib/sales/permissions";
import { defaultModuleMapForRole } from "@/lib/sales/modules";
import { SalesShell } from "@/components/sales/SalesShell";
import { SalesEmployeeSidebar } from "@/components/sales/SalesEmployeeSidebar";
import "@/models/sales/register";

export default async function SalesEmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login?next=/sales/employee");
  await connectDB();
  const employee = await getSalesEmployeeContext(session.email);
  if (!employee) redirect("/admin/login?next=/sales/employee");

  const effective = employee!.isSalesAdmin
    ? defaultModuleMapForRole(true)
    : await getEffectiveSalesPermissions(employee!.employeeId, false);

  return (
    <SalesShell sidebar={<SalesEmployeeSidebar name={employee!.name} effective={effective} />}>
      {children}
    </SalesShell>
  );
}
