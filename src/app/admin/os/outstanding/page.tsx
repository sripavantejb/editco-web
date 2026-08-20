export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { Invoice } from "@/models/os/Invoice";
import { displayInvoiceStatus, outstandingOf } from "@/lib/os/money";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { OsPage, OsTable, Td, Th } from "@/components/os/ui";

export default async function OutstandingPage() {
  await requireOsPage("finance:read");
  const invoices = await Invoice.find({
    recordStatus: "active",
    status: { $nin: ["draft", "cancelled"] },
  }).lean();
  const open = invoices
    .map((i) => ({
      ...i,
      display: displayInvoiceStatus({
        status: i.status,
        dueDate: i.dueDate,
        amountPaid: i.amountPaid || 0,
        total: i.total || 0,
      }),
      due: outstandingOf(i.total || 0, i.amountPaid || 0),
    }))
    .filter((i) => i.due > 0);

  return (
    <OsPage title="Outstanding" subtitle="Issued invoices still owed, including overdue."
      backHref="/admin/os"
      backLabel="Back to dashboard">
      <OsTable>
      <thead>
      <tr>
      <Th>Invoice</Th>
      <Th>Due date</Th>
      <Th>Outstanding</Th>
      <Th>Status</Th>
      </tr>
      </thead>
      <tbody>
          {open.map((i) => (
            <tr key={String(i._id)}>
      <Td>
      <Link href={`/admin/os/invoices/${i._id}`}>{i.invoiceNumber}</Link>
      </Td>
      <Td>{i.dueDate ? formatDate(i.dueDate) : "—"}</Td>
      <Td>{formatCurrencyINR(i.due)}</Td>
      <Td>{i.display}</Td>
      </tr>
          ))}
        </tbody>
      </OsTable>
      </OsPage>
  );
}
