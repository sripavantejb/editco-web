export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { OsPage, OsStat } from "@/components/os/ui";
import { SALES_DEAL_PIPELINE, SALES_DEAL_STAGE_LABELS } from "@/lib/sales/constants";
import { formatCurrencyINR } from "@/lib/utils";

export default async function SalesForecastPage() {
  const staff = await requireSalesPage("sales.forecast");
  const scopeFilter = staff.isSalesAdmin ? {} : { ownerEmployeeId: staff.employeeId };
  const deals = await SalesDeal.find({ ...scopeFilter, recordStatus: "active" }).lean();

  const openDeals = deals.filter((d) => !["won", "lost"].includes(d.stage));
  const openPipeline = openDeals.reduce((s, d) => s + (d.value || 0), 0);
  const weighted = openDeals.reduce((s, d) => s + (d.value || 0) * ((d.probability || 0) / 100), 0);

  const now = new Date();
  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const byMonth = new Map<string, number>();
  for (const d of openDeals) {
    if (!d.expectedCloseDate) continue;
    const key = monthKey(new Date(d.expectedCloseDate));
    byMonth.set(key, (byMonth.get(key) || 0) + (d.value || 0) * ((d.probability || 0) / 100));
  }
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return monthKey(d);
  });

  return (
    <OsPage
      title="Sales Forecast"
      subtitle="Formula: Deal Value × Probability = Weighted Pipeline."
      backHref="/sales/employee/pipeline"
      backLabel="Back to pipeline"
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <OsStat label="Open pipeline" value={openPipeline} />
        <OsStat label="Weighted pipeline" value={weighted} />
        <OsStat label="Open deals" value={String(openDeals.length)} />
      </div>

      <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
        <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Forecast by month (expected close)</h2>
        <ul className="space-y-2 font-inter text-sm">
          {months.map((m) => (
            <li key={m} className="flex justify-between text-[var(--dash-muted)]">
              <span className="text-[var(--dash-text)]">{m}</span>
              <span>{formatCurrencyINR(byMonth.get(m) || 0)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-[20px] border border-[var(--dash-border)] p-5">
        <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">By stage</h2>
        <ul className="space-y-2 font-inter text-sm">
          {SALES_DEAL_PIPELINE.map((stage) => {
            const items = openDeals.filter((d) => d.stage === stage);
            const value = items.reduce((s, d) => s + (d.value || 0) * ((d.probability || 0) / 100), 0);
            return (
              <li key={stage} className="flex justify-between text-[var(--dash-muted)]">
                <span className="text-[var(--dash-text)]">{SALES_DEAL_STAGE_LABELS[stage]}</span>
                <span>{formatCurrencyINR(value)}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </OsPage>
  );
}
