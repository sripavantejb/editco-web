"use client";

import { OsSelect } from "@/components/os/OsSelect";
import { osInputClass } from "@/components/os/ui";
import {
  LEAD_STATUS_LABELS,
  PITCH_STATUS_LABELS,
} from "@/lib/os/constants";

export function LeadsFilterForm({
  q,
  status,
  sort,
  projectId,
  pitchStatus,
  vaultProjects = [],
}: {
  q: string;
  status?: string;
  sort?: string;
  projectId?: string;
  pitchStatus?: string;
  vaultProjects?: { id: string; name: string }[];
}) {
  return (
    <form
      className="mb-5 flex flex-wrap items-end gap-3"
      action="/admin/os/leads"
      method="get"
    >
      <label className="space-y-1.5">
        <span className="font-inter text-xs text-[var(--dash-muted)]">
          Search
        </span>
        <input
          name="q"
          defaultValue={q}
          className={osInputClass()}
          placeholder="Name / company / email / phone"
        />
      </label>
      <label className="min-w-[160px] space-y-1.5">
        <span className="font-inter text-xs text-[var(--dash-muted)]">
          Status
        </span>
        <OsSelect
          name="status"
          defaultValue={status || "all"}
          options={[
            { value: "all", label: "All" },
            ...Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => ({
              value: key,
              label,
            })),
          ]}
        />
      </label>
      {vaultProjects.length > 0 ? (
        <label className="min-w-[180px] space-y-1.5">
          <span className="font-inter text-xs text-[var(--dash-muted)]">
            Project pitched
          </span>
          <OsSelect
            name="projectId"
            defaultValue={projectId || "all"}
            options={[
              { value: "all", label: "All projects" },
              ...vaultProjects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </label>
      ) : null}
      <label className="min-w-[160px] space-y-1.5">
        <span className="font-inter text-xs text-[var(--dash-muted)]">
          Pitch status
        </span>
        <OsSelect
          name="pitchStatus"
          defaultValue={pitchStatus || "all"}
          options={[
            { value: "all", label: "All pitches" },
            ...Object.entries(PITCH_STATUS_LABELS).map(([key, label]) => ({
              value: key,
              label,
            })),
          ]}
        />
      </label>
      <label className="min-w-[180px] space-y-1.5">
        <span className="font-inter text-xs text-[var(--dash-muted)]">Sort</span>
        <OsSelect
          name="sort"
          defaultValue={sort || "updatedAt"}
          options={[
            { value: "updatedAt", label: "Recently updated" },
            { value: "createdAt", label: "Recently created" },
            { value: "value", label: "Highest value" },
          ]}
        />
      </label>
      <button
        type="submit"
        className="mb-1 inline-flex min-h-11 items-center rounded-xl bg-[var(--dash-accent)] px-4 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-on-accent)]"
      >
        Search
      </button>
    </form>
  );
}
