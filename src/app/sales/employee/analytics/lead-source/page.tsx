export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesLead } from "@/models/sales/SalesLead";
import { OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { SALES_LEAD_SOURCE_LABELS, type SalesLeadSource } from "@/lib/sales/constants";

export default async function SalesLeadSourceAnalyticsPage() {
  const staff = await requireSalesPage("analytics.lead_source");
  const scopeFilter = staff.isSalesAdmin ? {} : { assignedEmployeeId: staff.employeeId };
  const leads = await SalesLead.find({ ...scopeFilter, recordStatus: "active" }).lean();

  const bySource = (Object.keys(SALES_LEAD_SOURCE_LABELS) as SalesLeadSource[]).map((source) => {
    const items = leads.filter((l) => l.source === source);
    const qualified = items.filter((l) => ["qualified", "converted"].includes(l.status)).length;
    const won = items.filter((l) => l.status === "converted").length;
    const conversion = items.length ? Math.round((won / items.length) * 100) : 0;
    return { source, label: SALES_LEAD_SOURCE_LABELS[source], count: items.length, qualified, won, conversion };
  }).filter((r) => r.count > 0).sort((a, b) => b.count - a.count);

  return (
    <OsPage title="Lead Source Analytics" subtitle="Which channels bring in leads that actually convert.">
      <OsTable>
        <thead>
          <tr><Th>Source</Th><Th>Leads</Th><Th>Qualified</Th><Th>Won</Th><Th>Conversion %</Th></tr>
        </thead>
        <tbody>
          {bySource.map((r) => (
            <tr key={r.source}>
              <Td>{r.label}</Td>
              <Td>{r.count}</Td>
              <Td>{r.qualified}</Td>
              <Td>{r.won}</Td>
              <Td>{r.conversion}%</Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {bySource.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No leads yet.</p> : null}
    </OsPage>
  );
}
