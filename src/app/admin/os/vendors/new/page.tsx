export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { ServiceCatalog } from "@/models/os/ServiceCatalog";
import { VENDOR_ACTIVE_STATUSES, VENDOR_ACTIVE_STATUS_LABELS } from "@/models/os/Vendor";
import { createClient } from "@/actions/os/vendors";
import { OsActionForm } from "@/components/os/OsActionForm";
import {
  Field,
  OsPage,
  osInputClass,
  osTextareaClass,
} from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import { OsDateInput } from "@/components/os/OsDateInput";
import { hasPermission } from "@/lib/os/permissions";
import { redirect } from "next/navigation";

export default async function NewClientPage() {
  const staff = await requireOsPage("vendors:write");
  if (!hasPermission(staff.permissions, "vendors:write")) {
    redirect("/admin/os/vendors");
  }

  const services = await ServiceCatalog.find({ isActive: true }).lean();

  return (
    <OsPage
      title="Add client"
      subtitle="Onboard an existing / already-won client without going through the sales pipeline. A conversion hub is still created."
      backHref="/admin/os/vendors"
      backLabel="Back to clients"
    >
      <OsActionForm
        action={createClient}
        submitLabel="Create client & conversion hub"
        className="grid max-w-3xl gap-4 sm:grid-cols-2"
      >
      <Field label="Company name">
      <input name="companyName" required className={osInputClass()} />
      </Field>
      <Field label="Contact person">
      <input name="contactPerson" className={osInputClass()} />
      </Field>
      <Field label="Email">
      <input name="email" type="email" className={osInputClass()} />
      </Field>
      <Field label="Phone">
      <input name="phone" className={osInputClass()} />
      </Field>
      <Field label="Location">
      <input name="location" className={osInputClass()} />
      </Field>
      <Field label="Active status">
      <OsSelect
        name="activeStatus"
        defaultValue="active"
        options={VENDOR_ACTIVE_STATUSES.map((s) => ({ value: s, label: VENDOR_ACTIVE_STATUS_LABELS[s] }))}
      />
      </Field>
      <Field label="Industry">
      <input name="industry" className={osInputClass()} />
      </Field>
      <Field label="Account owner">
      <input
            name="accountOwner"
            defaultValue={staff.name}
            className={osInputClass()}
          />
      </Field>
      <Field label="Contract / value (₹)">
      <input name="conversionValue" type="number" className={osInputClass()} />
      </Field>
      <Field label="Expected start">
        <OsDateInput name="expectedStart" />
      </Field>
      <Field label="GST / tax">
      <input name="gstNumber" className={osInputClass()} />
      </Field>
      <Field label="Website">
      <input name="website" className={osInputClass()} />
      </Field>
      <div className="sm:col-span-2">
      <p className="mb-2 font-inter text-xs text-[var(--dash-muted)]">Services</p>
      <div className="flex flex-wrap gap-3">
            {services.map((s) => (
              <label
                key={s.slug}
                className="flex items-center gap-2 font-inter text-sm text-[var(--dash-text)]"
              >
      <input type="checkbox" name="services" value={s.slug} />
                {s.name}
              </label>
            ))}
          </div>
      </div>
      <div className="sm:col-span-2">
      <Field label="Address">
      <textarea name="address" className={osTextareaClass()} />
      </Field>
      </div>
      <div className="sm:col-span-2">
      <Field label="Notes">
      <textarea name="notes" className={osTextareaClass()} />
      </Field>
      </div>
      <label className="flex items-center gap-2 font-inter text-sm sm:col-span-2">
      <input type="checkbox" name="createProject" defaultChecked />
          Create first project
        </label>
      <Field label="First project name">
      <input
            name="projectName"
            defaultValue="New project"
            className={osInputClass()}
          />
      </Field>
      <label className="flex items-center gap-2 font-inter text-sm sm:col-span-2">
      <input type="checkbox" name="forceNew" />
          Force new client even if company/email/phone already matches an existing client
        </label>
      </OsActionForm>
      </OsPage>
  );
}
