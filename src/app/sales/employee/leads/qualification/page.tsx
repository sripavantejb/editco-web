export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesPage } from "@/lib/sales/page";
import { SalesLead } from "@/models/sales/SalesLead";
import { OsBadge, OsPage } from "@/components/os/ui";
import { salesLeadTone } from "@/lib/sales/tone";

/** New -> Contacted -> Qualified -> Meeting -> Proposal -> Negotiation -> Won/Lost (spec §6). */
const QUALIFICATION_STAGES: { status: string; label: string }[] = [
  { status: "new", label: "New" },
  { status: "contacted", label: "Contacted" },
  { status: "qualified", label: "Qualified" },
];

export default async function LeadQualificationPage() {
  const staff = await requireSalesPage("leads.qualification");
  const scopeFilter = staff.isSalesAdmin ? {} : { assignedEmployeeId: staff.employeeId };
  const leads = await SalesLead.find({ ...scopeFilter, recordStatus: "active" }).sort({ updatedAt: -1 }).lean();

  return (
    <OsPage
      title="Lead Qualification"
      subtitle="Move leads through New → Contacted → Qualified. Open a lead to record budget, timeline, and decision maker."
      backHref="/sales/employee/leads"
      backLabel="Back to leads"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {QUALIFICATION_STAGES.map((stage) => {
          const items = leads.filter((l) => l.status === stage.status);
          return (
            <section key={stage.status} className="rounded-[20px] border border-[var(--dash-border)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">{stage.label}</h2>
                <OsBadge tone="neutral">{items.length}</OsBadge>
              </div>
              <ul className="space-y-2">
                {items.map((lead) => (
                  <li key={String(lead._id)}>
                    <Link
                      href={`/sales/employee/leads/${lead._id}`}
                      className="block rounded-xl border border-[var(--dash-border)] px-3 py-2.5 font-inter text-sm text-[var(--dash-text)] hover:border-[var(--dash-accent)]"
                    >
                      <span className="block font-medium">{lead.contactPerson}</span>
                      <span className="text-[var(--dash-muted)]">
                        {lead.company || "—"} · Prob. {lead.probability || 0}%
                      </span>
                    </Link>
                  </li>
                ))}
                {items.length === 0 ? <li className="font-inter text-xs text-[var(--dash-muted)]">Nothing here.</li> : null}
              </ul>
            </section>
          );
        })}
      </div>
      <p className="mt-4 font-inter text-xs text-[var(--dash-faint)]">
        Tones: <OsBadge tone={salesLeadTone("qualified")}>Qualified</OsBadge> shows once a lead clears this stage.
      </p>
    </OsPage>
  );
}
