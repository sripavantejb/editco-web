export const dynamic = "force-dynamic";

import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesShell } from "@/components/sales/SalesShell";
import { SalesAdminSidebar } from "@/components/sales/SalesAdminSidebar";

export default async function SalesAdminLayout({ children }: { children: React.ReactNode }) {
  const employee = await requireSalesAdminPage();
  return (
    <SalesShell sidebar={<SalesAdminSidebar name={employee.name} email={employee.email} />}>
      {children}
    </SalesShell>
  );
}
