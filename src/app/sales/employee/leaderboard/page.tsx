export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { StaffUser } from "@/models/os/StaffUser";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { OsBadge, OsPage } from "@/components/os/ui";
import { formatCurrencyINR } from "@/lib/utils";

export default async function SalesLeaderboardPage() {
  const staff = await requireSalesPage("perf.leaderboard");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [employees, wonDeals] = await Promise.all([
    SalesEmployee.find({ status: "active", isSalesAdmin: false }).lean(),
    SalesDeal.find({ stage: "won", closedAt: { $gte: monthStart } }).lean(),
  ]);
  const staffUsers = await StaffUser.find({ _id: { $in: employees.map((e) => e.staffUserId) } })
    .select("name email")
    .lean();
  const staffById = new Map(staffUsers.map((s) => [String(s._id), s]));

  const rows = employees
    .map((e) => {
      const deals = wonDeals.filter((d) => String(d.ownerEmployeeId) === String(e._id));
      const revenue = deals.reduce((s, d) => s + (d.finalOffer || d.value || 0), 0);
      return {
        id: String(e._id),
        name: staffById.get(String(e.staffUserId))?.name || "—",
        revenue,
        dealsWon: deals.length,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <OsPage title="Leaderboard" subtitle="This month's closed revenue, team-wide. A shared view of momentum — not a ranking to stress about.">
      <ol className="space-y-2">
        {rows.map((r, i) => (
          <li
            key={r.id}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 font-inter text-sm ${
              r.id === staff.employeeId ? "border-[var(--dash-accent)]" : "border-[var(--dash-border)]"
            }`}
          >
            <span className="flex items-center gap-3">
              <OsBadge tone={i === 0 ? "ok" : "neutral"}>#{i + 1}</OsBadge>
              <span className="text-[var(--dash-text)]">{r.name}</span>
            </span>
            <span className="text-[var(--dash-muted)]">
              {formatCurrencyINR(r.revenue)} · {r.dealsWon} won
            </span>
          </li>
        ))}
        {rows.length === 0 ? <li className="font-inter text-sm text-[var(--dash-muted)]">No closed deals this month yet.</li> : null}
      </ol>
    </OsPage>
  );
}
