export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesTarget } from "@/models/sales/SalesTarget";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { OsBadge, OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

export default async function SalesTargetsPage() {
  const staff = await requireSalesPage("perf.targets");
  const now = new Date();
  const targets = await SalesTarget.find({ employeeId: staff.employeeId })
    .sort({ periodStart: -1 })
    .lean();

  // One deals query instead of N+1 per target
  const rangeStart = targets.length
    ? new Date(Math.min(...targets.map((t) => new Date(t.periodStart).getTime())))
    : null;
  const rangeEnd = targets.length
    ? new Date(Math.max(...targets.map((t) => new Date(t.periodEnd).getTime())))
    : null;

  const wonDeals =
    rangeStart && rangeEnd
      ? await SalesDeal.find({
          ownerEmployeeId: staff.employeeId,
          stage: "won",
          closedAt: { $gte: rangeStart, $lte: rangeEnd },
        })
          .select("finalOffer value closedAt")
          .lean()
      : [];

  const rows = targets.map((t) => {
    const start = new Date(t.periodStart).getTime();
    const end = new Date(t.periodEnd).getTime();
    const actual = wonDeals
      .filter((d) => {
        const closed = d.closedAt ? new Date(d.closedAt).getTime() : 0;
        return closed >= start && closed <= end;
      })
      .reduce((s, d) => s + (d.finalOffer || d.value || 0), 0);
    const daysRemaining = Math.max(0, Math.ceil((end - now.getTime()) / 86400000));
    return { ...t, actual, daysRemaining };
  });

  return (
    <OsPage title="Sales Targets" subtitle="Target vs actual, tracked against closed-won deals in the period.">
      <OsTable>
        <thead>
          <tr><Th>Period</Th><Th>Target</Th><Th>Actual</Th><Th>Achievement</Th><Th>Remaining</Th><Th>Days left</Th></tr>
        </thead>
        <tbody>
          {rows.map((t) => {
            const pct = t.targetValue > 0 ? Math.round((t.actual / t.targetValue) * 100) : 0;
            return (
              <tr key={String(t._id)}>
                <Td className="capitalize">{t.period} · {formatDate(t.periodStart)} – {formatDate(t.periodEnd)}</Td>
                <Td>{formatCurrencyINR(t.targetValue)}</Td>
                <Td>{formatCurrencyINR(t.actual)}</Td>
                <Td><OsBadge tone={pct >= 100 ? "ok" : pct >= 70 ? "warn" : "neutral"}>{pct}%</OsBadge></Td>
                <Td>{formatCurrencyINR(Math.max(0, t.targetValue - t.actual))}</Td>
                <Td>{t.daysRemaining}</Td>
              </tr>
            );
          })}
          {rows.length === 0 ? (
            <tr><Td className="text-[var(--dash-muted)]">No targets yet.</Td></tr>
          ) : null}
        </tbody>
      </OsTable>
    </OsPage>
  );
}
