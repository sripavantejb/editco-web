"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { EGAListItem } from "@/actions/ega";
import {
  EGA_STATUS_LABELS,
  egaEmailTemplate,
  egaWhatsAppTemplate,
  egaWhatsAppUrl,
  type EGAOutreachKind,
  type EGAStatus,
} from "@/lib/ega";
import { formatDateTime } from "@/lib/utils";
import { openGmailCompose } from "@/lib/gmail";
import { Card } from "@/components/referral/ui/card";

export function EGAAdminList({
  applications,
  stats,
}: {
  applications: EGAListItem[];
  stats: {
    total: number;
    pending: number;
    selected: number;
    lookback: number;
    rejected: number;
  };
}) {
  const [statusFilter, setStatusFilter] = useState<"all" | EGAStatus>("all");
  const [scoreMin, setScoreMin] = useState("");
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = scoreMin === "" ? 0 : Number(scoreMin);
    return applications.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (Number.isFinite(min) && a.score < min) return false;
      if (!q) return true;
      return (
        a.fullName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.college.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q)
      );
    });
  }, [applications, statusFilter, scoreMin, query]);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-[var(--dash-accent)]">
          Growth Associates
        </p>
        <h1 className="mt-1 font-archivo text-2xl uppercase tracking-tighter text-[var(--dash-text)] sm:text-3xl">
          EGA Applications
        </h1>
        <p className="mt-1 text-sm text-[var(--dash-muted)]">
          Fit signal helps sort — it is not a grade. Click a name to open the
          profile, then mark Selected, Lookback, or Rejected to load email and
          WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <button type="button" onClick={() => setStatusFilter("all")}>
          <StatCard label="Total" value={stats.total} active={statusFilter === "all"} />
        </button>
        <button type="button" onClick={() => setStatusFilter("pending")}>
          <StatCard
            label="Pending"
            value={stats.pending}
            active={statusFilter === "pending"}
          />
        </button>
        <button type="button" onClick={() => setStatusFilter("selected")}>
          <StatCard
            label="Selected"
            value={stats.selected}
            active={statusFilter === "selected"}
          />
        </button>
        <button type="button" onClick={() => setStatusFilter("lookback")}>
          <StatCard
            label="Lookback"
            value={stats.lookback}
            active={statusFilter === "lookback"}
          />
        </button>
        <button type="button" onClick={() => setStatusFilter("rejected")}>
          <StatCard
            label="Rejected"
            value={stats.rejected}
            active={statusFilter === "rejected"}
          />
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, phone, college…"
          className="flex h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)] sm:max-w-sm"
        />
        <select
          value={scoreMin}
          onChange={(e) => setScoreMin(e.target.value)}
          className="flex h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)] sm:w-48"
        >
          <option value="">Any score</option>
          <option value="40">40+</option>
          <option value="55">55+</option>
          <option value="70">70+</option>
          <option value="85">85+</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed py-12 text-center text-sm text-[var(--dash-muted)]">
          {applications.length === 0
            ? "No Growth Associate applications yet."
            : "No applications match your filters."}
        </Card>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {filtered.map((app) => (
              <li key={app.id}>
                <Card className="transition hover:border-[var(--dash-accent)]/40">
                  <Link href={`/admin/ega/${app.id}`} className="block">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
                          {app.fullName}
                        </h2>
                        <p className="mt-0.5 truncate text-xs text-[var(--dash-muted)]">
                          {app.college}
                          {app.city ? ` · ${app.city}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <ScoreBadge score={app.score} />
                        <StatusBadge status={app.status} />
                      </div>
                    </div>
                  </Link>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {app.status === "pending" ? (
                      <Link
                        href={`/admin/ega/${app.id}`}
                        className="text-xs text-[var(--dash-accent)] hover:underline"
                      >
                        Review
                      </Link>
                    ) : (
                      <OutreachButtons app={app} />
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-2xl border border-[var(--dash-border)] md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">College</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Applied</th>
                  <th className="px-4 py-3 font-medium">Reach out</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    className="cursor-pointer border-b border-[var(--dash-border)]/60 last:border-0 hover:bg-white/[0.03]"
                    onClick={() => router.push(`/admin/ega/${app.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--dash-accent)] underline-offset-2 hover:underline">
                        {app.fullName}
                      </div>
                      <div className="text-xs text-[var(--dash-faint)]">
                        {app.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--dash-muted)]">
                      {app.college}
                    </td>
                    <td className="px-4 py-3 text-[var(--dash-muted)]">
                      {app.city || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={app.score} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-[var(--dash-faint)]">
                      {formatDateTime(app.createdAt)}
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {app.status === "pending" ? null : (
                        <OutreachButtons app={app} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-archivo uppercase tracking-[0.08em] text-[var(--dash-accent)]">
                        Open profile
                      </span>
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

function outreachKind(status: EGAStatus): EGAOutreachKind {
  if (status === "rejected") return "rejected";
  if (status === "lookback") return "lookback";
  return "selected";
}

function OutreachButtons({ app }: { app: EGAListItem }) {
  const kind = outreachKind(app.status);
  const email = egaEmailTemplate(kind, app.fullName);
  const wa = egaWhatsAppTemplate(kind, app.fullName);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() =>
          openGmailCompose({
            to: app.email,
            subject: email.subject,
            body: email.body,
          })
        }
        className="inline-flex h-8 items-center rounded-full border border-[var(--dash-border)] px-3 text-[10px] font-archivo uppercase tracking-[0.08em] text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
      >
        Email
      </button>
      <a
        href={egaWhatsAppUrl(app.phone, wa)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-8 items-center rounded-full border border-[var(--dash-border)] px-3 text-[10px] font-archivo uppercase tracking-[0.08em] text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
      >
        WhatsApp
      </a>
    </div>
  );
}

function StatCard({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active?: boolean;
}) {
  return (
    <Card
      className={`p-4 text-left transition ${
        active ? "border-[var(--dash-accent)]/70" : ""
      }`}
    >
      <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-faint)]">
        {label}
      </p>
      <p className="mt-2 font-archivo text-2xl tracking-tight text-[var(--dash-text)]">
        {value}
      </p>
    </Card>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 70
      ? "bg-emerald-500/15 text-emerald-300"
      : score >= 50
        ? "bg-amber-500/15 text-amber-300"
        : "bg-white/10 text-[var(--dash-muted)]";
  return (
    <span
      className={`inline-flex min-w-10 justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums ${cls}`}
    >
      {score}
    </span>
  );
}

export function StatusBadge({ status }: { status: EGAStatus }) {
  const styles: Record<EGAStatus, string> = {
    pending: "bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]",
    selected: "bg-emerald-500/15 text-emerald-300",
    lookback: "bg-amber-500/15 text-amber-300",
    rejected: "bg-red-500/15 text-red-300",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {EGA_STATUS_LABELS[status]}
    </span>
  );
}
