export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesPage } from "@/lib/sales/page";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { OsBadge, OsLink, OsPage } from "@/components/os/ui";
import { SALES_DEAL_PIPELINE, SALES_DEAL_STAGE_LABELS, type SalesDealStage } from "@/lib/sales/constants";
import { moveSalesDealStage } from "@/actions/sales/deals";
import { formatCurrencyINR } from "@/lib/utils";

async function moveStageForm(formData: FormData) {
  "use server";
  await moveSalesDealStage({}, formData);
}

export default async function SalesPipelinePage() {
  const staff = await requireSalesPage("sales.pipeline");
  const scopeFilter = staff.isSalesAdmin ? {} : { ownerEmployeeId: staff.employeeId };
  const deals = await SalesDeal.find({ ...scopeFilter, recordStatus: "active" }).sort({ updatedAt: -1 }).lean();

  const pipelineValue = deals
    .filter((d) => !["won", "lost"].includes(d.stage))
    .reduce((s, d) => s + (d.value || 0), 0);
  const weightedValue = deals
    .filter((d) => !["won", "lost"].includes(d.stage))
    .reduce((s, d) => s + (d.value || 0) * ((d.probability || 0) / 100), 0);

  return (
    <OsPage
      title="Sales Pipeline"
      subtitle={`Pipeline value ${formatCurrencyINR(pipelineValue)} · Weighted ${formatCurrencyINR(weightedValue)}`}
      actions={<OsLink href="/sales/employee/deals">All deals</OsLink>}
    >
      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {SALES_DEAL_PIPELINE.map((stage) => {
          const items = deals.filter((d) => d.stage === stage);
          const stageValue = items.reduce((s, d) => s + (d.value || 0), 0);
          return (
            <section key={stage} className="rounded-[20px] border border-[var(--dash-border)] p-4">
              <div className="mb-3">
                <h2 className="font-archivo text-xs uppercase tracking-wide text-[var(--dash-text)]">
                  {SALES_DEAL_STAGE_LABELS[stage]}
                </h2>
                <p className="font-inter text-xs text-[var(--dash-muted)]">
                  {items.length} · {formatCurrencyINR(stageValue)}
                </p>
              </div>
              <ul className="space-y-2">
                {items.map((deal) => (
                  <li key={String(deal._id)} className="rounded-xl border border-[var(--dash-border)] p-3">
                    <Link href={`/sales/employee/deals/${deal._id}`} className="block font-inter text-sm font-medium text-[var(--dash-text)] hover:text-[var(--dash-accent)]">
                      {deal.dealName}
                    </Link>
                    <p className="mt-1 font-inter text-xs text-[var(--dash-muted)]">
                      {formatCurrencyINR(deal.value || 0)} · {deal.probability || 0}%
                    </p>
                    <details className="mt-2">
                      <summary className="cursor-pointer font-inter text-[11px] text-[var(--dash-muted)]">Move</summary>
                      <form action={moveStageForm} className="mt-2 flex flex-wrap gap-1">
                        <input type="hidden" name="dealId" value={String(deal._id)} />
                        {SALES_DEAL_PIPELINE.concat(["won", "lost"] as unknown as SalesDealStage[])
                          .filter((s) => s !== stage)
                          .map((s) => (
                            <button
                              key={s}
                              type="submit"
                              name="stage"
                              value={s}
                              className="rounded-full border border-[var(--dash-border)] px-2 py-1 font-inter text-[10px] text-[var(--dash-muted)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
                            >
                              {SALES_DEAL_STAGE_LABELS[s]}
                            </button>
                          ))}
                      </form>
                    </details>
                  </li>
                ))}
                {items.length === 0 ? <li className="font-inter text-xs text-[var(--dash-muted)]">Empty.</li> : null}
              </ul>
            </section>
          );
        })}
      </div>
      <div className="mt-6 flex gap-3">
        <OsBadge tone="ok">Won: {deals.filter((d) => d.stage === "won").length}</OsBadge>
        <OsBadge tone="bad">Lost: {deals.filter((d) => d.stage === "lost").length}</OsBadge>
      </div>
    </OsPage>
  );
}
