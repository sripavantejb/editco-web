export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesPage } from "@/lib/sales/page";
import { SalesLead } from "@/models/sales/SalesLead";
import { deleteSalesLead } from "@/actions/sales/leads";
import { OsSelect } from "@/components/os/OsSelect";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
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
      title="Leads"
      subtitle="Every lead assigned to you — search, filter, and act."
      actions={<OsLink href="/sales/employee/leads/new">Add lead</OsLink>}
    >
      <form className="mb-6 flex flex-wrap items-center gap-3" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, company, email, phone…"
          className={osInputClass() + " max-w-sm"}
        />
        <OsSelect
          name="status"
          options={[
            { value: "all", label: "All statuses" },
            ...Object.entries(SALES_LEAD_STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
          defaultValue={status || "all"}
          className="max-w-xs"
        />
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-lg bg-[#111111] px-4 font-inter text-[13px] font-medium text-white hover:bg-[#222222]"
        >
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
            <Th>{null}</Th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={String(lead._id)}>
              <Td>
                <Link
                  href={`/sales/employee/leads/${lead._id}`}
                  className="font-medium text-[#111111] hover:underline"
                >
                  {lead.contactPerson}
                </Link>
              </Td>
              <Td>{lead.company || "—"}</Td>
              <Td>
                <OsBadge tone={salesLeadTone(lead.status)}>
                  {SALES_LEAD_STATUS_LABELS[lead.status as SalesLeadStatus]}
                </OsBadge>
              </Td>
              <Td>
                <OsBadge tone={salesTemperatureTone(lead.temperature)}>{lead.temperature}</OsBadge>
              </Td>
              <Td>{lead.nextFollowUpAt ? formatDate(lead.nextFollowUpAt) : "—"}</Td>
              <Td>
                <RowDeleteButton
                  action={deleteSalesLead}
                  id={String(lead._id)}
                  confirmMessage="Archive this lead?"
                  label="Delete lead"
                />
              </Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {leads.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[#6b7280]">
          No leads yet.{" "}
          <Link href="/sales/employee/leads/new" className="font-medium text-[#111111]">
            Add your first lead
          </Link>
          .
        </p>
      ) : null}
    </OsPage>
  );
}
