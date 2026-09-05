export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesQuotation } from "@/models/sales/SalesQuotation";
import { SalesProposal } from "@/models/sales/SalesProposal";
import { OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { formatDate } from "@/lib/utils";

export default async function SalesCustomerDocumentsPage() {
  const staff = await requireSalesPage("customers.documents");
  const [quotations, proposals] = await Promise.all([
    SalesQuotation.find({ ownerEmployeeId: staff.employeeId }).sort({ createdAt: -1 }).limit(30).lean(),
    SalesProposal.find({ ownerEmployeeId: staff.employeeId }).sort({ createdAt: -1 }).limit(30).lean(),
  ]);

  return (
    <OsPage title="Customer Documents" subtitle="Every quotation and proposal you've sent to a customer, in one place." backHref="/sales/employee/customers" backLabel="Back to customers">
      <section className="mb-8">
        <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Quotations</h2>
        <OsTable>
          <thead>
            <tr><Th>Number</Th><Th>Customer</Th><Th>Status</Th><Th>Created</Th></tr>
          </thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={String(q._id)}>
                <Td>{q.quotationNumber}</Td>
                <Td>{q.customerName}</Td>
                <Td className="capitalize">{q.status.replace("_", " ")}</Td>
                <Td>{formatDate(q.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </OsTable>
        {quotations.length === 0 ? <p className="mt-2 font-inter text-xs text-[var(--dash-muted)]">No quotations yet.</p> : null}
      </section>

      <section>
        <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Proposals</h2>
        <OsTable>
          <thead>
            <tr><Th>Title</Th><Th>Status</Th><Th>Created</Th></tr>
          </thead>
          <tbody>
            {proposals.map((p) => (
              <tr key={String(p._id)}>
                <Td>{p.title}</Td>
                <Td className="capitalize">{p.status}</Td>
                <Td>{formatDate(p.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </OsTable>
        {proposals.length === 0 ? <p className="mt-2 font-inter text-xs text-[var(--dash-muted)]">No proposals yet.</p> : null}
      </section>
    </OsPage>
  );
}
