"use client";

import Link from "next/link";
import {
  APPLICATION_STATUS_LABELS,
  type ApplicationStatus,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/referral/ui/card";

export type ApplicationsListItem = {
  id: string;
  applicantName: string;
  applicantEmail: string;
  status: ApplicationStatus;
  createdAt: string;
};

export function ApplicationsList({
  jobId,
  jobTitle,
  applications,
}: {
  jobId: string;
  jobTitle: string;
  applications: ApplicationsListItem[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-gaude-orange">
            Applications
          </p>
          <h1 className="mt-1 font-archivo text-2xl uppercase tracking-tighter text-[var(--dash-text)] sm:text-3xl">
            {jobTitle}
          </h1>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">
            {applications.length} application
            {applications.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/applications"
            className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-text)] transition hover:bg-[var(--dash-hover)]"
          >
            All applications
          </Link>
          <Link
            href={`/admin/jobs/${jobId}`}
            className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-text)] transition hover:bg-[var(--dash-hover)]"
          >
            Edit job
          </Link>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card className="border-dashed py-12 text-center text-sm text-[var(--dash-muted)]">
          No applications yet.
        </Card>
      ) : (
        <ul className="space-y-3">
          {applications.map((app) => (
            <li key={app.id}>
              <Link href={`/admin/applications/${app.id}`}>
                <Card className="flex flex-col gap-3 transition hover:border-[var(--dash-accent)]/40 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="truncate font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
                      {app.applicantName}
                    </h2>
                    <p className="mt-0.5 truncate text-sm text-[var(--dash-muted)]">
                      {app.applicantEmail || "No email"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <AppStatusBadge status={app.status} />
                    <span className="text-xs text-[var(--dash-faint)]">
                      {formatDateTime(app.createdAt)}
                    </span>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AppStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}
