export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesLead } from "@/models/sales/SalesLead";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { StaffUser } from "@/models/os/StaffUser";
import { CardTitle, OsGhostLink, OsPage, OsStat } from "@/components/os/ui";

export default async function LeadAssignmentPage() {
  const staff = await requireSalesAdminPage();

  const employees = await SalesEmployee.find({ status: "active", isSalesAdmin: false }).lean();
  const staffUsers = await StaffUser.find({ _id: { $in: employees.map((e) => e.staffUserId) } })
    .select("name email")
    .lean();
  const staffById = new Map(staffUsers.map((s) => [String(s._id), s]));

  const leads = await SalesLead.find({
    recordStatus: "active",
    status: { $nin: ["converted", "lost"] },
  }).lean();
  const unassigned = leads.filter((l) => !l.assignedEmployeeId);
  const maxCount = Math.max(1, ...employees.map(
    (e) => leads.filter((l) => String(l.assignedEmployeeId) === String(e._id)).length
  ));

  const workload = employees.map((e) => {
    const count = leads.filter((l) => String(l.assignedEmployeeId) === String(e._id)).length;
    return {
      id: String(e._id),
      name: staffById.get(String(e.staffUserId))?.name || "—",
      count,
      pct: Math.max(count === 0 ? 0 : 20, Math.round((count / maxCount) * 100)),
    };
  });

  return (
    <OsPage
      title="Lead assignment"
      subtitle="Team open-lead load at a glance. Reassign from All Leads."
      backHref="/sales/admin"
      backLabel="Dashboard"
      actions={<OsGhostLink href="/sales/admin/leads">All leads</OsGhostLink>}
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <OsStat label="Open leads" value={String(leads.length)} />
        <OsStat label="Unassigned" value={String(unassigned.length)} />
        <OsStat
          label="My open leads"
          value={String(
            leads.filter((l) => String(l.assignedEmployeeId) === staff.employeeId).length
          )}
        />
      </div>

      <section className="rounded-xl border border-[var(--dash-border)] bg-white p-5">
        <CardTitle title="Team workload" href="/sales/admin/leads" actionLabel="Reassign →" />
        <ul className="space-y-4">
          {workload.map((w) => (
            <li key={w.id}>
              <div className="mb-1.5 flex items-center justify-between gap-3 font-inter text-sm">
                <span className="font-medium text-[#111111]">{w.name}</span>
                <span className="shrink-0 text-[12px] text-[#6b7280]">{w.count} open</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#f3f4f6]">
                <div
                  className="h-full rounded-full bg-[#111111] transition-[width]"
                  style={{ width: `${w.count === 0 ? 0 : w.pct}%` }}
                />
              </div>
            </li>
          ))}
          {workload.length === 0 ? (
            <li className="font-inter text-sm text-[#6b7280]">No sales employees yet.</li>
          ) : null}
        </ul>
        {unassigned.length > 0 ? (
          <p className="mt-4 font-inter text-[13px] text-[#6b7280]">
            {unassigned.length} unassigned —{" "}
            <Link href="/sales/admin/leads" className="font-medium text-[#111111] hover:underline">
              assign now
            </Link>
          </p>
        ) : null}
      </section>
    </OsPage>
  );
}
