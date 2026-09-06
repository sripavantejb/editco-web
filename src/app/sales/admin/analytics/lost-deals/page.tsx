export const dynamic = "force-dynamic";

import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { SALES_LOST_REASON_LABELS, SALES_LOST_REASONS } from "@/lib/sales/constants";
import { formatCurrencyINR } from "@/lib/utils";

export default async function SalesLostDealAnalysisPage() {
  const staff = await requireSalesAdminPage();
  const scopeFilter = staff.isSalesAdmin ? {} : { ownerEmployeeId: staff.employeeId };
  const lostDeals = await SalesDeal.find({ ...scopeFilter, stage: "lost" }).lean();

  const byReason = SALES_LOST_REASONS.map((reason) => {
    const items = lostDeals.filter((d) => d.lostReason === reason);
    return {
      reason,
      label: SALES_LOST_REASON_LABELS[reason],
      count: items.length,
      value: items.reduce((s, d) => s + (d.value || 0), 0),
    };
  }).filter((r) => r.count > 0).sort((a, b) => b.count - a.count);

  return (
    <OsPage title="Lost Deal Analysis" subtitle="Why deals are being lost, so patterns can be fixed.">
      <OsTable>
        <thead>
          <tr><Th>Reason</Th><Th>Deals</Th><Th>Value lost</Th></tr>
        </thead>
        <tbody>
          {byReason.map((r) => (
            <tr key={r.reason}>
              <Td>{r.label}</Td>
              <Td>{r.count}</Td>
              <Td>{formatCurrencyINR(r.value)}</Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {byReason.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No lost deals recorded yet.</p> : null}
    </OsPage>
  );
}
