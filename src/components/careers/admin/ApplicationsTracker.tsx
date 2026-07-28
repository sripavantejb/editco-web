"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  type ApplicationStatus,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/referral/ui/card";

export type ApplicationsTrackerItem = {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  status: ApplicationStatus;
  createdAt: string;
};

export function ApplicationsTracker({
  applications,
  stats,
}: {
  applications: ApplicationsTrackerItem[];
  stats: {
    total: number;
    newCount: number;
    reviewing: number;
    shortlisted: number;
  };
}) {
  const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>(
    "all"
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.applicantName.toLowerCase().includes(q) ||
        a.applicantEmail.toLowerCase().includes(q) ||
        a.jobTitle.toLowerCase().includes(q)
      );
    });
  }, [applications, statusFilter, query]);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-gaude-orange">
          Careers
        </p>
        <h1 className="mt-1 font-archivo text-2xl uppercase tracking-tighter text-[var(--dash-text)] sm:text-3xl">
          Applications
        </h1>
        <p className="mt-1 text-sm text-[var(--dash-muted)]">
          Track every candidate across open and closed roles.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="New" value={stats.newCount} />
        <StatCard label="Reviewing" value={stats.reviewing} />
        <StatCard label="Shortlisted" value={stats.shortlisted} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, role…"
          className="flex h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gaude-orange sm:max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | ApplicationStatus)
          }
          className="flex h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gaude-orange sm:w-48"
        >
          <option value="all">All statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {APPLICATION_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed py-12 text-center text-sm text-[var(--dash-muted)]">
          {applications.length === 0
            ? "No applications yet. Publish a job to start receiving them."
            : "No applications match your filters."}
        </Card>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {filtered.map((app) => (
              <li key={app.id}>
                <Link href={`/admin/applications/${app.id}`}>
                  <Card className="transition hover:border-[var(--dash-accent)]/40">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
                          {app.applicantName}
                        </h2>
                        <p className="mt-0.5 truncate text-xs text-[var(--dash-muted)]">
                          {app.jobTitle}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="mt-3 flex justify-between text-xs text-[var(--dash-faint)]">
                      <span className="truncate">{app.applicantEmail || "—"}</span>
                      <span>{formatDateTime(app.createdAt)}</span>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-2xl border border-[var(--dash-border)] md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-[var(--dash-border)]/60 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--dash-text)]">
                        {app.applicantName}
                      </div>
                      <div className="text-xs text-[var(--dash-faint)]">
                        {app.applicantEmail || "No email"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--dash-muted)]">
                      <Link
                        href={`/admin/jobs/${app.jobId}`}
                        className="hover:text-[var(--dash-accent)]"
                      >
                        {app.jobTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-[var(--dash-faint)]">
                      {formatDateTime(app.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="text-xs text-gaude-orange hover:underline"
                      >
                        Open
                      </Link>
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-faint)]">
        {label}
      </p>
      <p className="mt-2 font-archivo text-2xl tracking-tight text-[var(--dash-text)]">
        {value}
      </p>
    </Card>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const styles: Record<ApplicationStatus, string> = {
    new: "bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]",
    reviewing: "bg-sky-500/15 text-sky-300",
    shortlisted: "bg-violet-500/15 text-violet-300",
    rejected: "bg-red-500/15 text-red-300",
    hired: "bg-emerald-500/15 text-emerald-300",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}
