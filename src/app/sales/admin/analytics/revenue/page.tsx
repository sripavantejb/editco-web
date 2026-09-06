export const dynamic = "force-dynamic";

import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { OsPage, OsStat } from "@/components/os/ui";
import { formatCurrencyINR } from "@/lib/utils";

export default async function SalesRevenueAnalyticsPage() {
  const staff = await requireSalesAdminPage();
  const scopeFilter = staff.isSalesAdmin ? {} : { ownerEmployeeId: staff.employeeId };
  const won = await SalesDeal.find({ ...scopeFilter, stage: "won" }).lean();

  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(monthStart.getTime() - 1);

  const sumSince = (since: Date, until?: Date) =>
    won
      .filter((d) => d.closedAt && new Date(d.closedAt) >= since && (!until || new Date(d.closedAt) <= until))
      .reduce((s, d) => s + (d.finalOffer || d.value || 0), 0);

  const currentMonth = sumSince(monthStart);
  const prevMonth = sumSince(prevMonthStart, prevMonthEnd);
  const change = prevMonth > 0 ? Math.round(((currentMonth - prevMonth) / prevMonth) * 100) : currentMonth > 0 ? 100 : 0;

  return (
    <OsPage title="Revenue Analytics" subtitle="Closed-won revenue across time windows.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <OsStat label="Today" value={sumSince(todayStart)} />
        <OsStat label="This week" value={sumSince(weekStart)} />
        <OsStat label="This month" value={currentMonth} />
        <OsStat label="This quarter" value={sumSince(quarterStart)} />
        <OsStat label="This year" value={sumSince(yearStart)} />
      </div>
      <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">
        vs previous month ({formatCurrencyINR(prevMonth)}): <span className={change >= 0 ? "text-emerald-400" : "text-red-400"}>{change >= 0 ? "+" : ""}{change}%</span>
      </p>
    </OsPage>
  );
}
