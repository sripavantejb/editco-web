export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireLegacyPage } from "@/lib/os/page";
import { getEGAApplication } from "@/actions/ega";
import { EGAAdminDetail } from "./EGAAdminDetail";

export default async function AdminEGADetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireLegacyPage();

  const { id } = await params;
  const app = await getEGAApplication(id);
  if (!app) notFound();

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-10">
      <EGAAdminDetail app={app} />
    </main>
  );
}
