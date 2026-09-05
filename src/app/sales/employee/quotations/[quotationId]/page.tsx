export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { requireSalesPage } from "@/lib/sales/page";
import { SalesQuotation } from "@/models/sales/SalesQuotation";
import { updateSalesQuotationStatus, duplicateSalesQuotation } from "@/actions/sales/quotations";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsBadge, OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { SALES_QUOTATION_STATUSES } from "@/lib/sales/constants";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

async function updateQuotationStatusForm(formData: FormData) {
  "use server";
  await updateSalesQuotationStatus({}, formData);
}

export default async function SalesQuotationDetailPage({
  params,
}: {
  params: Promise<{ quotationId: string }>;
}) {
  const staff = await requireSalesPage("docs.quotations");
  const { quotationId } = await params;
  if (!Types.ObjectId.isValid(quotationId)) notFound();

  const quotation = await SalesQuotation.findById(quotationId).lean();
  if (!quotation) notFound();
  if (!staff.isSalesAdmin && String(quotation.ownerEmployeeId) !== staff.employeeId) notFound();

  const items = quotation.items as { name: string; quantity: number; price: number }[];
  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);
  const afterDiscount = subtotal * (1 - (quotation.discountPercent || 0) / 100);
  const total = afterDiscount * (1 + (quotation.taxPercent || 0) / 100);

  return (
    <OsPage
      title={quotation.quotationNumber}
      subtitle={quotation.customerName}
      backHref="/sales/employee/quotations"
      backLabel="Back to quotations"
    >
      <div className="mb-6 flex items-center gap-3">
        <OsBadge tone={quotation.status === "accepted" ? "ok" : quotation.status === "rejected" || quotation.status === "expired" ? "bad" : "accent"}>
          {quotation.status.replace("_", " ")}
        </OsBadge>
        {quotation.validUntil ? <span className="font-inter text-sm text-[var(--dash-muted)]">Valid until {formatDate(quotation.validUntil)}</span> : null}
      </div>

      <OsTable>
        <thead>
          <tr><Th>Item</Th><Th>Qty</Th><Th>Price</Th><Th>Total</Th></tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <Td>{item.name}</Td>
              <Td>{item.quantity}</Td>
              <Td>{formatCurrencyINR(item.price)}</Td>
              <Td>{formatCurrencyINR(item.quantity * item.price)}</Td>
            </tr>
          ))}
        </tbody>
      </OsTable>

      <div className="mt-4 max-w-sm space-y-1 font-inter text-sm text-[var(--dash-muted)]">
        <p className="flex justify-between"><span>Subtotal</span><span className="text-[var(--dash-text)]">{formatCurrencyINR(subtotal)}</span></p>
        <p className="flex justify-between"><span>Discount ({quotation.discountPercent || 0}%)</span><span className="text-[var(--dash-text)]">-{formatCurrencyINR(subtotal - afterDiscount)}</span></p>
        <p className="flex justify-between"><span>Tax ({quotation.taxPercent || 0}%)</span><span className="text-[var(--dash-text)]">+{formatCurrencyINR(total - afterDiscount)}</span></p>
        <p className="flex justify-between border-t border-[var(--dash-border)] pt-1 font-medium text-[var(--dash-text)]"><span>Total</span><span>{formatCurrencyINR(total)}</span></p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <form action={updateQuotationStatusForm} className="flex flex-wrap gap-1">
          <input type="hidden" name="quotationId" value={quotationId} />
          {SALES_QUOTATION_STATUSES.filter((s) => s !== quotation.status).map((s) => (
            <button
              key={s}
              type="submit"
              name="status"
              value={s}
              className="rounded-full border border-[var(--dash-border)] px-3 py-1.5 font-inter text-xs capitalize text-[var(--dash-muted)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
            >
              Mark {s.replace("_", " ")}
            </button>
          ))}
        </form>
        <OsActionForm action={duplicateSalesQuotation} submitLabel="Duplicate / revise" showSubmit className="inline">
          <input type="hidden" name="quotationId" value={quotationId} />
        </OsActionForm>
      </div>
    </OsPage>
  );
}
