export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { StaffUser } from "@/models/os/StaffUser";
import { SalesLead } from "@/models/sales/SalesLead";
import { updateSalesEmployeeStatus } from "@/actions/sales/employees";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsSelect } from "@/components/os/OsSelect";
import { Field, OsBadge, OsLink, OsPage } from "@/components/os/ui";
import { SALES_EMPLOYEE_STATUS_LABELS } from "@/lib/sales/constants";
import { formatDateTime } from "@/lib/utils";

export default async function SalesEmployeeProfilePage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  await requireSalesAdminPage();
  const { employeeId } = await params;
  if (!Types.ObjectId.isValid(employeeId)) notFound();

  const employee = await SalesEmployee.findById(employeeId).lean();
  if (!employee) notFound();
  const staff = await StaffUser.findById(employee.staffUserId).lean();
  const openLeadCount = await SalesLead.countDocuments({
    assignedEmployeeId: employee._id,
    recordStatus: "active",
    status: { $nin: ["converted", "lost"] },
  });

  return (
    <OsPage
      title={staff?.name || staff?.email || "Employee"}
      subtitle={`${employee.employeeCode || ""} · ${employee.department || "Sales"}${employee.team ? ` · ${employee.team}` : ""}`}
      backHref="/sales/admin/team"
      backLabel="Back to team"
      actions={
        !employee.isSalesAdmin ? (
          <OsLink href={`/sales/admin/team/${employeeId}/access`}>Manage permissions</OsLink>
        ) : undefined
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
          <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
            Profile
          </h2>
          <ul className="space-y-2 font-inter text-sm text-[var(--dash-muted)]">
            <li className="flex justify-between"><span>Email</span><span className="text-[var(--dash-text)]">{staff?.email}</span></li>
            <li className="flex justify-between"><span>Phone</span><span className="text-[var(--dash-text)]">{employee.phone || "—"}</span></li>
            <li className="flex justify-between"><span>Territory</span><span className="text-[var(--dash-text)]">{employee.territory || "—"}</span></li>
            <li className="flex justify-between"><span>Role</span><span className="text-[var(--dash-text)]">{employee.isSalesAdmin ? "Sales Admin" : "Sales Employee"}</span></li>
            <li className="flex justify-between"><span>Open leads</span><span className="text-[var(--dash-text)]">{openLeadCount}</span></li>
            <li className="flex justify-between">
              <span>Last active</span>
              <span className="text-[var(--dash-text)]">{staff?.lastLoginAt ? formatDateTime(staff.lastLoginAt) : "Never"}</span>
            </li>
          </ul>
        </section>

        <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Status</h2>
            <OsBadge tone={employee.status === "active" ? "ok" : employee.status === "on_leave" ? "warn" : "bad"}>
              {SALES_EMPLOYEE_STATUS_LABELS[employee.status as keyof typeof SALES_EMPLOYEE_STATUS_LABELS]}
            </OsBadge>
          </div>
          <OsActionForm action={updateSalesEmployeeStatus} submitLabel="Update status" className="grid max-w-xs gap-3">
            <input type="hidden" name="employeeId" value={employeeId} />
            <Field label="Status">
              <OsSelect
                name="status"
                options={Object.entries(SALES_EMPLOYEE_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
                defaultValue={employee.status}
              />
            </Field>
          </OsActionForm>
        </section>
      </div>
    </OsPage>
  );
}
