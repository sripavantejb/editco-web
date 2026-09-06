"use client";

import { createProductCredential } from "@/actions/os/credentials";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsSlideOver } from "@/components/os/OsSlideOver";
import { Field, osInputClass, osTextareaClass } from "@/components/os/ui";

export function AddCredentialDrawer() {
  return (
    <OsSlideOver
      triggerLabel="Add credential"
      title="Add credential"
      subtitle="Secure product login — password is encrypted."
      wide
    >
      <OsActionForm
        action={createProductCredential}
        submitLabel="Save credential"
        className="grid gap-3"
      >
        <Field label="Product name">
          <input
            name="productName"
            required
            placeholder="e.g. CrewCo · Editco site · MongoDB"
            className={osInputClass()}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Category">
            <input
              name="category"
              placeholder="Hosting, SaaS, Domain…"
              className={osInputClass()}
            />
          </Field>
          <Field label="URL">
            <input name="url" placeholder="https://…" className={osInputClass()} />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Username / email">
            <input name="username" className={osInputClass()} />
          </Field>
          <Field label="Password">
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              className={osInputClass()}
            />
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            name="notes"
            rows={2}
            placeholder="Recovery email, 2FA, owner…"
            className={osTextareaClass()}
          />
        </Field>
      </OsActionForm>
    </OsSlideOver>
  );
}
