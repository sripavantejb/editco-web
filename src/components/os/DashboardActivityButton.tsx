"use client";

import { useState } from "react";
import { Activity, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export type ActivityItem = {
  id: string;
  actor: string;
  title: string;
  detail?: string;
  at?: string;
};

export function DashboardActivityButton({ items }: { items: ActivityItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Latest activity"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#6b7280] transition hover:bg-[#f5f5f5] hover:text-[#111111]"
      >
        <Activity className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[10vh]">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-label="Close" />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
              <p className="font-inter text-sm font-semibold text-[#111111]">Latest activity</p>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-[#6b7280] hover:bg-[#f5f5f5]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-[55vh] space-y-2 overflow-y-auto p-3">
              {items.map((a) => (
                <li key={a.id} className="rounded-xl border border-[#e5e7eb] px-3 py-2.5">
                  <p className="font-inter text-[13px] font-medium text-[#111111]">{a.actor}</p>
                  <p className="mt-0.5 font-inter text-[13px] text-[#374151]">{a.title}</p>
                  {a.detail ? (
                    <p className="mt-0.5 font-inter text-xs text-[#6b7280]">{a.detail}</p>
                  ) : null}
                  {a.at ? (
                    <p className="mt-1 font-inter text-[11px] text-[#898989]">{formatDateTime(a.at)}</p>
                  ) : null}
                </li>
              ))}
              {items.length === 0 ? (
                <li className="px-2 py-6 text-center font-inter text-sm text-[#6b7280]">No recent activity.</li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
