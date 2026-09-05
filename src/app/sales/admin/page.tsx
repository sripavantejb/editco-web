export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { SalesLead } from "@/models/sales/SalesLead";
import { SalesActivityEvent } from "@/models/sales/SalesActivityEvent";
import { SALES_LEAD_STATUS_LABELS, type SalesLeadStatus } from "@/lib/sales/constants";
import { OsPage, OsStat, OsLink } from "@/components/os/ui";
import { formatDateTime } from "@/lib/utils";

export default async function SalesAdminDashboardPage() {
  await requireSalesAdminPage();

  const [employees, leads, activity] = await Promise.all([
    SalesEmployee.find({}).lean(),
    SalesLead.find({ recordStatus: "active" }).lean(),
    SalesActivityEvent.find({}).sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  const activeEmployees = employees.filter((e) => e.status === "active");
  const statusCounts = Object.fromEntries(
    (Object.keys(SALES_LEAD_STATUS_LABELS) as SalesLeadStatus[]).map((s) => [
      s,
      leads.filter((l) => l.status === s).length,
    ])
  );
  const openLeads = leads.filter((l) => !["converted", "lost"].includes(l.status));

  return (
    <OsPage
      title="Sales Admin"
      subtitle="Team overview, lead distribution, and access control for the Editco Sales CRM."
      actions={
        <>
          <OsLink href="/sales/admin/team">Manage employees</OsLink>
          <OsLink href="/sales/admin/leads">All leads</OsLink>
        </>
      }
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OsStat label="Sales employees" value={String(activeEmployees.length)} />
        <OsStat label="Total leads" value={String(leads.length)} />
        <OsStat label="Open leads" value={String(openLeads.length)} />
        <OsStat label="Converted" value={String(statusCounts.converted || 0)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
          <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
            Lead status breakdown
          </h2>
          <ul className="space-y-2 font-inter text-sm text-[var(--dash-muted)]">
            {(Object.keys(SALES_LEAD_STATUS_LABELS) as SalesLeadStatus[]).map((s) => (
              <li key={s} className="flex justify-between">
                <span>{SALES_LEAD_STATUS_LABELS[s]}</span>
                <span className="text-[var(--dash-text)]">{statusCounts[s] || 0}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
              Team
            </h2>
            <Link href="/sales/admin/team" className="font-inter text-sm text-[var(--dash-accent)]">
              View all
            </Link>
          </div>
          <ul className="space-y-2 font-inter text-sm">
            {employees.map((e) => (
              <li key={String(e._id)} className="flex items-center justify-between">
                <Link href={`/sales/admin/team/${e._id}`} className="text-[var(--dash-text)]">
                  {e.employeeCode || String(e._id).slice(-6)}
                  {e.isSalesAdmin ? " (Admin)" : ""}
                </Link>
                <span className="capitalize text-[var(--dash-muted)]">{e.status}</span>
              </li>
            ))}
            {employees.length === 0 ? (
              <li className="text-[var(--dash-muted)]">No sales employees yet.</li>
            ) : null}
          </ul>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
          Latest activity
        </h2>
        <ul className="space-y-2">
          {activity.map((a) => (
            <li
              key={String(a._id)}
              className="rounded-xl border border-[var(--dash-border)] px-4 py-3 font-inter text-sm"
            >
              <span className="font-medium text-[var(--dash-text)]">{a.actorName || "System"}</span>
              <span className="ml-2 text-[var(--dash-text)]">{a.title}</span>
              <span className="ml-2 text-[var(--dash-faint)]">{formatDateTime(a.createdAt)}</span>
            </li>
          ))}
          {activity.length === 0 ? (
            <li className="font-inter text-sm text-[var(--dash-muted)]">No activity yet.</li>
          ) : null}
        </ul>
      </section>
    </OsPage>
  );
}
