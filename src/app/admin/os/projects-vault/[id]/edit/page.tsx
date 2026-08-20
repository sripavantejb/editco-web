export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireOsPage } from "@/lib/os/page";
import { VaultProject } from "@/models/os/VaultProject";
import { OsPage } from "@/components/os/ui";
import { VaultProjectForm } from "@/components/os/VaultProjectForm";

export default async function EditVaultProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOsPage("vault:write");
  const { id } = await params;
  const project = await VaultProject.findById(id).lean();
  if (!project || project.recordStatus !== "active") notFound();

  return (
    <OsPage
      title={`Edit ${project.name}`}
      subtitle="Update access, insights, and status. Leave password blank to keep the current secret."
      backHref={`/admin/os/projects-vault/${id}`}
      backLabel="Back to project"
    >
      <VaultProjectForm
        mode="edit"
        initial={{
          id: String(project._id),
          name: project.name,
          localUrl: project.localUrl || "",
          productionUrl: project.productionUrl || "",
          loginEmail: project.loginEmail || "",
          description: project.description || "",
          category: project.category || "",
          status: project.status,
          internalNotes: project.internalNotes || "",
          targetIndustry: project.targetIndustry || "",
          idealCustomer: project.idealCustomer || "",
          sellingPoints: project.sellingPoints || "",
          commonObjections: project.commonObjections || "",
          bestPitchAngle: project.bestPitchAngle || "",
          pricingNotes: project.pricingNotes || "",
          competitors: project.competitors || "",
          demoNotes: project.demoNotes || "",
        }}
      />
    </OsPage>
  );
}
