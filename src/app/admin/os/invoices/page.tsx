export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { Invoice } from "@/models/os/Invoice";
import { displayInvoiceStatus } from "@/lib/os/money";
import { INVOICE_STATUS_LABELS } from "@/lib/os/constants";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { OsBadge, OsLink, OsPage, OsTable, Td, Th, invoiceTone } from "@/components/os/ui";

export default async function InvoicesPage() {
  await requireOsPage("invoices:read");
  const invoices = await Invoice.find({ recordStatus: "active" }).sort({ createdAt: -1 }).lean();
  return (
    <OsPage
      title="Invoices"
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={<OsLink href="/admin/os/invoices/new">Create invoice</OsLink>}
    >
      <OsTable>
      <thead>
      <tr>
      <Th>Number</Th>
      <Th>Total</Th>
      <Th>Paid</Th>
      <Th>Due</Th>
      <Th>Status</Th>
      </tr>
      </thead>
      <tbody>
          {invoices.map((i) => {
            const st = displayInvoiceStatus({
              status: i.status,
              dueDate: i.dueDate,
              amountPaid: i.amountPaid || 0,
              total: i.total || 0,
            });
            return (
              <tr key={String(i._id)}>
      <Td>
      <Link href={`/admin/os/invoices/${i._id}`} className="text-[var(--dash-accent)]">
                    {i.invoiceNumber}
                  </Link>
      </Td>
      <Td>{formatCurrencyINR(i.total)}</Td>
      <Td>{formatCurrencyINR(i.amountPaid || 0)}</Td>
      <Td>{i.dueDate ? formatDate(i.dueDate) : "—"}</Td>
      <Td>
      <OsBadge tone={invoiceTone(st)}>{INVOICE_STATUS_LABELS[st]}</OsBadge>
      </Td>
      </tr>
            );
          })}
        </tbody>
      </OsTable>
      </OsPage>
  );
}
