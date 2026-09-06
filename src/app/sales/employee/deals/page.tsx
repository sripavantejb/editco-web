export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesPage } from "@/lib/sales/page";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { OsBadge, OsLink, OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { SALES_DEAL_STAGE_LABELS, type SalesDealStage } from "@/lib/sales/constants";
import { salesDealTone } from "@/lib/sales/tone";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

export default async function SalesDealsPage() {
  const staff = await requireSalesPage("sales.deals");
  const scopeFilter = staff.isSalesAdmin ? {} : { ownerEmployeeId: staff.employeeId };
  const deals = await SalesDeal.find({ ...scopeFilter, recordStatus: "active" })
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <OsPage
      title="Deals"
      subtitle="Every deal you own, with value, stage, and expected close date."
      actions={<OsLink href="/sales/employee/deals/new">New deal</OsLink>}
    >
      <OsTable>
        <thead>
          <tr>
            <Th>Deal</Th>
            <Th>Value</Th>
            <Th>Probability</Th>
            <Th>Stage</Th>
            <Th>Expected close</Th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={String(deal._id)}>
              <Td>
                <Link
                  href={`/sales/employee/deals/${deal._id}`}
                  className="font-medium text-[#111111] hover:underline"
                >
                  {deal.dealName}
                </Link>
              </Td>
              <Td>{formatCurrencyINR(deal.value || 0)}</Td>
              <Td>{deal.probability || 0}%</Td>
              <Td>
                <OsBadge tone={salesDealTone(deal.stage)}>
                  {SALES_DEAL_STAGE_LABELS[deal.stage as SalesDealStage]}
                </OsBadge>
              </Td>
              <Td>{deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : "—"}</Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {deals.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[#6b7280]">
          No deals yet. Create one from a qualified lead, or use{" "}
          <Link href="/sales/employee/pipeline" className="font-medium text-[#111111]">
            the pipeline
          </Link>
          .
        </p>
      ) : null}
    </OsPage>
  );
}
