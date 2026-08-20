export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { createLeadList } from "@/actions/os/lead-lists";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, OsPage, osInputClass, osTextareaClass } from "@/components/os/ui";

export default async function NewLeadListPage() {
  await requireOsPage("leads:write");

  return (
    <OsPage
      title="Create lead list"
      subtitle="Define saved filters. Lists resolve leads dynamically from the shared Lead entity."
    
      backHref="/admin/os/leads/lists"
      backLabel="Back to lead lists">
      <OsActionForm
        action={createLeadList}
        submitLabel="Create list"
        className="grid max-w-3xl gap-4 sm:grid-cols-2"
      >
      <Field label="Name">
      <input name="name" className={osInputClass()} required />
      </Field>
      <Field label="Description (optional)" >
      <input name="description" className={osInputClass()} placeholder="e.g. Hospitals in healthcare" />
      </Field>
      <div className="sm:col-span-2">
      <p className="font-inter text-xs text-[var(--dash-muted)]">
            Comma-separated values. Example: <code>new,qualified</code>
      </p>
      </div>
      <Field label="Statuses (include)">
      <input
            name="statuses"
            className={osInputClass()}
            placeholder="new,qualified,proposal"
          />
      </Field>
      <Field label="Exclude statuses (optional)">
      <input
            name="excludeStatuses"
            className={osInputClass()}
            placeholder="lost"
          />
      </Field>
      <Field label="Sources (optional)">
      <input
            name="sources"
            className={osInputClass()}
            placeholder="referral,website"
          />
      </Field>
      <Field label="Priorities (optional)">
      <input
            name="priorities"
            className={osInputClass()}
            placeholder="high,urgent"
          />
      </Field>
      <Field label="Industry (optional)">
      <input
            name="industry"
            className={osInputClass()}
            placeholder="healthcare"
          />
      </Field>
      <Field label="Assigned owner (optional)">
      <input
            name="assignedOwner"
            className={osInputClass()}
            placeholder="Deepika"
          />
      </Field>
      <div className="sm:col-span-2">
      <Field label="Notes (optional)">
      <textarea name="notes" className={osTextareaClass()} placeholder="Any operational notes for your team." />
      </Field>
      </div>
      </OsActionForm>
      </OsPage>
  );
}

