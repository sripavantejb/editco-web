export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { createSalesLead } from "@/actions/sales/leads";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsSelect } from "@/components/os/OsSelect";
import { Field, OsPage, osInputClass, osTextareaClass } from "@/components/os/ui";
import {
  SALES_LEAD_PRIORITIES,
  SALES_LEAD_SOURCE_LABELS,
  SALES_LEAD_TEMPERATURES,
} from "@/lib/sales/constants";

const SOURCE_OPTIONS = Object.entries(SALES_LEAD_SOURCE_LABELS).map(([value, label]) => ({ value, label }));
const PRIORITY_OPTIONS = SALES_LEAD_PRIORITIES.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }));
const TEMPERATURE_OPTIONS = SALES_LEAD_TEMPERATURES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }));

export default async function NewSalesLeadPage() {
  await requireSalesPage("leads.management");

  return (
    <OsPage title="Add lead" subtitle="Capture a new opportunity." backHref="/sales/employee/leads" backLabel="Back to leads">
      <OsActionForm action={createSalesLead} submitLabel="Create lead" className="grid max-w-2xl gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact person">
            <input name="contactPerson" required className={osInputClass()} />
          </Field>
          <Field label="Company">
            <input name="company" className={osInputClass()} />
          </Field>
          <Field label="Phone">
            <input name="phone" className={osInputClass()} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" className={osInputClass()} />
          </Field>
          <Field label="Website">
            <input name="website" className={osInputClass()} />
          </Field>
          <Field label="Industry">
            <input name="industry" className={osInputClass()} />
          </Field>
          <Field label="City">
            <input name="city" className={osInputClass()} />
          </Field>
          <Field label="State">
            <input name="state" className={osInputClass()} />
          </Field>
          <Field label="Country">
            <input name="country" className={osInputClass()} />
          </Field>
          <Field label="Source">
            <OsSelect name="source" options={SOURCE_OPTIONS} defaultValue="website" />
          </Field>
          <Field label="Priority">
            <OsSelect name="priority" options={PRIORITY_OPTIONS} defaultValue="medium" />
          </Field>
          <Field label="Temperature">
            <OsSelect name="temperature" options={TEMPERATURE_OPTIONS} defaultValue="warm" />
          </Field>
        </div>
        <Field label="Requirement">
          <textarea name="requirement" className={osTextareaClass()} />
        </Field>
        <Field label="Notes">
          <textarea name="notes" className={osTextareaClass()} />
        </Field>
      </OsActionForm>
    </OsPage>
  );
}
