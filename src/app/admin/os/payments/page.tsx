export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { Payment } from "@/models/os/Payment";
import { Invoice } from "@/models/os/Invoice";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import { archivePayment } from "@/actions/os/payments";
import { hasPermission } from "@/lib/os/permissions";
import Link from "next/link";

export default async function PaymentsPage() {
  const staff = await requireOsPage("payments:read");
  const canWrite = hasPermission(staff.permissions, "payments:write");
  const payments = await Payment.find({ recordStatus: "active" }).sort({ paidAt: -1 }).lean();
  const invoices = await Invoice.find({
    _id: { $in: payments.map((p) => p.invoiceId) },
  }).lean();
  const numBy = Object.fromEntries(invoices.map((i) => [String(i._id), i.invoiceNumber]));

  return (
    <OsPage
      title="Payments"
      backHref="/admin/os"
      backLabel="Back to dashboard"
    >
      <OsTable>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Invoice</Th>
            <Th>Amount</Th>
            <Th>Reference</Th>
            <Th>Delete</Th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={String(p._id)}>
              <Td>{formatDate(p.paidAt)}</Td>
              <Td>
                <Link href={`/admin/os/invoices/${p.invoiceId}`}>
                  {numBy[String(p.invoiceId)]}
                </Link>
              </Td>
              <Td>{formatCurrencyINR(p.amount)}</Td>
              <Td>{p.reference || p.method}</Td>
              <Td>
                {canWrite ? (
                  <RowDeleteButton
                    action={archivePayment}
                    id={String(p._id)}
                    confirmMessage="Delete this payment? Invoice paid amount will be adjusted."
                  />
                ) : null}
              </Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
    </OsPage>
  );
}
