export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { SalesLead } from "@/models/sales/SalesLead";
import { SalesTask } from "@/models/sales/SalesTask";
import { SalesApproval } from "@/models/sales/SalesApproval";
import { StaffUser } from "@/models/os/StaffUser";
import { SALES_LEAD_STATUS_LABELS, type SalesLeadStatus } from "@/lib/sales/constants";
import { CardTitle, OsPage, OsStat, OsLink, OsGhostLink } from "@/components/os/ui";

export default async function SalesAdminDashboardPage() {
  await requireSalesAdminPage();

  const statusKeys = Object.keys(SALES_LEAD_STATUS_LABELS) as SalesLeadStatus[];
  const now = new Date();

  const [
    activeEmployeeCount,
    totalLeads,
    openLeads,
    convertedCount,
    unassignedCount,
    pendingApprovals,
    overdueTasks,
    statusAgg,
    employees,
  ] = await Promise.all([
    SalesEmployee.countDocuments({ status: "active" }),
    SalesLead.countDocuments({ recordStatus: "active" }),
    SalesLead.countDocuments({
      recordStatus: "active",
      status: { $nin: ["converted", "lost"] },
    }),
    SalesLead.countDocuments({ recordStatus: "active", status: "converted" }),
    SalesLead.countDocuments({
      recordStatus: "active",
      status: { $nin: ["converted", "lost"] },
      $or: [{ assignedEmployeeId: { $exists: false } }, { assignedEmployeeId: null }],
    }),
    SalesApproval.countDocuments({ status: "pending" }),
    SalesTask.countDocuments({
      status: { $ne: "completed" },
      dueDate: { $lt: now },
    }),
    SalesLead.aggregate<{ _id: string; count: number }>([
      { $match: { recordStatus: "active" } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    SalesEmployee.find({ status: "active", isSalesAdmin: false })
      .select("employeeCode staffUserId status")
      .sort({ employeeCode: 1 })
      .limit(12)
      .lean(),
  ]);

  const staffUsers = await StaffUser.find({
    _id: { $in: employees.map((e) => e.staffUserId) },
  })
    .select("name email")
    .lean();
  const staffById = new Map(staffUsers.map((s) => [String(s._id), s]));

  const openLeadDocs = await SalesLead.find({
    recordStatus: "active",
    status: { $nin: ["converted", "lost"] },
  })
    .select("assignedEmployeeId")
    .lean();

  const maxLoad = Math.max(
    1,
    ...employees.map(
      (e) => openLeadDocs.filter((l) => String(l.assignedEmployeeId) === String(e._id)).length
    )
  );

  const workload = employees.map((e) => {
    const count = openLeadDocs.filter(
      (l) => String(l.assignedEmployeeId) === String(e._id)
    ).length;
    return {
      id: String(e._id),
      name: staffById.get(String(e.staffUserId))?.name || e.employeeCode || "—",
      count,
      pct: count === 0 ? 0 : Math.max(20, Math.round((count / maxLoad) * 100)),
    };
  });

  const statusCounts = Object.fromEntries(
    statusKeys.map((s) => [s, statusAgg.find((r) => r._id === s)?.count || 0])
  );

  const conversionRate =
    totalLeads === 0 ? 0 : Math.round((convertedCount / totalLeads) * 100);

  return (
    <OsPage
      title="Dashboard"
      subtitle="Team overview, lead load, and what needs your attention today."
      actions={
        <>
          <OsGhostLink href="/sales/admin/approvals">
            Approvals{pendingApprovals ? ` (${pendingApprovals})` : ""}
          </OsGhostLink>
          <OsLink href="/sales/admin/leads">All leads</OsLink>
        </>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OsStat label="Sales employees" value={String(activeEmployeeCount)} />
        <OsStat label="Open leads" value={String(openLeads)} />
        <OsStat label="Unassigned" value={String(unassignedCount)} />
        <OsStat label="Converted" value={String(convertedCount)} />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Link
          href="/sales/admin/approvals"
          className="block rounded-xl border border-[var(--dash-border)] bg-white p-4 transition-colors hover:border-[#111111]"
        >
          <p className="font-inter text-[11px] uppercase tracking-[0.14em] text-[var(--dash-faint)]">
            Pending approvals
          </p>
          <p className="mt-2 font-archivo text-2xl text-[var(--dash-text)]">{pendingApprovals}</p>
          <p className="mt-1 font-inter text-xs text-[var(--dash-muted)]">Review now →</p>
        </Link>
        <Link
          href="/sales/admin/tasks"
          className="block rounded-xl border border-[var(--dash-border)] bg-white p-4 transition-colors hover:border-[#111111]"
        >
          <p className="font-inter text-[11px] uppercase tracking-[0.14em] text-[var(--dash-faint)]">
            Overdue tasks
          </p>
          <p className="mt-2 font-archivo text-2xl text-[var(--dash-text)]">{overdueTasks}</p>
          <p className="mt-1 font-inter text-xs text-[var(--dash-muted)]">Task board →</p>
        </Link>
        <Link
          href="/sales/admin/leads/assignment"
          className="block rounded-xl border border-[var(--dash-border)] bg-white p-4 transition-colors hover:border-[#111111]"
        >
          <p className="font-inter text-[11px] uppercase tracking-[0.14em] text-[var(--dash-faint)]">
            Team load
          </p>
          <p className="mt-2 font-archivo text-2xl text-[var(--dash-text)]">{employees.length}</p>
          <p className="mt-1 font-inter text-xs text-[var(--dash-muted)]">Assignment →</p>
        </Link>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--dash-border)] bg-white p-5">
          <CardTitle title="Lead status" href="/sales/admin/leads" />
          <ul className="space-y-2.5 font-inter text-sm text-[#6b7280]">
            {statusKeys.map((s) => (
              <li key={s} className="flex justify-between">
                <span>{SALES_LEAD_STATUS_LABELS[s]}</span>
                <span className="font-medium text-[#111111]">{statusCounts[s] || 0}</span>
              </li>
            ))}
            <li className="flex justify-between border-t border-[#f3f4f6] pt-2.5 font-medium text-[#111111]">
              Conversion rate <span>{conversionRate}%</span>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--dash-border)] bg-white p-5">
          <CardTitle title="Team workload" href="/sales/admin/leads/assignment" />
          <ul className="space-y-4">
            {workload.map((w) => (
              <li key={w.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3 font-inter text-sm">
                  <Link
                    href={`/sales/admin/team/${w.id}`}
                    className="truncate font-medium text-[#111111] hover:underline"
                  >
                    {w.name}
                  </Link>
                  <span className="shrink-0 text-[12px] text-[#6b7280]">{w.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#f3f4f6]">
                  <div
                    className="h-full rounded-full bg-[#111111]"
                    style={{ width: `${w.pct}%` }}
                  />
                </div>
              </li>
            ))}
            {workload.length === 0 ? (
              <li className="font-inter text-sm text-[#6b7280]">No sales employees yet.</li>
            ) : null}
          </ul>
        </section>
      </div>
    </OsPage>
  );
}
