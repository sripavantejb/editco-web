export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesLead } from "@/models/sales/SalesLead";
import { SalesCall } from "@/models/sales/SalesCall";
import { SalesMeeting } from "@/models/sales/SalesMeeting";
import { SalesFollowUp } from "@/models/sales/SalesFollowUp";
import { SalesProposal } from "@/models/sales/SalesProposal";
import { SalesQuotation } from "@/models/sales/SalesQuotation";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { OsPage, OsStat } from "@/components/os/ui";

export default async function SalesDailyReportPage() {
  const staff = await requireSalesPage("perf.daily_report");
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const range = { $gte: todayStart, $lte: todayEnd };

  const [leadsReceived, callsMade, meetingsHeld, followUpsDone, proposalsSent, quotationsSent, dealsWon, dealsLost] =
    await Promise.all([
      SalesLead.countDocuments({ assignedEmployeeId: staff.employeeId, createdAt: range }),
      SalesCall.countDocuments({ employeeId: staff.employeeId, calledAt: range }),
      SalesMeeting.countDocuments({ ownerEmployeeId: staff.employeeId, startsAt: range, status: "completed" }),
      SalesFollowUp.countDocuments({ ownerEmployeeId: staff.employeeId, completedAt: range }),
      SalesProposal.countDocuments({ ownerEmployeeId: staff.employeeId, createdAt: range }),
      SalesQuotation.countDocuments({ ownerEmployeeId: staff.employeeId, createdAt: range }),
      SalesDeal.find({ ownerEmployeeId: staff.employeeId, stage: "won", closedAt: range }).lean(),
      SalesDeal.countDocuments({ ownerEmployeeId: staff.employeeId, stage: "lost", closedAt: range }),
    ]);

  const revenue = dealsWon.reduce((s, d) => s + (d.finalOffer || d.value || 0), 0);
  const pending = await SalesFollowUp.countDocuments({ ownerEmployeeId: staff.employeeId, status: "pending" });

  return (
    <OsPage title="Daily Sales Report" subtitle={`Today, ${new Date().toDateString()}.`}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OsStat label="Leads received" value={String(leadsReceived)} />
        <OsStat label="Calls made" value={String(callsMade)} />
        <OsStat label="Meetings held" value={String(meetingsHeld)} />
        <OsStat label="Follow-ups done" value={String(followUpsDone)} />
        <OsStat label="Proposals sent" value={String(proposalsSent)} />
        <OsStat label="Quotations sent" value={String(quotationsSent)} />
        <OsStat label="Deals won" value={String(dealsWon.length)} />
        <OsStat label="Deals lost" value={String(dealsLost)} />
        <OsStat label="Revenue today" value={revenue} />
        <OsStat label="Pending work" value={String(pending)} />
      </div>
    </OsPage>
  );
}
