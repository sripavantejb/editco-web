export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireOsPage } from "@/lib/os/page";
import { Lead } from "@/models/os/Lead";
import { ServiceCatalog } from "@/models/os/ServiceCatalog";
import { ConvertWizard } from "@/components/os/OsForms";
import { OsPage } from "@/components/os/ui";

export default async function ConvertLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOsPage("conversions:write");
  const { id } = await params;
  const lead = await Lead.findById(id).lean();
  if (!lead) notFound();
  if (lead.status === "converted") notFound();
  const services = await ServiceCatalog.find({ isActive: true }).lean();

  return (
    <OsPage
      title="Convert lead"
      subtitle="Conversion is an event. A UUID is minted once and becomes the backbone for client, projects, and finance."
      backHref={`/admin/os/leads/${id}`}
      backLabel="Back to lead"
    >
      <ConvertWizard
        lead={{
          id: String(lead._id),
          name: lead.name,
          company: lead.company || "",
          email: lead.email || "",
          phone: lead.phone || "",
          industry: lead.industry || "",
          estimatedValue: lead.estimatedValue || 0,
          requirement: lead.requirement || "",
          interestedServices: lead.interestedServices || [],
        }}
        services={services.map((s) => ({ slug: s.slug, name: s.name }))}
      />
      </OsPage>
  );
}
