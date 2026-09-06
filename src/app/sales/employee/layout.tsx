export const dynamic = "force-dynamic";

import { requireSalesEmployeeSession } from "@/lib/sales/page";
import { SalesShell } from "@/components/sales/SalesShell";
import { SalesEmployeeSidebar } from "@/components/sales/SalesEmployeeSidebar";
import "@/models/sales/register";

export default async function SalesEmployeeLayout({ children }: { children: React.ReactNode }) {
  // Shared with page guards via React.cache + short TTL — one auth path per nav.
  const employee = await requireSalesEmployeeSession();

  return (
    <SalesShell
      sidebar={
        <SalesEmployeeSidebar
          name={employee.name}
          email={employee.email}
          effective={employee.effective}
        />
      }
    >
      {children}
    </SalesShell>
  );
}
