export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { requireSalesPage } from "@/lib/sales/page";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { SalesActivityEvent } from "@/models/sales/SalesActivityEvent";
import { updateSalesDealNegotiation, closeSalesDeal } from "@/actions/sales/deals";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsSelect } from "@/components/os/OsSelect";
import { Field, OsBadge, OsPage, osInputClass, osTextareaClass } from "@/components/os/ui";
import { SALES_DEAL_STAGE_LABELS, SALES_LOST_REASON_LABELS, SALES_LOST_REASONS, type SalesDealStage } from "@/lib/sales/constants";
import { salesDealTone } from "@/lib/sales/tone";
import { formatCurrencyINR, formatDateTime } from "@/lib/utils";

export default async function SalesDealDetailPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const staff = await requireSalesPage("sales.deals");
  const { dealId } = await params;
  if (!Types.ObjectId.isValid(dealId)) notFound();

  const deal = await SalesDeal.findById(dealId).lean();
  if (!deal) notFound();
  if (!staff.isSalesAdmin && String(deal.ownerEmployeeId) !== staff.employeeId) notFound();

  const timeline = await SalesActivityEvent.find({ dealId: deal._id }).sort({ createdAt: -1 }).limit(30).lean();
  const isClosed = deal.stage === "won" || deal.stage === "lost";

  return (
    <OsPage title={deal.dealName} subtitle={formatCurrencyINR(deal.value || 0)} backHref="/sales/employee/deals" backLabel="Back to deals">
      <div className="mb-6">
        <OsBadge tone={salesDealTone(deal.stage)}>{SALES_DEAL_STAGE_LABELS[deal.stage as SalesDealStage]}</OsBadge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {!isClosed ? (
          <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
            <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Negotiation</h2>
            <OsActionForm action={updateSalesDealNegotiation} submitLabel="Save negotiation" className="grid gap-3">
              <input type="hidden" name="dealId" value={dealId} />
              <Field label="Competitor">
                <input name="competitor" defaultValue={deal.competitor} className={osInputClass()} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Discount requested %">
                  <input name="discountRequested" type="number" defaultValue={deal.discountRequested || 0} className={osInputClass()} />
                </Field>
                <Field label="Discount approved %">
                  <input name="discountApproved" type="number" defaultValue={deal.discountApproved || 0} className={osInputClass()} />
                </Field>
              </div>
              <Field label="Current offer (₹)">
                <input name="currentOffer" type="number" defaultValue={deal.currentOffer || 0} className={osInputClass()} />
              </Field>
              <Field label="Notes">
                <textarea name="notes" defaultValue={deal.notes} className={osTextareaClass()} />
              </Field>
            </OsActionForm>
          </section>
        ) : (
          <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
            <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Outcome</h2>
            <ul className="space-y-2 font-inter text-sm text-[var(--dash-muted)]">
              <li className="flex justify-between"><span>Final value</span><span className="text-[var(--dash-text)]">{formatCurrencyINR(deal.finalOffer || deal.value || 0)}</span></li>
              <li className="flex justify-between"><span>Payment status</span><span className="text-[var(--dash-text)]">{deal.paymentStatus || "—"}</span></li>
              {deal.stage === "lost" ? (
                <li className="flex justify-between"><span>Lost reason</span><span className="text-[var(--dash-text)]">{SALES_LOST_REASON_LABELS[deal.lostReason as keyof typeof SALES_LOST_REASON_LABELS] || "—"}</span></li>
              ) : null}
            </ul>
          </section>
        )}

        {!isClosed ? (
          <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
            <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Deal Closure</h2>
            <OsActionForm action={closeSalesDeal} submitLabel="Close deal" className="grid gap-3">
              <input type="hidden" name="dealId" value={dealId} />
              <Field label="Outcome">
                <OsSelect name="outcome" options={[{ value: "won", label: "Won" }, { value: "lost", label: "Lost" }]} defaultValue="won" />
              </Field>
              <Field label="Final value (₹)">
                <input name="finalOffer" type="number" defaultValue={deal.value || 0} className={osInputClass()} />
              </Field>
              <Field label="Payment status">
                <input name="paymentStatus" placeholder="e.g. Advance received" className={osInputClass()} />
              </Field>
              <Field label="Lost reason (if lost)">
                <OsSelect
                  name="lostReason"
                  options={[{ value: "", label: "—" }, ...SALES_LOST_REASONS.map((r) => ({ value: r, label: SALES_LOST_REASON_LABELS[r] }))]}
                  defaultValue=""
                />
              </Field>
              <Field label="Lost notes">
                <textarea name="lostNotes" className={osTextareaClass()} />
              </Field>
            </OsActionForm>
          </section>
        ) : null}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Deal timeline</h2>
        <ul className="space-y-2">
          {timeline.map((event) => (
            <li key={String(event._id)} className="rounded-xl border border-[var(--dash-border)] px-4 py-3 font-inter text-sm">
              <span className="text-[var(--dash-text)]">{event.title}</span>
              <span className="ml-2 text-[var(--dash-faint)]">{formatDateTime(event.createdAt)}</span>
            </li>
          ))}
          {timeline.length === 0 ? <li className="font-inter text-sm text-[var(--dash-muted)]">No activity yet.</li> : null}
        </ul>
      </section>
    </OsPage>
  );
}
