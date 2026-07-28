"use client";

import Link from "next/link";
import {
  EMPLOYMENT_TYPE_LABELS,
  JOB_STATUS_LABELS,
  type EmploymentType,
  type JobStatus,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/referral/ui/card";
import { Plus } from "lucide-react";

export type JobsListItem = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  status: JobStatus;
  applicationCount: number;
  updatedAt: string;
};

export function JobsList({ jobs }: { jobs: JobsListItem[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-gaude-orange">
            Careers
          </p>
          <h1 className="mt-1 font-archivo text-2xl uppercase tracking-tighter text-[var(--dash-text)] sm:text-3xl">
            Jobs
          </h1>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">
            Post roles and manage application forms.
          </p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0a0a0a] px-6 font-archivo text-sm uppercase tracking-[0.08em] text-white shadow-[0_6px_18px_rgba(0,0,0,0.16)] transition hover:bg-[#1a1a1a]"
        >
          <Plus className="h-4 w-4" />
          New job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card className="border-dashed py-12 text-center">
          <p className="text-sm text-[var(--dash-muted)]">No jobs yet.</p>
          <Link
            href="/admin/jobs/new"
            className="mt-4 inline-flex text-sm text-gaude-orange underline-offset-4 hover:underline"
          >
            Create your first role
          </Link>
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link href={`/admin/jobs/${job.id}`}>
                  <Card className="transition hover:border-[var(--dash-accent)]/40">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
                          {job.title}
                        </h2>
                        <p className="mt-1 text-xs text-[var(--dash-muted)]">
                          {[job.department, job.location]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="mt-3 flex justify-between text-xs text-[var(--dash-faint)]">
                      <span>
                        {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
                      </span>
                      <span>
                        {job.applicationCount} app
                        {job.applicationCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-[var(--dash-border)] md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Apps</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-[var(--dash-border)]/60 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--dash-text)]">
                        {job.title}
                      </div>
                      <div className="text-xs text-[var(--dash-faint)]">
                        {[job.department, job.location]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--dash-muted)]">
                      {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3 text-[var(--dash-muted)]">
                      {job.applicationCount}
                    </td>
                    <td className="px-4 py-3 text-[var(--dash-faint)]">
                      {formatDate(job.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/jobs/${job.id}/applications`}
                          className="text-xs text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                        >
                          Apps
                        </Link>
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="text-xs text-gaude-orange hover:underline"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  const styles: Record<JobStatus, string> = {
    draft: "bg-white/10 text-[var(--dash-muted)]",
    published: "bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]",
    closed: "bg-red-500/15 text-red-300",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}
