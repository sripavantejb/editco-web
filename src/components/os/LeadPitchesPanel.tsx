"use client";

import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, osTextareaClass } from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import {
  addLeadProjectPitch,
  updateLeadPitchStatus,
  removeLeadProjectPitch,
} from "@/actions/os/lead-pitches";
import {
  PITCH_STATUSES,
  PITCH_STATUS_LABELS,
  type PitchStatus,
} from "@/lib/os/constants";
import type { VaultProjectOption } from "@/components/os/VaultProjectMultiSelect";
import { LeadPitchCopyMessage } from "@/components/os/LeadPitchCopyMessage";
import Link from "next/link";

export type PitchCard = {
  id: string;
  projectId: string;
  projectName: string;
  status: PitchStatus;
  pitchedBy: string;
  pitchedAt: string;
  notes: string;
  attemptCount: number;
  productionUrl?: string;
};

export function LeadPitchesPanel({
  leadId,
  leadName,
  leadCompany,
  leadPhone,
  senderName,
  canWrite,
  canConvert,
  pitches,
  vaultProjects,
  messageBodies,
}: {
  leadId: string;
  leadName: string;
  leadCompany: string;
  leadPhone: string;
  senderName: string;
  canWrite: boolean;
  canConvert: boolean;
  pitches: PitchCard[];
  vaultProjects: VaultProjectOption[];
  messageBodies: Record<
    string,
    Partial<Record<string, { subject?: string; body?: string }>>
  >;
}) {
  const pitchedIds = new Set(pitches.map((p) => p.projectId));
  const available = vaultProjects.filter((p) => !pitchedIds.has(p.id));

  return (
    <section className="mt-10">
      <h2 className="mb-4 font-archivo text-sm uppercase">Projects pitched</h2>
      <div className="space-y-4">
        {pitches.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-[var(--dash-border)] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link
                  href={`/admin/os/projects-vault/${p.projectId}`}
                  className="font-medium text-[var(--dash-accent)] hover:underline"
                >
                  {p.projectName}
                </Link>
                <p className="mt-1 font-inter text-xs text-[var(--dash-muted)]">
                  Status: {PITCH_STATUS_LABELS[p.status]} · Pitched{" "}
                  {p.pitchedAt}
                  {p.pitchedBy ? ` · by ${p.pitchedBy}` : ""}
                  {p.attemptCount > 1 ? ` · ${p.attemptCount} attempts` : ""}
                </p>
              </div>
              {p.status === "won" && canConvert ? (
                <Link
                  href={`/admin/os/leads/${leadId}/convert`}
                  className="inline-flex min-h-8 items-center rounded-full bg-[var(--dash-accent)] px-3 font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-on-accent)]"
                >
                  Convert lead
                </Link>
              ) : null}
            </div>
            {p.notes ? (
              <p className="mt-2 font-inter text-sm text-[var(--dash-muted)]">
                {p.notes}
              </p>
            ) : null}
            {canWrite ? (
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <OsActionForm
                  action={updateLeadPitchStatus}
                  submitLabel="Update status"
                  className="space-y-2"
                >
                  <input type="hidden" name="pitchId" value={p.id} />
                  <OsSelect
                    name="status"
                    defaultValue={p.status}
                    options={PITCH_STATUSES.map((s) => ({
                      value: s,
                      label: PITCH_STATUS_LABELS[s],
                    }))}
                  />
                  <Field label="Notes">
                    <textarea
                      name="notes"
                      defaultValue={p.notes}
                      className={osTextareaClass()}
                      rows={2}
                    />
                  </Field>
                </OsActionForm>
                <LeadPitchCopyMessage
                  leadName={leadName}
                  leadCompany={leadCompany}
                  leadPhone={leadPhone}
                  senderName={senderName}
                  projectName={p.projectName}
                  projectWebsite={p.productionUrl}
                  messages={messageBodies[p.projectId] || {}}
                />
                <form action={removeLeadProjectPitch}>
                  <input type="hidden" name="pitchId" value={p.id} />
                  <button
                    type="submit"
                    className="font-archivo text-[10px] uppercase tracking-[0.08em] text-red-400"
                  >
                    Remove pitch
                  </button>
                </form>
              </div>
            ) : (
              <LeadPitchCopyMessage
                leadName={leadName}
                leadCompany={leadCompany}
                leadPhone={leadPhone}
                senderName={senderName}
                projectName={p.projectName}
                projectWebsite={p.productionUrl}
                messages={messageBodies[p.projectId] || {}}
              />
            )}
          </div>
        ))}
        {pitches.length === 0 ? (
          <p className="font-inter text-sm text-[var(--dash-muted)]">
            No projects pitched yet.
          </p>
        ) : null}
      </div>

      {canWrite && available.length > 0 ? (
        <div className="mt-6 rounded-xl border border-[var(--dash-border)] p-4">
          <h3 className="mb-3 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)]">
            + Pitch another project
          </h3>
          <OsActionForm
            action={addLeadProjectPitch}
            submitLabel="Add pitch"
            className="space-y-3"
          >
            <input type="hidden" name="leadId" value={leadId} />
            <OsSelect
              name="projectId"
              placeholder="Select project"
              required
              options={[
                { value: "", label: "Select project" },
                ...available.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
            <Field label="Notes">
              <textarea name="notes" className={osTextareaClass()} rows={2} />
            </Field>
          </OsActionForm>
        </div>
      ) : null}
    </section>
  );
}
