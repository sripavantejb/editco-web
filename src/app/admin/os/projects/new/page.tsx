export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { Conversion } from "@/models/os/Conversion";
import { ServiceCatalog } from "@/models/os/ServiceCatalog";
import { StaffUser } from "@/models/os/StaffUser";
import { createProject } from "@/actions/os/projects";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, OsPage, osInputClass, osSelectClass, osTextareaClass } from "@/components/os/ui";
import { OsDateInput } from "@/components/os/OsDateInput";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/lib/os/constants";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ conversion?: string }>;
}) {
  await requireOsPage("projects:write");
  const { conversion: prefill } = await searchParams;
  const conversions = await Conversion.find({ recordStatus: "active" }).lean();
  const services = await ServiceCatalog.find({ isActive: true }).lean();
  const staffUsers = await StaffUser.find({ isActive: true }).sort({ name: 1 }).lean();

  return (
    <OsPage title="Add project" subtitle="One conversion can have many projects."
      backHref="/admin/os/projects"
      backLabel="Back to projects">
      <OsActionForm action={createProject} submitLabel="Create project" className="grid max-w-2xl gap-4">
      <Field label="Conversion">
      <select name="conversionUuid" defaultValue={prefill} required className={osSelectClass()}>
      <option value="">Select</option>
            {conversions.map((c) => (
              <option key={c.conversionUuid} value={c.conversionUuid}>
                {c.publicCode}
              </option>
            ))}
          </select>
      </Field>
      <Field label="Name">
      <input name="name" required className={osInputClass()} />
      </Field>
      <Field label="Service">
      <select name="service" className={osSelectClass()}>
      <option value="">—</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
      </Field>
      <Field label="Status">
      <select name="status" defaultValue="planned" className={osSelectClass()}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>
            ))}
          </select>
      </Field>
      <Field label="Primary POC">
      <select name="primaryPocUserId" className={osSelectClass()}>
            <option value="">Select POC</option>
            {staffUsers.map((u) => (
              <option key={String(u._id)} value={String(u._id)}>
                {u.name || u.email}
              </option>
            ))}
          </select>
      </Field>
      <Field label="Start date"><OsDateInput name="startDate" /></Field>
      <Field label="Expected delivery"><OsDateInput name="expectedDelivery" /></Field>
      <Field label="Budget (₹)"><input type="number" name="budget" className={osInputClass()} /></Field>
      <label className="flex items-center gap-2 font-inter text-sm">
      <input type="checkbox" name="seedMilestones" defaultChecked />
          Seed default milestones (Discovery → Launch)
        </label>
      <Field label="Description"><textarea name="description" className={osTextareaClass()} /></Field>
      </OsActionForm>
      </OsPage>
  );
}
