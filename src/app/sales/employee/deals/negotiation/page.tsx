export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesPage } from "@/lib/sales/page";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { formatCurrencyINR } from "@/lib/utils";

export default async function SalesNegotiationPage() {
  const staff = await requireSalesPage("sales.negotiation");
  const scopeFilter = staff.isSalesAdmin ? {} : { ownerEmployeeId: staff.employeeId };
  const deals = await SalesDeal.find({ ...scopeFilter, stage: "negotiation", recordStatus: "active" })
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <OsPage title="Negotiation Tracking" subtitle="Deals currently being negotiated." backHref="/sales/employee/pipeline" backLabel="Back to pipeline">
      <OsTable>
        <thead>
          <tr>
            <Th>Deal</Th>
            <Th>Value</Th>
            <Th>Current offer</Th>
            <Th>Discount requested</Th>
            <Th>Competitor</Th>
            <Th>Open</Th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={String(deal._id)}>
              <Td>{deal.dealName}</Td>
              <Td>{formatCurrencyINR(deal.value || 0)}</Td>
              <Td>{formatCurrencyINR(deal.currentOffer || 0)}</Td>
              <Td>{deal.discountRequested || 0}%</Td>
              <Td>{deal.competitor || "—"}</Td>
              <Td>
                <Link href={`/sales/employee/deals/${deal._id}`} className="text-[var(--dash-accent)] hover:underline">
                  Open
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {deals.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No deals in negotiation.</p> : null}
    </OsPage>
  );
}
