"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  JOB_STATUSES,
  JOB_STATUS_LABELS,
} from "@/lib/constants";
import { defaultJobFormFields, type FormFieldDef } from "@/lib/jobs";
import { createJob, updateJob, deleteJob } from "@/actions/jobs";
import type { ActionState } from "@/actions/auth";
import { FormBuilder } from "@/components/careers/admin/FormBuilder";
import { Button } from "@/components/referral/ui/button";
import { Input } from "@/components/referral/ui/input";
import { Label } from "@/components/referral/ui/label";
import { Textarea } from "@/components/referral/ui/textarea";
import { Card } from "@/components/referral/ui/card";

export type JobEditorJob = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: (typeof EMPLOYMENT_TYPES)[number];
  summary: string;
  description: string;
  requirements: string;
  benefits: string;
  status: (typeof JOB_STATUSES)[number];
  formFields: FormFieldDef[];
  applicationCount?: number;
};

type Props = {
  job?: JobEditorJob;
};

export function JobEditor({ job }: Props) {
  const isEdit = !!job;
  const action = isEdit ? updateJob : createJob;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {}
  );
  const [fields, setFields] = useState<FormFieldDef[]>(
    job?.formFields?.length ? job.formFields : defaultJobFormFields()
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-gaude-orange">
            Careers
          </p>
          <h1 className="mt-1 font-archivo text-2xl uppercase tracking-tighter text-[var(--dash-text)] sm:text-3xl">
            {isEdit ? "Edit job" : "New job"}
          </h1>
          {isEdit && (
            <p className="mt-1 text-sm text-[var(--dash-muted)]">
              {job.applicationCount ?? 0} application
              {(job.applicationCount ?? 0) === 1 ? "" : "s"}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/jobs"
            className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-text)] transition hover:bg-[var(--dash-hover)]"
          >
            Back
          </Link>
          {isEdit && (
            <Link
              href="/admin/applications"
              className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--dash-border)] bg-[var(--dash-hover)] px-4 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-text)] transition hover:bg-[var(--dash-surface-strong)]"
            >
              Applications
            </Link>
          )}
          {isEdit && (
            <Link
              href={`/admin/jobs/${job.id}/applications`}
              className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)] transition hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
            >
              This role
            </Link>
          )}
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="jobId" value={job.id} />}
        <input type="hidden" name="formFields" value={JSON.stringify(fields)} />

        <Card className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={job?.title}
                required
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                defaultValue={job?.department}
                placeholder="Engineering"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={job?.location || "Remote"}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="employmentType">Employment type</Label>
              <select
                id="employmentType"
                name="employmentType"
                defaultValue={job?.employmentType || "full_time"}
                className="flex h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gaude-orange"
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {EMPLOYMENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={job?.status || "draft"}
                className="flex h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gaude-orange"
              >
                {JOB_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {JOB_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="summary">Summary</Label>
              <Input
                id="summary"
                name="summary"
                defaultValue={job?.summary}
                placeholder="One-line blurb for the listing card"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={job?.description}
                required
                rows={8}
                placeholder="Role overview, what you’ll work on…"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                defaultValue={job?.requirements}
                rows={5}
                placeholder="Skills and experience…"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea
                id="benefits"
                name="benefits"
                defaultValue={job?.benefits}
                rows={4}
                placeholder="Perks, culture, compensation notes…"
              />
            </div>
          </div>
        </Card>

        <FormBuilder fields={fields} onChange={setFields} />

        {state.error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-xl border border-[var(--dash-accent)]/30 bg-[var(--dash-accent-soft)] px-4 py-3 text-sm text-[var(--dash-accent)]">
            {state.success}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {isEdit ? (
            <div>
              {!confirmDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete job
                </Button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-[var(--dash-muted)]">
                    Delete job and all applications?
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteJob(job.id)}
                  >
                    Confirm delete
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={pending} className="dash-cta min-h-11 w-full sm:w-auto">
            {pending ? "Saving…" : isEdit ? "Save job" : "Create job"}
          </Button>
        </div>
      </form>
    </div>
  );
}
