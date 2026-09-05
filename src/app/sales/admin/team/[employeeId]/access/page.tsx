export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { StaffUser } from "@/models/os/StaffUser";
import { getEffectiveSalesPermissions } from "@/lib/sales/permissions";
import { defaultModuleMapForRole } from "@/lib/sales/modules";
import { OsPage } from "@/components/os/ui";
import { PermissionEditor } from "@/components/sales/PermissionEditor";

export default async function SalesEmployeeAccessPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  await requireSalesAdminPage();
  const { employeeId } = await params;
  if (!Types.ObjectId.isValid(employeeId)) notFound();

  const employee = await SalesEmployee.findById(employeeId).lean();
  if (!employee) notFound();
  if (employee.isSalesAdmin) notFound();
  const staff = await StaffUser.findById(employee.staffUserId).select("name email").lean();

  const effective = await getEffectiveSalesPermissions(employeeId, false);
  const roleDefaults = defaultModuleMapForRole(false);

  return (
    <OsPage
      title={`Access — ${staff?.name || staff?.email || "Employee"}`}
      subtitle="Toggle exactly what this employee can see. Anything left off is hidden from their sidebar and blocked server-side, even by direct URL."
      backHref={`/sales/admin/team/${employeeId}`}
      backLabel="Back to profile"
    >
      <PermissionEditor employeeId={employeeId} savedEffective={effective} roleDefaults={roleDefaults} />
    </OsPage>
  );
}
