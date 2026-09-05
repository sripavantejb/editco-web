export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesCustomer } from "@/models/sales/SalesCustomer";
import { OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

export default async function SalesCustomersPage() {
  const staff = await requireSalesPage("customers.management");
  const scopeFilter = staff.isSalesAdmin ? {} : { ownerEmployeeId: staff.employeeId };
  const customers = await SalesCustomer.find({ ...scopeFilter, recordStatus: "active" }).sort({ createdAt: -1 }).lean();

  return (
    <OsPage
      title="Customer Management"
      subtitle="Converted leads become customers here, with full history in one place."
    >
      {customers.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-[var(--dash-border)] p-10 text-center">
          <p className="font-inter text-sm text-[var(--dash-muted)]">
            No customers yet. Customers are created automatically when you win a deal —
            that flow lands in the next phase of the Sales CRM build.
          </p>
        </div>
      ) : (
        <OsTable>
          <thead>
            <tr>
              <Th>Customer</Th>
              <Th>Industry</Th>
              <Th>Customer since</Th>
              <Th>Total revenue</Th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={String(c._id)}>
                <Td>{c.name}</Td>
                <Td>{c.industry || "—"}</Td>
                <Td>{formatDate(c.customerSince)}</Td>
                <Td>{formatCurrencyINR(c.totalRevenue || 0)}</Td>
              </tr>
            ))}
          </tbody>
        </OsTable>
      )}
    </OsPage>
  );
}
