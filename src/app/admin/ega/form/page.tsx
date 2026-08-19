export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { getEGAFormConfig } from "@/actions/ega-form";
import { EGAFormEditor } from "./EGAFormEditor";

export default async function AdminEGAFormPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const config = await getEGAFormConfig();

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-10">
      <EGAFormEditor initial={config} />
    </main>
  );
}
