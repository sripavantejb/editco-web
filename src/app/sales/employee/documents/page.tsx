export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesQuotation } from "@/models/sales/SalesQuotation";
import { SalesProposal } from "@/models/sales/SalesProposal";
import { OsBadge, OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { formatDate } from "@/lib/utils";

export default async function SalesDocumentsPage() {
  const staff = await requireSalesPage("docs.sales_documents");
  const [quotations, proposals] = await Promise.all([
    SalesQuotation.find({ ownerEmployeeId: staff.employeeId }).select("quotationNumber customerName status createdAt").lean(),
    SalesProposal.find({ ownerEmployeeId: staff.employeeId }).select("title status createdAt").lean(),
  ]);

  const docs = [
    ...quotations.map((q) => ({ id: String(q._id), type: "Quotation", label: `${q.quotationNumber} — ${q.customerName}`, status: q.status, createdAt: q.createdAt })),
    ...proposals.map((p) => ({ id: String(p._id), type: "Proposal", label: p.title, status: p.status, createdAt: p.createdAt })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <OsPage title="Sales Documents" subtitle="Central library of everything generated for your deals and customers.">
      <OsTable>
        <thead>
          <tr><Th>Type</Th><Th>Document</Th><Th>Status</Th><Th>Created</Th></tr>
        </thead>
        <tbody>
          {docs.map((d) => (
            <tr key={`${d.type}-${d.id}`}>
              <Td><OsBadge tone="neutral">{d.type}</OsBadge></Td>
              <Td>{d.label}</Td>
              <Td className="capitalize">{d.status.replace("_", " ")}</Td>
              <Td>{formatDate(d.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {docs.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No documents yet.</p> : null}
    </OsPage>
  );
}
