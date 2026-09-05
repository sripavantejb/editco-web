export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { Conversion } from "@/models/os/Conversion";
import { ServiceCatalog } from "@/models/os/ServiceCatalog";
import { StaffUser } from "@/models/os/StaffUser";
import { createProject } from "@/actions/os/projects";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, OsPage, osInputClass, osTextareaClass } from "@/components/os/ui";
import { OsDateInput } from "@/components/os/OsDateInput";
import { OsSelect } from "@/components/os/OsSelect";
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
      <OsSelect
        name="conversionUuid"
        defaultValue={prefill || ""}
        required
        placeholder="Select"
        options={conversions.map((c) => ({ value: c.conversionUuid, label: c.publicCode }))}
      />
      </Field>
      <Field label="Name">
      <input name="name" required className={osInputClass()} />
      </Field>
      <Field label="Service">
      <OsSelect
        name="service"
        defaultValue=""
        placeholder="—"
        options={services.map((s) => ({ value: s.slug, label: s.name }))}
      />
      </Field>
      <Field label="Status">
      <OsSelect
        name="status"
        defaultValue="planned"
        options={PROJECT_STATUSES.map((s) => ({ value: s, label: PROJECT_STATUS_LABELS[s] }))}
      />
      </Field>
      <Field label="Primary POC">
      <OsSelect
        name="primaryPocUserId"
        defaultValue=""
        placeholder="Select POC"
        options={staffUsers.map((u) => ({ value: String(u._id), label: u.name || u.email }))}
      />
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
