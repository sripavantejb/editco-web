export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesPage } from "@/lib/sales/page";
import { SalesLead } from "@/models/sales/SalesLead";
import { OsSelect } from "@/components/os/OsSelect";
import { OsBadge, OsLink, OsPage, OsTable, Td, Th, osInputClass } from "@/components/os/ui";
import { SALES_LEAD_STATUS_LABELS, type SalesLeadStatus } from "@/lib/sales/constants";
import { salesLeadTone, salesTemperatureTone } from "@/lib/sales/tone";
import { formatDate } from "@/lib/utils";

export default async function SalesEmployeeLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const staff = await requireSalesPage("leads.management");
  const { q = "", status } = await searchParams;

  const query: Record<string, unknown> = { recordStatus: "active" };
  if (!staff.isSalesAdmin) query.assignedEmployeeId = staff.employeeId;
  if (status && status !== "all") query.status = status;
  const trimmedQ = q.trim();
  if (trimmedQ) {
    query.$or = [
      { contactPerson: new RegExp(trimmedQ, "i") },
      { company: new RegExp(trimmedQ, "i") },
      { email: new RegExp(trimmedQ, "i") },
      { phone: new RegExp(trimmedQ, "i") },
    ];
  }

  const leads = await SalesLead.find(query).sort({ updatedAt: -1 }).limit(100).lean();

  return (
    <OsPage
      title="All Leads"
      subtitle="Every lead assigned to you — search, filter, and act."
      actions={<OsLink href="/sales/employee/leads/new">Add lead</OsLink>}
    >
      <form className="mb-6 flex flex-wrap gap-3" method="get">
        <input name="q" defaultValue={q} placeholder="Search name, company, email, phone…" className={osInputClass() + " max-w-sm"} />
        <OsSelect
          name="status"
          options={[{ value: "all", label: "All statuses" }, ...Object.entries(SALES_LEAD_STATUS_LABELS).map(([value, label]) => ({ value, label }))]}
          defaultValue={status || "all"}
          className="max-w-xs"
        />
        <button type="submit" className="inline-flex min-h-11 items-center rounded-full border border-[var(--dash-border)] px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-text)]">
          Filter
        </button>
      </form>

      <OsTable>
        <thead>
          <tr>
            <Th>Lead</Th>
            <Th>Company</Th>
            <Th>Status</Th>
            <Th>Temperature</Th>
            <Th>Next follow-up</Th>
            <Th>Open</Th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={String(lead._id)}>
              <Td>
                <Link href={`/sales/employee/leads/${lead._id}`} className="font-medium text-[var(--dash-accent)] hover:underline">
                  {lead.contactPerson}
                </Link>
              </Td>
              <Td>{lead.company || "—"}</Td>
              <Td>
                <OsBadge tone={salesLeadTone(lead.status)}>{SALES_LEAD_STATUS_LABELS[lead.status as SalesLeadStatus]}</OsBadge>
              </Td>
              <Td>
                <OsBadge tone={salesTemperatureTone(lead.temperature)}>{lead.temperature}</OsBadge>
              </Td>
              <Td>{lead.nextFollowUpAt ? formatDate(lead.nextFollowUpAt) : "—"}</Td>
              <Td>
                <Link
                  href={`/sales/employee/leads/${lead._id}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-[var(--dash-border)] px-3 font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
                >
                  Open
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {leads.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">
          No leads yet. <Link href="/sales/employee/leads/new" className="text-[var(--dash-accent)]">Add your first lead</Link>.
        </p>
      ) : null}
    </OsPage>
  );
}
