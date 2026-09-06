export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { requireOsPage } from "@/lib/os/page";
import { Invoice } from "@/models/os/Invoice";
import { Payment } from "@/models/os/Payment";
import { Conversion } from "@/models/os/Conversion";
import { Vendor } from "@/models/os/Vendor";
import { AuditLog } from "@/models/os/AuditLog";
import { updateInvoice, archiveInvoice } from "@/actions/os/invoices";
import { recordPayment, archivePayment } from "@/actions/os/payments";
import { displayInvoiceStatus, outstandingOf } from "@/lib/os/money";
import { OsActionForm } from "@/components/os/OsActionForm";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import {
  Field,
  OsLink,
  OsPage,
  osInputClass,
  invoiceTone,
  OsBadge,
} from "@/components/os/ui";
import { OsDateInput } from "@/components/os/OsDateInput";
import { InvoiceEditor } from "@/components/os/InvoiceEditor";
import { ShareInvoiceForm } from "@/components/os/ShareInvoiceForm";
import { INVOICE_STATUS_LABELS } from "@/lib/os/constants";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { hasPermission } from "@/lib/os/permissions";

async function deleteInvoiceAndLeave(
  _prev: { error?: string; success?: string },
  formData: FormData
) {
  "use server";
  const result = await archiveInvoice({}, formData);
  if (!result.error) redirect("/admin/os/invoices");
  return result;
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireOsPage("invoices:read");
  const { id } = await params;
  const invoice = await Invoice.findById(id).lean();
  if (!invoice) notFound();
  const conversion = await Conversion.findOne({
    conversionUuid: invoice.conversionUuid,
  }).lean();
  const vendor = await Vendor.findById(invoice.vendorId).lean();
  const payments = await Payment.find({
    invoiceId: invoice._id,
    recordStatus: "active",
  })
    .sort({ paidAt: -1 })
    .lean();
  const audits = await AuditLog.find({
    entityType: "invoice",
    entityId: id,
  })
    .sort({ createdAt: -1 })
    .lean();
  const st = displayInvoiceStatus({
    status: invoice.status,
    dueDate: invoice.dueDate,
    amountPaid: invoice.amountPaid || 0,
    total: invoice.total || 0,
  });
  const canWrite = hasPermission(staff.permissions, "invoices:write");
  const canPay = hasPermission(staff.permissions, "payments:write");

  const billToName =
    invoice.billToName || vendor?.companyName || "";
  const billToEmail = invoice.billToEmail || vendor?.email || "";

  return (
    <OsPage
      title={invoice.invoiceNumber}
      subtitle={conversion?.publicCode}
      backHref="/admin/os/invoices"
      backLabel="Back to invoices"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {conversion ? (
            <OsLink href={`/admin/os/c/${conversion.publicCode}`}>Hub</OsLink>
          ) : null}
          {canWrite ? (
            <RowDeleteButton
              action={deleteInvoiceAndLeave}
              id={id}
              confirmMessage={`Delete invoice ${invoice.invoiceNumber}?`}
            />
          ) : null}
        </div>
      }
    >
      <p className="mb-6">
        <OsBadge tone={invoiceTone(st)}>{INVOICE_STATUS_LABELS[st]}</OsBadge>{" "}
        <span className="font-inter text-sm text-[var(--dash-muted)]">
          {formatCurrencyINR(invoice.total)} · outstanding{" "}
          {formatCurrencyINR(
            outstandingOf(invoice.total, invoice.amountPaid || 0)
          )}
        </span>
      </p>

      {canWrite ? (
        <div className="mb-10 space-y-4">
          <InvoiceEditor
            mode="edit"
            action={updateInvoice}
            submitLabel="Save invoice"
            initial={{
              id,
              invoiceNumber: invoice.invoiceNumber,
              issueDate: invoice.issueDate
                ? new Date(invoice.issueDate).toISOString().slice(0, 10)
                : "",
              dueDate: invoice.dueDate
                ? new Date(invoice.dueDate).toISOString().slice(0, 10)
                : "",
              taxRate: invoice.taxRate,
              discount: invoice.discount,
              status: invoice.status,
              documentNote: invoice.documentNote || "",
              billToName,
              billToAddress:
                invoice.billToAddress || vendor?.address || "",
              billToEmail,
              billToPhone: invoice.billToPhone || vendor?.phone || "",
              billToGst: invoice.billToGst || vendor?.gstNumber || "",
              lineItems: (invoice.lineItems || []).map(
                (item: {
                  description: string;
                  quantity: number;
                  unitPrice: number;
                }) => ({
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                })
              ),
              requireReason: true,
            }}
            extraActions={null}
          />
          <div className="max-w-xl rounded-2xl border border-[var(--dash-border)] p-4">
            <p className="mb-3 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)]">
              Share with client
            </p>
            <ShareInvoiceForm invoiceId={id} defaultEmail={billToEmail} />
          </div>
        </div>
      ) : null}

      {canPay && invoice.status !== "draft" && invoice.status !== "cancelled" ? (
        <section className="mb-8 max-w-md">
          <h2 className="mb-3 font-archivo text-sm uppercase">Record payment</h2>
          <OsActionForm action={recordPayment} submitLabel="Record payment">
            <input type="hidden" name="invoiceId" value={id} />
            <Field label="Amount">
              <input
                name="amount"
                type="number"
                required
                className={osInputClass()}
              />
            </Field>
            <Field label="Date">
              <OsDateInput name="paidAt" />
            </Field>
            <Field label="Method">
              <input
                name="method"
                defaultValue="bank"
                className={osInputClass()}
              />
            </Field>
            <Field label="Reference">
              <input name="reference" className={osInputClass()} />
            </Field>
          </OsActionForm>
        </section>
      ) : null}

      <h2 className="mb-2 font-archivo text-sm uppercase">Payments</h2>
      <ul className="mb-8 space-y-2 font-inter text-sm">
        {payments.map((p) => (
          <li
            key={String(p._id)}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--dash-border)] px-3 py-2"
          >
            <span>
              {formatCurrencyINR(p.amount)} · {p.method} · {formatDate(p.paidAt)}{" "}
              · {p.reference || "—"}
            </span>
            {canPay ? (
              <RowDeleteButton
                action={archivePayment}
                id={String(p._id)}
                confirmMessage="Delete this payment? Invoice paid amount will be adjusted."
              />
            ) : null}
          </li>
        ))}
        {payments.length === 0 ? (
          <li className="text-[var(--dash-muted)]">No payments yet.</li>
        ) : null}
      </ul>
      <h2 className="mb-2 font-archivo text-sm uppercase">Audit</h2>
      <ul className="font-inter text-xs text-[var(--dash-muted)]">
        {audits.map((a) => (
          <li key={String(a._id)}>
            {a.createdBy} changed {a.field} {a.oldValue} → {a.newValue} (
            {a.reason})
          </li>
        ))}
      </ul>
    </OsPage>
  );
}
