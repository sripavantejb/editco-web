export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesEmployeeSession } from "@/lib/sales/page";
import { SalesLead } from "@/models/sales/SalesLead";
import { OsBadge, OsPage, OsStat } from "@/components/os/ui";
import { SALES_LEAD_STATUS_LABELS, type SalesLeadStatus } from "@/lib/sales/constants";
import { salesLeadTone } from "@/lib/sales/tone";
import { formatDate } from "@/lib/utils";

export default async function SalesEmployeeDashboardPage() {
  const staff = await requireSalesEmployeeSession();
  const canSeeLeads = staff.isSalesAdmin || staff.effective["leads.management"];

  const myLeads = canSeeLeads
    ? await SalesLead.find({
        ...(staff.isSalesAdmin ? {} : { assignedEmployeeId: staff.employeeId }),
        recordStatus: "active",
      })
        .sort({ updatedAt: -1 })
        .lean()
    : [];

  const openLeads = myLeads.filter((l) => !["converted", "lost"].includes(l.status));
  const dueFollowUps = myLeads.filter(
    (l) => l.nextFollowUpAt && new Date(l.nextFollowUpAt) <= new Date()
  );
  const newLeads = myLeads.filter((l) => l.status === "new");

  return (
    <OsPage
      title={`Welcome back, ${staff.name.split(" ")[0]}`}
      subtitle="Here's what needs your attention today."
      actions={
        canSeeLeads ? (
          <Link
            href="/sales/employee/leads/new"
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--dash-accent)] px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-on-accent)]"
          >
            Add lead
          </Link>
        ) : undefined
      }
    >
      {!canSeeLeads ? (
        <div className="rounded-[20px] border border-dashed border-[var(--dash-border)] p-10 text-center">
          <p className="font-inter text-sm text-[var(--dash-muted)]">
            Your admin hasn&apos;t enabled the Sales Dashboard widgets for your account yet.
            Use the sidebar to get to work.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OsStat label="My open leads" value={String(openLeads.length)} />
            <OsStat label="New leads" value={String(newLeads.length)} />
            <OsStat label="Follow-ups due" value={String(dueFollowUps.length)} />
            <OsStat label="Total leads" value={String(myLeads.length)} />
          </div>

          <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
                Today's leads
              </h2>
              <Link href="/sales/employee/leads" className="font-inter text-sm text-[var(--dash-accent)]">
                View all
              </Link>
            </div>
            <ul className="space-y-2 font-inter text-sm">
              {openLeads.slice(0, 8).map((lead) => (
                <li key={String(lead._id)} className="flex items-center justify-between">
                  <Link href={`/sales/employee/leads/${lead._id}`} className="text-[var(--dash-text)]">
                    {lead.contactPerson}
                    {lead.company ? ` · ${lead.company}` : ""}
                  </Link>
                  <span className="flex items-center gap-2 text-[var(--dash-muted)]">
                    <OsBadge tone={salesLeadTone(lead.status)}>
                      {SALES_LEAD_STATUS_LABELS[lead.status as SalesLeadStatus]}
                    </OsBadge>
                    {lead.nextFollowUpAt ? formatDate(lead.nextFollowUpAt) : ""}
                  </span>
                </li>
              ))}
              {openLeads.length === 0 ? (
                <li className="text-[var(--dash-muted)]">
                  No open leads right now.{" "}
                  <Link href="/sales/employee/leads/new" className="text-[var(--dash-accent)]">
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
