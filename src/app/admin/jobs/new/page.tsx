export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { JobEditor } from "@/components/careers/admin/JobEditor";

export default async function AdminNewJobPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
      <JobEditor />
    </main>
  );
}
