export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { Project } from "@/models/os/Project";
import { Conversion } from "@/models/os/Conversion";
import { Vendor } from "@/models/os/Vendor";
import { createInvoice } from "@/actions/os/invoices";
import { InvoiceEditor } from "@/components/os/InvoiceEditor";
import { OsPage } from "@/components/os/ui";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  await requireOsPage("invoices:write");
  const { projectId } = await searchParams;
  const projects = await Project.find({ recordStatus: "active" }).lean();
  const conversions = await Conversion.find({
    conversionUuid: { $in: projects.map((p) => p.conversionUuid) },
  }).lean();
  const vendors = await Vendor.find({
    conversionUuid: { $in: projects.map((p) => p.conversionUuid) },
  }).lean();
  const codeBy = Object.fromEntries(
    conversions.map((c) => [c.conversionUuid, c.publicCode])
  );
  const vendorBy = Object.fromEntries(
    vendors.map((v) => [v.conversionUuid, v])
  );

  const editorProjects = projects.map((p) => {
    const vendor = vendorBy[p.conversionUuid];
    return {
      id: String(p._id),
      name: p.name,
      code: codeBy[p.conversionUuid] || p.conversionUuid.slice(0, 8),
      billTo: {
        name: vendor?.companyName || "",
        address: vendor?.address || "",
        email: vendor?.email || "",
        phone: vendor?.phone || "",
        gst: vendor?.gstNumber || "",
      },
    };
  });

  return (
    <OsPage
      title="Create invoice"
      subtitle="Invoices belong to a project, not a lead. Preview updates as you type."
      backHref="/admin/os/invoices"
      backLabel="Back to invoices"
    >
      <InvoiceEditor
        mode="create"
        action={createInvoice}
        projects={editorProjects}
        initial={{ projectId }}
        submitLabel="Create invoice"
      />
    </OsPage>
  );
}
