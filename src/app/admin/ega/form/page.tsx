export const dynamic = "force-dynamic";

import { requireLegacyPage } from "@/lib/os/page";
import { getEGAFormConfig } from "@/actions/ega-form";
import { EGAFormEditor } from "./EGAFormEditor";

export default async function AdminEGAFormPage() {
  await requireLegacyPage();

  const config = await getEGAFormConfig();

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-10">
      <EGAFormEditor initial={config} />
    </main>
  );
}
