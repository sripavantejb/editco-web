export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { OsPage } from "@/components/os/ui";
import { VaultProjectForm } from "@/components/os/VaultProjectForm";

export default async function NewVaultProjectPage() {
  await requireOsPage("vault:write");
  return (
    <OsPage
      title="Add vault project"
      subtitle="Store access, sales messaging, and pitch intelligence for a product."
      backHref="/admin/os/projects-vault"
      backLabel="Back to vault"
    >
      <VaultProjectForm mode="create" />
    </OsPage>
  );
}
