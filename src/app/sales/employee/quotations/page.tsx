export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesPage } from "@/lib/sales/page";
import { SalesQuotation } from "@/models/sales/SalesQuotation";
import { OsBadge, OsLink, OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { formatDate } from "@/lib/utils";

export default async function SalesQuotationsPage() {
  const staff = await requireSalesPage("docs.quotations");
  const quotations = await SalesQuotation.find({ ownerEmployeeId: staff.employeeId }).sort({ createdAt: -1 }).lean();

  return (
    <OsPage title="Quotation Management" subtitle="Create, track, and revise quotations." actions={<OsLink href="/sales/employee/quotations/new">New quotation</OsLink>}>
      <OsTable>
        <thead>
          <tr><Th>Number</Th><Th>Customer</Th><Th>Status</Th><Th>Valid until</Th><Th>Open</Th></tr>
        </thead>
        <tbody>
          {quotations.map((q) => (
            <tr key={String(q._id)}>
              <Td>{q.quotationNumber}</Td>
              <Td>{q.customerName}</Td>
              <Td>
                <OsBadge tone={q.status === "accepted" ? "ok" : q.status === "rejected" || q.status === "expired" ? "bad" : "accent"}>
                  {q.status.replace("_", " ")}
                </OsBadge>
              </Td>
              <Td>{q.validUntil ? formatDate(q.validUntil) : "—"}</Td>
              <Td>
                <Link href={`/sales/employee/quotations/${q._id}`} className="text-[var(--dash-accent)] hover:underline">
                  Open
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {quotations.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No quotations yet.</p> : null}
    </OsPage>
  );
}
