export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { getEGAApplications } from "@/actions/ega";
import { EGAAdminList } from "./EGAAdminList";

export default async function AdminEGAPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const applications = await getEGAApplications();
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    selected: applications.filter((a) => a.status === "selected").length,
    lookback: applications.filter((a) => a.status === "lookback").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
      <EGAAdminList applications={applications} stats={stats} />
    </main>
  );
}
