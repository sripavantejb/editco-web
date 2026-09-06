export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesEmployeeSession } from "@/lib/sales/page";
import { SalesLead } from "@/models/sales/SalesLead";
import { OsBadge, OsPage, OsStat, OsLink, CardTitle } from "@/components/os/ui";
import { SALES_LEAD_STATUS_LABELS, type SalesLeadStatus } from "@/lib/sales/constants";
import { salesLeadTone } from "@/lib/sales/tone";
import { formatDate } from "@/lib/utils";

export default async function SalesEmployeeDashboardPage() {
  const staff = await requireSalesEmployeeSession();
  const canSeeLeads = staff.isSalesAdmin || staff.effective["leads.management"];

  const scope = staff.isSalesAdmin ? {} : { assignedEmployeeId: staff.employeeId };
  const baseFilter = { ...scope, recordStatus: "active" as const };

  let openLeads = 0;
  let newCount = 0;
  let dueFollowUps = 0;
  let totalCount = 0;
  let recentOpen: {
    _id: unknown;
    contactPerson?: string;
    company?: string;
    status: string;
    nextFollowUpAt?: Date | null;
  }[] = [];

  if (canSeeLeads) {
    [openLeads, newCount, dueFollowUps, totalCount, recentOpen] = await Promise.all([
      SalesLead.countDocuments({
        ...baseFilter,
        status: { $nin: ["converted", "lost"] },
      }),
      SalesLead.countDocuments({ ...baseFilter, status: "new" }),
      SalesLead.countDocuments({
        ...baseFilter,
        nextFollowUpAt: { $lte: new Date() },
        status: { $nin: ["converted", "lost"] },
      }),
      SalesLead.countDocuments(baseFilter),
      SalesLead.find({
        ...baseFilter,
        status: { $nin: ["converted", "lost"] },
      })
        .sort({ updatedAt: -1 })
        .limit(8)
        .select("contactPerson company status nextFollowUpAt")
        .lean(),
    ]);
  }

  return (
    <OsPage
      title="Dashboard"
      subtitle={`Welcome back, ${staff.name.split(" ")[0]} — here's what needs attention today.`}
      actions={
        canSeeLeads ? <OsLink href="/sales/employee/leads/new">Add lead</OsLink> : undefined
      }
    >
      {!canSeeLeads ? (
        <div className="rounded-xl border border-dashed border-[var(--dash-border)] bg-white p-10 text-center">
          <p className="font-inter text-sm text-[#6b7280]">
            Your admin hasn&apos;t enabled the Sales Dashboard widgets for your account yet.
            Use the sidebar to get to work.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OsStat label="My open leads" value={String(openLeads)} />
            <OsStat label="New leads" value={String(newCount)} />
            <OsStat label="Follow-ups due" value={String(dueFollowUps)} />
            <OsStat label="Total leads" value={String(totalCount)} />
          </div>

          <section className="flex max-h-72 flex-col overflow-hidden rounded-xl border border-[var(--dash-border)] bg-white p-5">
            <CardTitle title="Open leads" href="/sales/employee/leads" />
            <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-3 font-inter text-sm [scrollbar-gutter:stable]">
              {recentOpen.map((lead) => (
                <li key={String(lead._id)} className="flex items-center justify-between gap-3">
                  <Link
                    href={`/sales/employee/leads/${lead._id}`}
                    className="truncate font-medium text-[#111111]"
                  >
                    {lead.contactPerson}
                    {lead.company ? ` · ${lead.company}` : ""}
                  </Link>
                  <span className="flex shrink-0 items-center gap-2 text-[12px] text-[#6b7280]">
                    <OsBadge tone={salesLeadTone(lead.status)}>
                      {SALES_LEAD_STATUS_LABELS[lead.status as SalesLeadStatus]}
                    </OsBadge>
                    {lead.nextFollowUpAt ? formatDate(lead.nextFollowUpAt) : ""}
                  </span>
                </li>
              ))}
              {recentOpen.length === 0 ? (
                <li className="text-[#6b7280]">
                  No open leads right now.{" "}
                  <Link href="/sales/employee/leads/new" className="font-medium text-[#111111]">
                    Add your first lead
                  </Link>
                  .
                </li>
              ) : null}
            </ul>
          </section>
        </>
      )}
    </OsPage>
  );
}
