export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { SalesCall } from "@/models/sales/SalesCall";
import { SalesMeeting } from "@/models/sales/SalesMeeting";
import { SalesProposal } from "@/models/sales/SalesProposal";
import { SalesFollowUp } from "@/models/sales/SalesFollowUp";
import { OsPage, OsStat } from "@/components/os/ui";
import { formatCurrencyINR } from "@/lib/utils";

export default async function SalesPerformancePage() {
  const staff = await requireSalesPage("perf.performance");
  const [deals, calls, meetings, proposals, followUps] = await Promise.all([
    SalesDeal.find({ ownerEmployeeId: staff.employeeId, recordStatus: "active" }).lean(),
    SalesCall.countDocuments({ employeeId: staff.employeeId }),
    SalesMeeting.countDocuments({ ownerEmployeeId: staff.employeeId }),
    SalesProposal.countDocuments({ ownerEmployeeId: staff.employeeId }),
    SalesFollowUp.countDocuments({ ownerEmployeeId: staff.employeeId, status: "completed" }),
  ]);

  const won = deals.filter((d) => d.stage === "won");
  const lost = deals.filter((d) => d.stage === "lost");
  const revenue = won.reduce((s, d) => s + (d.finalOffer || d.value || 0), 0);
  const conversionRate = deals.length ? Math.round((won.length / deals.length) * 100) : 0;
  const avgDealValue = won.length ? Math.round(revenue / won.length) : 0;

  return (
    <OsPage title="Sales Performance" subtitle="Your numbers, computed from real deal and activity data.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OsStat label="Revenue" value={revenue} />
        <OsStat label="Deals won" value={String(won.length)} />
        <OsStat label="Deals lost" value={String(lost.length)} />
        <OsStat label="Conversion rate" value={`${conversionRate}%`} />
        <OsStat label="Average deal value" value={avgDealValue} />
        <OsStat label="Calls" value={String(calls)} />
        <OsStat label="Meetings" value={String(meetings)} />
        <OsStat label="Proposals" value={String(proposals)} />
        <OsStat label="Follow-ups completed" value={String(followUps)} />
      </div>
      <p className="mt-6 font-inter text-xs text-[var(--dash-faint)]">{formatCurrencyINR(revenue)} closed to date.</p>
    </OsPage>
  );
}
