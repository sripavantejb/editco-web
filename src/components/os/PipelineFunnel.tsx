"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type FunnelStep = {
  key: string;
  label: string;
  /** Leads that entered this step (the previous step's advanced count). */
  cohort: number;
  advanced: number;
  advancedLabel: string;
  droppedLabel: string;
};

const STEP_COLORS = ["#1e3a5f", "#1f4b7a", "#2a5d8c", "#3a7299", "#4887a3", "#4f9ea5"];

function pct(n: number, d: number) {
  return d === 0 ? "0.0" : ((n / d) * 100).toFixed(1);
}

export function PipelineFunnel({ steps, total }: { steps: FunnelStep[]; total: number }) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(total, 1);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));

  return (
    <section className="rounded-xl border border-[var(--dash-border)] bg-white p-6">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-archivo text-sm uppercase tracking-[0.08em] text-[#111111]">Funnel visualization</h2>
        <div className="flex items-center gap-4 font-inter text-xs text-[#6b7280]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1e3a5f]" /> Advanced
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-[#cbd5e1] bg-[#e2e8f0]" /> Dropped
          </span>
        </div>
      </div>
      <p className="mb-6 font-inter text-xs text-[#6b7280]">
        Advanced vs dropped at each step (bar width = cohort size)
      </p>

      <div className="space-y-3">
        {steps.map((s, i) => {
          const dropped = Math.max(0, s.cohort - s.advanced);
          const cohortW = (s.cohort / max) * 100;
          const advW = s.cohort === 0 ? 0 : (s.advanced / s.cohort) * 100;
          const color = STEP_COLORS[Math.min(i, STEP_COLORS.length - 1)];
          const active = hover === s.key;
          return (
            <div key={s.key} className="grid grid-cols-[140px_1fr] items-center gap-4 sm:grid-cols-[180px_1fr]">
              <span className="truncate text-right font-inter text-[12px] text-[#374151]">{s.label}</span>
              <div
                className="relative h-8"
                onMouseEnter={() => setHover(s.key)}
                onMouseLeave={() => setHover(null)}
              >
                {s.cohort > 0 ? (
                  <div
                    className={cn(
                      "flex h-full overflow-hidden rounded-md border border-[#cbd5e1] bg-[#e2e8f0] transition-shadow",
                      active && "shadow-[0_0_0_2px_rgba(30,58,95,0.25)]"
                    )}
                    style={{ width: `${Math.max(cohortW, 2)}%` }}
                  >
                    <div
                      className="flex h-full items-center justify-center font-inter text-[12px] font-semibold text-white"
                      style={{ width: `${advW}%`, backgroundColor: color }}
                    >
                      {advW > 12 ? s.advanced.toLocaleString("en-IN") : ""}
                    </div>
                    {dropped > 0 ? (
                      <div className="flex h-full flex-1 items-center justify-center font-inter text-[12px] font-medium text-[#334155]">
                        {100 - advW > 12 ? dropped.toLocaleString("en-IN") : ""}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex h-full items-center font-inter text-[12px] text-[#9ca3af]">No leads</div>
                )}

                {active && s.cohort > 0 ? (
                  <div
                    className="absolute top-full z-20 mt-2 w-64 rounded-xl border border-[#e5e7eb] bg-white p-3 font-inter text-[13px] shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
                    style={{ left: `min(${Math.max(cohortW - 20, 0)}%, calc(100% - 16rem))` }}
                  >
                    <p className="mb-1 font-semibold text-[#111111]">{s.label}</p>
                    <p className="text-[#6b7280]">
                      Cohort: <span className="font-semibold text-[#111111]">{s.cohort.toLocaleString("en-IN")}</span>
                    </p>
                    <p className="mt-1.5" style={{ color }}>
                      {s.advancedLabel}: {s.advanced.toLocaleString("en-IN")} ({pct(s.advanced, s.cohort)}%)
                    </p>
                    <p className="text-[#64748b]">
                      {s.droppedLabel}: {dropped.toLocaleString("en-IN")} ({pct(dropped, s.cohort)}%)
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-[140px_1fr] gap-4 sm:grid-cols-[180px_1fr]">
        <span />
        <div className="relative h-5 border-t border-[#e5e7eb]">
          {ticks.map((t, i) => (
            <span
              key={i}
              className="absolute top-1 -translate-x-1/2 font-inter text-[11px] text-[#9ca3af]"
              style={{ left: `${(t / max) * 100}%` }}
            >
              {t.toLocaleString("en-IN")}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
