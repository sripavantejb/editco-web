export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { StaffUser } from "@/models/os/StaffUser";
import { createSalesEmployee, deleteSalesEmployee } from "@/actions/sales/employees";
import { OsActionForm } from "@/components/os/OsActionForm";
import { SalesModal } from "@/components/sales/SalesModal";
import { OsSelect } from "@/components/os/OsSelect";
import { Field, OsBadge, OsPage, OsTable, Td, Th, osInputClass } from "@/components/os/ui";
import { SALES_EMPLOYEE_STATUS_LABELS } from "@/lib/sales/constants";
import { formatDateTime } from "@/lib/utils";
import { Trash2 } from "lucide-react";

async function deleteEmployeeForm(formData: FormData) {
  "use server";
  await deleteSalesEmployee({}, formData);
}

export default async function SalesTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireSalesAdminPage();
  const { q = "", status } = await searchParams;

  const employees = await SalesEmployee.find({}).sort({ createdAt: -1 }).lean();
  const staffUsers = await StaffUser.find({ _id: { $in: employees.map((e) => e.staffUserId) } })
    .select("name email lastLoginAt")
    .lean();
  const staffById = new Map(staffUsers.map((s) => [String(s._id), s]));

  const trimmedQ = q.trim().toLowerCase();
  const filtered = employees.filter((e) => {
    if (status && status !== "all" && e.status !== status) return false;
    if (!trimmedQ) return true;
    const staff = staffById.get(String(e.staffUserId));
    return (
      staff?.name?.toLowerCase().includes(trimmedQ) ||
      staff?.email?.toLowerCase().includes(trimmedQ) ||
      e.employeeCode?.toLowerCase().includes(trimmedQ) ||
      e.team?.toLowerCase().includes(trimmedQ) ||
      e.territory?.toLowerCase().includes(trimmedQ)
    );
  });

  return (
    <OsPage
      title="Employee Access / Permissions"
      subtitle="Search your sales team, then open an employee to enable or disable individual CRM modules."
      backHref="/sales/admin"
      backLabel="Back to dashboard"
      actions={
        <SalesModal triggerLabel="Add employee" title="Add employee" subtitle="Creates their login and a Sales Employee profile.">
          <OsActionForm action={createSalesEmployee} submitLabel="Add employee" className="grid gap-3">
            <Field label="Name">
              <input name="name" required className={osInputClass()} />
            </Field>
            <Field label="Email">
              <input name="email" type="email" required className={osInputClass()} />
            </Field>
            <Field label="Password (leave blank for default)">
              <input name="password" type="password" className={osInputClass()} />
            </Field>
            <Field label="Department">
              <input name="department" defaultValue="Sales" className={osInputClass()} />
            </Field>
            <Field label="Team">
              <input name="team" className={osInputClass()} />
            </Field>
            <Field label="Territory">
              <input name="territory" className={osInputClass()} />
            </Field>
            <Field label="Phone">
              <input name="phone" className={osInputClass()} />
            </Field>
          </OsActionForm>
        </SalesModal>
      }
    >
      <form className="mb-6 flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, email, code, team, territory…"
          className={osInputClass() + " max-w-sm"}
        />
        <OsSelect
          name="status"
          options={[{ value: "all", label: "All statuses" }, ...Object.entries(SALES_EMPLOYEE_STATUS_LABELS).map(([value, label]) => ({ value, label }))]}
          defaultValue={status || "all"}
          className="max-w-xs"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--dash-border)] px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-text)]"
        >
          Filter
        </button>
      </form>

      <OsTable>
        <thead>
          <tr>
            <Th>Employee</Th>
            <Th>Email</Th>
            <Th>Team</Th>
            <Th>Territory</Th>
            <Th>Status</Th>
            <Th>Last active</Th>
            <Th>Access</Th>
            <Th>{null}</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e) => {
            const staff = staffById.get(String(e.staffUserId));
            return (
              <tr key={String(e._id)}>
                <Td>
                  <Link href={`/sales/admin/team/${e._id}`} className="font-medium text-[var(--dash-accent)] hover:underline">
                    {staff?.name || staff?.email || e.employeeCode}
                  </Link>
                  {e.isSalesAdmin ? <OsBadge tone="accent">Admin</OsBadge> : null}
                </Td>
                <Td>{staff?.email || "—"}</Td>
                <Td>{e.team || "—"}</Td>
                <Td>{e.territory || "—"}</Td>
                <Td>
                  <OsBadge tone={e.status === "active" ? "ok" : e.status === "on_leave" ? "warn" : "bad"}>
                    {SALES_EMPLOYEE_STATUS_LABELS[e.status as keyof typeof SALES_EMPLOYEE_STATUS_LABELS]}
                  </OsBadge>
                </Td>
                <Td>{staff?.lastLoginAt ? formatDateTime(staff.lastLoginAt) : "Never"}</Td>
                <Td>
                  {e.isSalesAdmin ? (
                    <span className="text-[var(--dash-muted)]">Full access</span>
                  ) : (
                    <Link
                      href={`/sales/admin/team/${e._id}/access`}
                      className="inline-flex min-h-9 items-center rounded-full border border-[var(--dash-border)] px-3 font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
                    >
                      Manage permissions
                    </Link>
                  )}
                </Td>
                <Td>
                  <form action={deleteEmployeeForm}>
                    <input type="hidden" name="employeeId" value={String(e._id)} />
                    <button
                      type="submit"
                      aria-label="Delete employee"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--dash-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </OsTable>
      {filtered.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No employees match.</p>
      ) : null}
    </OsPage>
  );
}
