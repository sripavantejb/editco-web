"use client";

import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, osInputClass, osTextareaClass } from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import {
  createVaultProject,
  updateVaultProject,
} from "@/actions/os/vault-projects";
import { VAULT_PROJECT_STATUSES, VAULT_PROJECT_STATUS_LABELS } from "@/lib/os/constants";

export type VaultProjectFormValues = {
  id?: string;
  name?: string;
  localUrl?: string;
  productionUrl?: string;
  loginEmail?: string;
  description?: string;
  category?: string;
  status?: string;
  whatsappCold?: string;
  emailSubject?: string;
  emailBody?: string;
  followUp?: string;
  linkedin?: string;
  generalPitch?: string;
  internalNotes?: string;
  targetIndustry?: string;
  idealCustomer?: string;
  sellingPoints?: string;
  commonObjections?: string;
  bestPitchAngle?: string;
  pricingNotes?: string;
  competitors?: string;
  demoNotes?: string;
};

export function VaultProjectForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: VaultProjectFormValues;
}) {
  const action = mode === "create" ? createVaultProject : updateVaultProject;

  return (
    <OsActionForm
      action={action}
      submitLabel={mode === "create" ? "Add project" : "Save project"}
      className="grid max-w-3xl gap-4 sm:grid-cols-2"
    >
      {mode === "edit" && initial?.id ? (
        <input type="hidden" name="id" value={initial.id} />
      ) : null}

      <Field label="Project name *">
        <input
          name="name"
          required
          defaultValue={initial?.name || ""}
          className={osInputClass()}
        />
      </Field>
      <Field label="Category">
        <input
          name="category"
          defaultValue={initial?.category || ""}
          className={osInputClass()}
          placeholder="e.g. Healthcare"
        />
      </Field>
      <Field label="Local URL">
        <input
          name="localUrl"
          type="url"
          defaultValue={initial?.localUrl || ""}
          className={osInputClass()}
          placeholder="http://localhost:3000"
        />
      </Field>
      <Field label="Production URL *">
        <input
          name="productionUrl"
          type="url"
          required
          defaultValue={initial?.productionUrl || ""}
          className={osInputClass()}
          placeholder="https://example.com"
        />
      </Field>
      <Field label="Login email">
        <input
          name="loginEmail"
          type="email"
          defaultValue={initial?.loginEmail || ""}
          className={osInputClass()}
        />
      </Field>
      <Field
        label={
          mode === "edit"
            ? "Password / secret (leave blank to keep)"
            : "Password / secret"
        }
      >
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          className={osInputClass()}
        />
      </Field>
      {mode === "edit" ? (
        <label className="flex items-center gap-2 sm:col-span-2 font-inter text-sm text-[var(--dash-muted)]">
          <input type="checkbox" name="clearPassword" value="true" />
          Clear stored password
        </label>
      ) : null}
      <Field label="Status">
        <OsSelect
          name="status"
          defaultValue={initial?.status || "active"}
          options={VAULT_PROJECT_STATUSES.map((s) => ({
            value: s,
            label: VAULT_PROJECT_STATUS_LABELS[s],
          }))}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Description">
          <textarea
            name="description"
            defaultValue={initial?.description || ""}
            className={osTextareaClass()}
            rows={3}
          />
        </Field>
      </div>

      {mode === "create" ? (
        <>
          <div className="sm:col-span-2 mt-2">
            <p className="font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)]">
              Sales messages (optional)
            </p>
          </div>
          <div className="sm:col-span-2">
            <Field label="WhatsApp cold message">
              <textarea
                name="whatsappCold"
                defaultValue={initial?.whatsappCold || ""}
                className={osTextareaClass()}
                rows={3}
                placeholder="Hi {{name}}, …"
              />
            </Field>
          </div>
          <Field label="Email subject">
            <input
              name="emailSubject"
              defaultValue={initial?.emailSubject || ""}
              className={osInputClass()}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Email body">
              <textarea
                name="emailBody"
                defaultValue={initial?.emailBody || ""}
                className={osTextareaClass()}
                rows={3}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Follow-up message">
              <textarea
                name="followUp"
                defaultValue={initial?.followUp || ""}
                className={osTextareaClass()}
                rows={2}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="LinkedIn message">
              <textarea
                name="linkedin"
                defaultValue={initial?.linkedin || ""}
                className={osTextareaClass()}
                rows={2}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="General pitch">
              <textarea
                name="generalPitch"
                defaultValue={initial?.generalPitch || ""}
                className={osTextareaClass()}
                rows={2}
              />
            </Field>
          </div>
        </>
      ) : null}

      <div className="sm:col-span-2 mt-2">
        <p className="font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)]">
          Sales intelligence
        </p>
      </div>
      <div className="sm:col-span-2">
        <Field label="Target industry">
          <textarea
            name="targetIndustry"
            defaultValue={initial?.targetIndustry || ""}
            className={osTextareaClass()}
            rows={2}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Ideal customer">
          <textarea
            name="idealCustomer"
            defaultValue={initial?.idealCustomer || ""}
            className={osTextareaClass()}
            rows={2}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Key selling points">
          <textarea
            name="sellingPoints"
            defaultValue={initial?.sellingPoints || ""}
            className={osTextareaClass()}
            rows={2}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Common objections">
          <textarea
            name="commonObjections"
            defaultValue={initial?.commonObjections || ""}
            className={osTextareaClass()}
            rows={2}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Best pitch angle">
          <textarea
            name="bestPitchAngle"
            defaultValue={initial?.bestPitchAngle || ""}
            className={osTextareaClass()}
            rows={2}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Pricing notes">
          <textarea
            name="pricingNotes"
            defaultValue={initial?.pricingNotes || ""}
            className={osTextareaClass()}
            rows={2}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Competitors">
          <textarea
            name="competitors"
            defaultValue={initial?.competitors || ""}
            className={osTextareaClass()}
            rows={2}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Demo notes">
          <textarea
            name="demoNotes"
            defaultValue={initial?.demoNotes || ""}
            className={osTextareaClass()}
            rows={2}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Internal notes">
          <textarea
            name="internalNotes"
            defaultValue={initial?.internalNotes || ""}
            className={osTextareaClass()}
            rows={3}
          />
        </Field>
      </div>
    </OsActionForm>
  );
}
