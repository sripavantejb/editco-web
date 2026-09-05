export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { StaffUser } from "@/models/os/StaffUser";
import { createSalesAdminAccount } from "@/actions/os/sales-admins";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, OsBadge, OsPage, osInputClass } from "@/components/os/ui";
import "@/models/sales/register";

export default async function SalesAdminsSettingsPage() {
  await requireOsPage("*");

  const admins = await SalesEmployee.find({ isSalesAdmin: true }).sort({ createdAt: -1 }).lean();
  const staffUsers = await StaffUser.find({ _id: { $in: admins.map((a) => a.staffUserId) } })
    .select("name email isActive lastLoginAt")
    .lean();
  const staffById = new Map(staffUsers.map((s) => [String(s._id), s]));

  return (
    <OsPage
      title="Sales CRM admins"
      subtitle="Create the credentials for whoever runs the Sales CRM (/sales/admin). A Sales Admin can then create and manage their own Sales Employees — they cannot create other Sales Admins."
      backHref="/admin/os"
      backLabel="Back to dashboard"
    >
      <OsActionForm action={createSalesAdminAccount} submitLabel="Create Sales Admin" className="mb-10 grid max-w-xl gap-3">
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
      </OsActionForm>

      <div className="space-y-3">
        {admins.map((a) => {
          const staff = staffById.get(String(a.staffUserId));
          return (
            <div key={String(a._id)} className="flex items-center justify-between rounded-2xl border border-[var(--dash-border)] p-4">
              <div>
                <p className="font-inter text-sm text-[var(--dash-text)]">{staff?.name || staff?.email}</p>
                <p className="font-inter text-xs text-[var(--dash-muted)]">{staff?.email} · {a.employeeCode}</p>
              </div>
              <OsBadge tone={a.status === "active" ? "ok" : "bad"}>{a.status}</OsBadge>
            </div>
          );
        })}
        {admins.length === 0 ? (
          <p className="font-inter text-sm text-[var(--dash-muted)]">No Sales Admins yet.</p>
        ) : null}
      </div>
    </OsPage>
  );
}
