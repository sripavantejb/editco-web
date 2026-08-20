export const dynamic = "force-dynamic";

import { requireLegacyPage } from "@/lib/os/page";
import { JobEditor } from "@/components/careers/admin/JobEditor";

export default async function AdminNewJobPage() {
  await requireLegacyPage();

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
      <JobEditor />
    </main>
  );
}
