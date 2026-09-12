export const dynamic = "force-dynamic";

import { requireSalesAdminPage } from "@/lib/sales/page";
import { getEGAFormConfig } from "@/actions/ega-form";
import { EGAFormEditor } from "@/app/admin/ega/form/EGAFormEditor";

export default async function SalesAdminEGAFormPage() {
  await requireSalesAdminPage();

  const config = await getEGAFormConfig();

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-10">
      <EGAFormEditor initial={config} basePath="/sales/admin/ega" />
    </main>
  );
}
