export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireSalesAdminPage } from "@/lib/sales/page";
import { getEGAApplication } from "@/actions/ega";
import { EGAAdminDetail } from "@/app/admin/ega/[id]/EGAAdminDetail";

export default async function SalesAdminEGADetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSalesAdminPage();

  const { id } = await params;
  const app = await getEGAApplication(id);
  if (!app) notFound();

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-10">
      <EGAAdminDetail app={app} basePath="/sales/admin/ega" />
    </main>
  );
}
