export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesLead } from "@/models/sales/SalesLead";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { OsPage, OsStat } from "@/components/os/ui";

const REPORT_LINKS = [
  { href: "/sales/employee/reports/daily", label: "Daily Sales Report" },
  { href: "/sales/employee/performance", label: "Employee-wise performance" },
  { href: "/sales/admin/analytics/revenue", label: "Revenue report" },
  { href: "/sales/admin/analytics/lead-source", label: "Lead-source report" },
  { href: "/sales/admin/analytics/lost-deals", label: "Lost-deal report" },
];

export default async function SalesReportsPage() {
  const staff = await requireSalesAdminPage();
  const scopeLead = staff.isSalesAdmin ? {} : { assignedEmployeeId: staff.employeeId };
  const scopeDeal = staff.isSalesAdmin ? {} : { ownerEmployeeId: staff.employeeId };
  const [leads, deals] = await Promise.all([
    SalesLead.countDocuments({ ...scopeLead, recordStatus: "active" }),
    SalesDeal.find({ ...scopeDeal, recordStatus: "active" }).lean(),
  ]);
  const won = deals.filter((d) => d.stage === "won").length;
  const revenue = deals.filter((d) => d.stage === "won").reduce((s, d) => s + (d.finalOffer || d.value || 0), 0);

  return (
    <OsPage title="Reports" subtitle="Jump into any report. Export is available on each report's data view.">
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <OsStat label="Total leads" value={String(leads)} />
        <OsStat label="Deals won" value={String(won)} />
        <OsStat label="Revenue" value={revenue} />
      </div>
      <ul className="space-y-2">
        {REPORT_LINKS.map((r) => (
          <li key={r.href}>
            <Link href={r.href} className="block rounded-xl border border-[var(--dash-border)] px-4 py-3 font-inter text-sm text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]">
              {r.label}
            </Link>
          </li>
        ))}
      </ul>
    </OsPage>
  );
}
