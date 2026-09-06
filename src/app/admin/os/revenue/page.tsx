export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { Invoice } from "@/models/os/Invoice";
import { SalesDeal } from "@/models/sales/SalesDeal";
import { ManualRevenue } from "@/models/os/ManualRevenue";
import { createManualRevenue, archiveManualRevenue } from "@/actions/os/revenue";
import { archiveInvoice } from "@/actions/os/invoices";
import { OsActionForm } from "@/components/os/OsActionForm";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import { Field, OsBadge, OsPage, OsStat, OsTable, Td, Th, osInputClass, osTextareaClass } from "@/components/os/ui";
import { SalesModal } from "@/components/sales/SalesModal";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { hasPermission } from "@/lib/os/permissions";
import "@/models/sales/register";

export default async function RevenuePage() {
  const staff = await requireOsPage("finance:read");
  const canDeleteManual = hasPermission(staff.permissions, "payments:write");
  const canDeleteInvoice = hasPermission(staff.permissions, "invoices:write");

  const [invoices, wonDeals, manualEntries] = await Promise.all([
    Invoice.find({ recordStatus: "active" }).select("amountPaid paymentDate billToName createdAt").lean(),
    SalesDeal.find({ stage: "won", recordStatus: "active" })
      .select("dealName value finalOffer closedAt updatedAt")
      .lean(),
    ManualRevenue.find({ recordStatus: "active" }).sort({ receivedAt: -1 }).lean(),
  ]);

  type RevenueRow = {
    id: string;
    label: string;
    source: "Sales CRM" | "Editco OS" | "Manual";
    amount: number;
    date: Date;
  };

  const osRows: RevenueRow[] = invoices
    .filter((i) => (i.amountPaid || 0) > 0)
    .map((i) => ({
      id: String(i._id),
      label: i.billToName || "Invoice",
      source: "Editco OS" as const,
      amount: i.amountPaid || 0,
      date: i.paymentDate || i.createdAt,
    }));

  const salesRows: RevenueRow[] = wonDeals.map((d) => ({
    id: String(d._id),
    label: d.dealName,
    source: "Sales CRM" as const,
    amount: d.finalOffer || d.value || 0,
    date: d.closedAt || d.updatedAt,
  }));

  const manualRows: RevenueRow[] = manualEntries.map((m) => ({
    id: String(m._id),
    label: m.source,
    source: "Manual" as const,
    amount: m.amount,
    date: m.receivedAt,
  }));

  const rows = [...osRows, ...salesRows, ...manualRows].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const salesTotal = salesRows.reduce((s, r) => s + r.amount, 0);
  const osTotal = osRows.reduce((s, r) => s + r.amount, 0);
  const manualTotal = manualRows.reduce((s, r) => s + r.amount, 0);
  const grandTotal = salesTotal + osTotal + manualTotal;

  return (
    <OsPage
      title="Revenue Overview"
      subtitle="Every rupee collected, combined — Sales CRM won deals, Editco OS payments, and manual entries."
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={
        <SalesModal triggerLabel="Add manual revenue" title="Add manual revenue">
          <OsActionForm action={createManualRevenue} submitLabel="Add entry" className="grid gap-3">
            <Field label="Source">
              <input name="source" required placeholder="e.g. Cash sale, Retainer" className={osInputClass()} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount (₹)">
                <input name="amount" type="number" min="0" step="0.01" required className={osInputClass()} />
              </Field>
              <Field label="Received on">
                <input name="receivedAt" type="date" required className={osInputClass()} />
              </Field>
            </div>
            <Field label="Description">
              <input name="description" className={osInputClass()} />
            </Field>
            <Field label="Notes">
              <textarea name="notes" className={osTextareaClass()} />
            </Field>
          </OsActionForm>
        </SalesModal>
      }
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OsStat label="Total revenue" value={formatCurrencyINR(grandTotal)} />
        <OsStat label="Sales CRM (won deals)" value={formatCurrencyINR(salesTotal)} />
        <OsStat label="Editco OS (payments)" value={formatCurrencyINR(osTotal)} />
        <OsStat label="Manual entries" value={formatCurrencyINR(manualTotal)} />
      </div>

      <OsTable>
        <thead>
          <tr>
            <Th>Source</Th>
            <Th>Label</Th>
            <Th>Amount</Th>
            <Th>Date</Th>
            <Th>Delete</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.source}-${r.id}`}>
              <Td>
                <OsBadge tone={r.source === "Editco OS" ? "accent" : r.source === "Sales CRM" ? "ok" : "warn"}>
                  {r.source}
                </OsBadge>
              </Td>
              <Td>{r.label}</Td>
              <Td>{formatCurrencyINR(r.amount)}</Td>
              <Td className="whitespace-nowrap">{formatDate(r.date)}</Td>
              <Td>
                {r.source === "Manual" && canDeleteManual ? (
                  <RowDeleteButton
                    action={archiveManualRevenue}
                    id={r.id}
                    confirmMessage={`Delete manual revenue "${r.label}"?`}
                  />
                ) : r.source === "Editco OS" && canDeleteInvoice ? (
                  <RowDeleteButton
                    action={archiveInvoice}
                    id={r.id}
                    confirmMessage={`Delete invoice revenue row for "${r.label}"?`}
                  />
                ) : (
                  <span className="text-xs text-[var(--dash-muted)]">—</span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {rows.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No revenue recorded yet from any source.</p>
      ) : null}
    </OsPage>
  );
}
