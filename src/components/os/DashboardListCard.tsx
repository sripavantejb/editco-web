"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type DashboardListItem = {
  id: string;
  /** Where the row navigates; the whole label is the link target. */
  href: string;
  label: string;
  /** Muted trailing context — assignee, project, POC. */
  meta?: string;
  status: string;
  /** True when the row belongs to the signed-in user. */
  mine: boolean;
};

/**
 * Dashboard card with an All / Mine segmented toggle. Both lists ship from the
 * server in one payload, so switching views is instant and needs no refetch.
 */
export function DashboardListCard({
  title,
  href,
  items,
  showToggle,
  emptyAll,
  emptyMine,
  limit = 10,
}: {
  title: string;
  href: string;
  items: DashboardListItem[];
  showToggle: boolean;
  emptyAll: string;
  emptyMine: string;
  limit?: number;
}) {
  const [scope, setScope] = useState<"all" | "mine">("all");
  const active = showToggle && scope === "mine";
  const visible = (active ? items.filter((i) => i.mine) : items).slice(0, limit);

  return (
    <section className="flex max-h-72 flex-col overflow-hidden rounded-xl border border-[var(--dash-border)] bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-inter text-[15px] font-semibold tracking-[-0.01em] text-[#111111]">
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          {showToggle ? (
            <div className="flex rounded-lg border border-[var(--dash-border)] p-0.5">
              {(["all", "mine"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={scope === s}
                  onClick={() => setScope(s)}
                  className={cn(
                    "rounded-md px-2 py-0.5 font-inter text-[11px] font-medium capitalize transition-colors",
                    scope === s
                      ? "bg-[var(--dash-accent)] text-white"
                      : "text-[#6b7280] hover:text-[#111111]"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}
          <Link
            href={href}
            className="font-inter text-[13px] font-medium text-[#6b7280] transition-colors hover:text-[#111111]"
          >
            View all →
          </Link>
        </div>
      </div>
      <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-3 font-inter text-sm [scrollbar-gutter:stable]">
        {visible.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-3">
            <Link href={i.href} className="min-w-0 flex-1 truncate font-medium text-[#111111]">
              {i.label}
              {i.meta ? <span className="font-normal text-[#6b7280]"> · {i.meta}</span> : null}
            </Link>
            <span className="shrink-0 text-[12px] text-[#6b7280]">{i.status}</span>
          </li>
        ))}
        {visible.length === 0 ? (
          <li className="text-[#6b7280]">{active ? emptyMine : emptyAll}</li>
        ) : null}
      </ul>
    </section>
  );
}
