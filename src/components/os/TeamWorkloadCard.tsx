"use client";

import { useState, useTransition } from "react";
import { Mail, Bell } from "lucide-react";
import {
  nudgeStaffWorkload,
  sendOsDashboardAlerts,
} from "@/actions/os/dashboard-alerts";
import { cn } from "@/lib/utils";

export type WorkloadPerson = {
  id: string;
  name: string;
  email: string;
  active: number;
  completed: number;
  total: number;
  overdue: number;
  blocked: number;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name.slice(0, 2) || "?").toUpperCase();
}

const AVATAR_COLORS = [
  "bg-teal-100 text-teal-800",
  "bg-sky-100 text-sky-800",
  "bg-violet-100 text-violet-800",
];

/** Open POC tasks: 0 empty, 1 → 25%, 4+ full. */
function loadPct(open: number) {
  if (open <= 0) return 0;
  return Math.min(100, Math.round((open / 4) * 100));
}

export function TeamWorkloadCard({ people }: { people: WorkloadPerson[] }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const nudge = (p: WorkloadPerson) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", p.email);
      fd.set("name", p.name);
      fd.set("active", String(p.active));
      fd.set("overdue", String(p.overdue));
      const res = await nudgeStaffWorkload({}, fd);
      setMsg(res.success || res.error || null);
    });
  };

  return (
    <section className="mb-6 overflow-hidden rounded-xl border border-[var(--dash-border)] bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-inter text-[15px] font-semibold tracking-[-0.01em] text-[#111111]">
          Team workload
        </h2>
        <span className="font-inter text-[12px] text-[#6b7280]">
          Master Tracker · by POC · {people.filter((p) => p.blocked > 0).length} blocked
        </span>
      </div>

      <ul className="space-y-3 font-inter text-sm">
        {people.map((p, i) => {
          const pct = loadPct(p.active);
          const hot = p.blocked > 0;
          return (
            <li
              key={p.id}
              className={cn(
                "rounded-xl border px-3 py-2.5",
                hot ? "border-amber-200 bg-amber-50/50" : "border-[#f3f4f6] bg-[#fafafa]"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-inter text-[11px] font-semibold",
                    AVATAR_COLORS[i % AVATAR_COLORS.length]
                  )}
                >
                  {initials(p.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-[#111111]">{p.name}</p>
                    <p className="shrink-0 text-[12px] text-[#6b7280]">
                      {p.active === 0
                        ? p.completed > 0
                          ? `${p.completed} done · none open`
                          : "No POC tasks"
                        : `${p.active} open`}
                      {p.completed > 0 && p.active > 0 ? ` · ${p.completed} done` : null}
                      {p.blocked > 0 ? (
                        <span className="text-red-600"> · {p.blocked} blocked</span>
                      ) : null}
                    </p>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#e5e7eb]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          pct === 0
                            ? "bg-transparent"
                            : p.blocked
                              ? "bg-red-500"
                              : pct >= 100
                                ? "bg-red-500"
                                : "bg-[#111111]"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right font-inter text-[11px] tabular-nums text-[#6b7280]">
                      {pct}%
                    </span>
                    <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 font-inter text-[11px] font-semibold tabular-nums text-[#111111] ring-1 ring-[#e5e7eb]">
                      {p.active} open
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={pending || !p.email}
                  onClick={() => nudge(p)}
                  title="Email nudge"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#6b7280] transition hover:border-[#111111] hover:text-[#111111] disabled:opacity-40"
                >
                  <Mail className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {msg ? <p className="mt-3 font-inter text-xs text-[#6b7280]">{msg}</p> : null}
    </section>
  );
}

export function EmailAlertsButton({
  overdueInvoices,
  overdueTasks,
  followUpsDue,
}: {
  overdueInvoices: number;
  overdueTasks: number;
  followUpsDue: number;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const total = overdueInvoices + overdueTasks + followUpsDue;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const res = await sendOsDashboardAlerts({});
            setMsg(res.success || res.error || null);
          });
        }}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 font-inter text-[13px] font-medium text-[#111111] transition hover:bg-[#f5f5f5] disabled:opacity-50"
      >
        <Bell className="h-3.5 w-3.5" />
        {pending ? "Sending…" : `Email alerts${total ? ` (${total})` : ""}`}
      </button>
      {msg ? <span className="font-inter text-xs text-[#6b7280]">{msg}</span> : null}
    </div>
  );
}
