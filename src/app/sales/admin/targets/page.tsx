export const dynamic = "force-dynamic";

import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesTarget } from "@/models/sales/SalesTarget";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { StaffUser } from "@/models/os/StaffUser";
import { createSalesTarget } from "@/actions/sales/targets";
import { OsActionForm } from "@/components/os/OsActionForm";
import { SalesModal } from "@/components/sales/SalesModal";
import { OsSelect } from "@/components/os/OsSelect";
import { Field, OsPage, OsTable, Td, Th, osInputClass } from "@/components/os/ui";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

const PERIOD_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

export default async function SalesAdminTargetsPage() {
  await requireSalesAdminPage();
  const employees = await SalesEmployee.find({ status: "active", isSalesAdmin: false }).lean();
  const staffUsers = await StaffUser.find({ _id: { $in: employees.map((e) => e.staffUserId) } }).select("name").lean();
  const staffById = new Map(staffUsers.map((s) => [String(s._id), s]));

  const targets = await SalesTarget.find({}).sort({ periodStart: -1 }).limit(50).lean();
  const employeeById = new Map(employees.map((e) => [String(e._id), e]));
  const nameForEmployeeId = (employeeId: unknown) => {
    const employee = employeeById.get(String(employeeId));
    if (!employee) return "—";
    return staffById.get(String(employee.staffUserId))?.name || employee.employeeCode || "—";
  };
  const employeeOptions = employees.map((e) => ({
    value: String(e._id),
    label: staffById.get(String(e.staffUserId))?.name || e.employeeCode || "—",
  }));

  return (
    <OsPage
      title="Sales Targets"
      subtitle="Set daily, weekly, monthly, or quarterly targets per employee."
      backHref="/sales/admin"
      backLabel="Back to dashboard"
      actions={
        <SalesModal triggerLabel="Set a target" title="Set a target">
          <OsActionForm action={createSalesTarget} submitLabel="Set target" className="grid gap-3">
            <Field label="Employee">
              <OsSelect name="employeeId" options={employeeOptions} defaultValue="" placeholder="Choose…" required />
            </Field>
            <Field label="Period">
              <OsSelect name="period" options={PERIOD_OPTIONS} defaultValue="monthly" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Period start">
                <input name="periodStart" type="date" required className={osInputClass()} />
              </Field>
              <Field label="Period end">
                <input name="periodEnd" type="date" required className={osInputClass()} />
              </Field>
            </div>
            <Field label="Target value (₹)">
              <input name="targetValue" type="number" min={0} required className={osInputClass()} />
            </Field>
          </OsActionForm>
        </SalesModal>
      }
    >
      <OsTable>
        <thead>
          <tr><Th>Employee</Th><Th>Period</Th><Th>Range</Th><Th>Target</Th></tr>
        </thead>
        <tbody>
          {targets.map((t) => (
            <tr key={String(t._id)}>
              <Td>{nameForEmployeeId(t.employeeId)}</Td>
              <Td className="capitalize">{t.period}</Td>
              <Td>{formatDate(t.periodStart)} – {formatDate(t.periodEnd)}</Td>
              <Td>{formatCurrencyINR(t.targetValue)}</Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {targets.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No targets set yet.</p> : null}
    </OsPage>
  );
}
