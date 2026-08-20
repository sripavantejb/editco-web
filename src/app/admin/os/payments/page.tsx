export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { Payment } from "@/models/os/Payment";
import { Invoice } from "@/models/os/Invoice";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { OsPage, OsTable, Td, Th } from "@/components/os/ui";
import Link from "next/link";

export default async function PaymentsPage() {
  await requireOsPage("payments:read");
  const payments = await Payment.find({ recordStatus: "active" }).sort({ paidAt: -1 }).lean();
  const invoices = await Invoice.find({
    _id: { $in: payments.map((p) => p.invoiceId) },
  }).lean();
  const numBy = Object.fromEntries(invoices.map((i) => [String(i._id), i.invoiceNumber]));

  return (
    <OsPage title="Payments"
      backHref="/admin/os"
      backLabel="Back to dashboard">
      <OsTable>
      <thead>
      <tr>
      <Th>Date</Th>
      <Th>Invoice</Th>
      <Th>Amount</Th>
      <Th>Reference</Th>
      </tr>
      </thead>
      <tbody>
          {payments.map((p) => (
            <tr key={String(p._id)}>
      <Td>{formatDate(p.paidAt)}</Td>
      <Td>
      <Link href={`/admin/os/invoices/${p.invoiceId}`}>{numBy[String(p.invoiceId)]}</Link>
      </Td>
      <Td>{formatCurrencyINR(p.amount)}</Td>
      <Td>{p.reference || p.method}</Td>
      </tr>
          ))}
        </tbody>
      </OsTable>
      </OsPage>
  );
}
