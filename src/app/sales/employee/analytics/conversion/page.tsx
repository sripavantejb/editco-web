export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesLead } from "@/models/sales/SalesLead";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { SalesMeeting } from "@/models/sales/SalesMeeting";
import { SalesProposal } from "@/models/sales/SalesProposal";
import { OsPage } from "@/components/os/ui";

export default async function SalesConversionAnalyticsPage() {
  const staff = await requireSalesPage("analytics.conversion");
  const leadFilter = staff.isSalesAdmin ? {} : { assignedEmployeeId: staff.employeeId };
  const dealFilter = staff.isSalesAdmin ? {} : { ownerEmployeeId: staff.employeeId };

  const [leads, contacted, qualified, deals, meetings, proposals] = await Promise.all([
    SalesLead.countDocuments({ ...leadFilter, recordStatus: "active" }),
    SalesLead.countDocuments({ ...leadFilter, recordStatus: "active", status: { $ne: "new" } }),
    SalesLead.countDocuments({ ...leadFilter, recordStatus: "active", status: { $in: ["qualified", "converted"] } }),
    SalesDeal.find({ ...dealFilter, recordStatus: "active" }).lean(),
    SalesMeeting.countDocuments({ ...(staff.isSalesAdmin ? {} : { ownerEmployeeId: staff.employeeId }) }),
    SalesProposal.countDocuments({ ...(staff.isSalesAdmin ? {} : { ownerEmployeeId: staff.employeeId }) }),
  ]);

  const negotiation = deals.filter((d) => d.stage === "negotiation").length;
  const won = deals.filter((d) => d.stage === "won").length;

  const stages = [
    { label: "Lead", count: leads },
    { label: "Contacted", count: contacted },
    { label: "Qualified", count: qualified },
    { label: "Meeting", count: meetings },
    { label: "Proposal", count: proposals },
    { label: "Negotiation", count: negotiation },
    { label: "Won", count: won },
  ];

  return (
    <OsPage title="Conversion Analytics" subtitle="Funnel from lead to won, with conversion % between each stage.">
      <ul className="space-y-2">
        {stages.map((s, i) => {
          const prev = i > 0 ? stages[i - 1].count : s.count;
          const pct = prev > 0 ? Math.round((s.count / prev) * 100) : 0;
          return (
            <li key={s.label} className="flex items-center justify-between rounded-xl border border-[var(--dash-border)] px-4 py-3 font-inter text-sm">
              <span className="text-[var(--dash-text)]">{s.label}</span>
              <span className="text-[var(--dash-muted)]">{s.count} {i > 0 ? `(${pct}% of previous)` : ""}</span>
            </li>
          );
        })}
      </ul>
    </OsPage>
  );
}
