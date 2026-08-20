export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { ensureOsCatalogs } from "@/lib/os/catalog";
import { IndustryCatalog } from "@/models/os/IndustryCatalog";
import { ServiceCatalog } from "@/models/os/ServiceCatalog";
import { VaultProject } from "@/models/os/VaultProject";
import { NewLeadForm } from "@/components/os/NewLeadForm";
import { OsPage } from "@/components/os/ui";

export default async function NewLeadPage() {
  const staff = await requireOsPage("leads:write");
  await ensureOsCatalogs();

  const [industries, services, vaultProjects] = await Promise.all([
    IndustryCatalog.find({ isActive: true }).sort({ name: 1 }).lean(),
    ServiceCatalog.find({ isActive: true }).sort({ name: 1 }).lean(),
    VaultProject.find({ recordStatus: "active", status: "active" })
      .sort({ name: 1 })
      .select({ name: 1, category: 1 })
      .lean(),
  ]);

  return (
    <OsPage title="Add lead" subtitle="Entry point for the operating system."
      backHref="/admin/os/leads"
      backLabel="Back to leads">
      <NewLeadForm
        defaultOwner={staff.name}
        industries={industries.map((i) => ({
          slug: i.slug,
          name: i.name,
          sector: i.sector || "Other",
        }))}
        services={services.map((s) => ({ slug: s.slug, name: s.name }))}
        vaultProjects={vaultProjects.map((p) => ({
          id: String(p._id),
          name: p.name,
          category: p.category || "",
        }))}
      />
      </OsPage>
  );
}
