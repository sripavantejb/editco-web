export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesPage } from "@/lib/sales/page";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { OsBadge, OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { salesDealTone } from "@/lib/sales/tone";
import { SALES_DEAL_STAGE_LABELS, type SalesDealStage } from "@/lib/sales/constants";
import { formatCurrencyINR } from "@/lib/utils";

export default async function SalesClosurePage() {
  const staff = await requireSalesPage("sales.closure");
  const scopeFilter = staff.isSalesAdmin ? {} : { ownerEmployeeId: staff.employeeId };
  const deals = await SalesDeal.find({
    ...scopeFilter,
    stage: { $in: ["proposal", "negotiation", "won", "lost"] },
    recordStatus: "active",
  })
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  return (
    <OsPage title="Deal Closure" subtitle="Deals close to closing, and recently won or lost." backHref="/sales/employee/pipeline" backLabel="Back to pipeline">
      <OsTable>
        <thead>
          <tr>
            <Th>Deal</Th>
            <Th>Value</Th>
            <Th>Stage</Th>
            <Th>Open</Th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={String(deal._id)}>
              <Td>{deal.dealName}</Td>
              <Td>{formatCurrencyINR(deal.value || 0)}</Td>
              <Td>
                <OsBadge tone={salesDealTone(deal.stage)}>{SALES_DEAL_STAGE_LABELS[deal.stage as SalesDealStage]}</OsBadge>
              </Td>
              <Td>
                <Link href={`/sales/employee/deals/${deal._id}`} className="text-[var(--dash-accent)] hover:underline">
                  Open
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {deals.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">Nothing close to closing yet.</p> : null}
    </OsPage>
  );
}
