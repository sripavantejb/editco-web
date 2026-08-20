export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { ServiceCatalog } from "@/models/os/ServiceCatalog";
import { createService } from "@/actions/os/staff";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, OsPage, osInputClass } from "@/components/os/ui";

export default async function ServicesSettingsPage() {
  await requireOsPage("*");
  const services = await ServiceCatalog.find({}).sort({ name: 1 }).lean();
  return (
    <OsPage title="Services"
      backHref="/admin/os"
      backLabel="Back to dashboard">
      <OsActionForm action={createService} submitLabel="Add service" className="mb-8 grid max-w-md gap-3">
      <Field label="Name"><input name="name" required className={osInputClass()} /></Field>
      <Field label="Slug"><input name="slug" placeholder="ai_agent" className={osInputClass()} /></Field>
      </OsActionForm>
      <ul className="font-inter text-sm">
        {services.map((s) => (
          <li key={String(s._id)}>
            {s.name} <span className="text-[var(--dash-faint)]">({s.slug})</span>
      </li>
        ))}
      </ul>
      </OsPage>
  );
}
