import { Check } from "lucide-react";
import {
  TRACK_STAGES,
  TRACK_STAGE_BLURBS,
  TRACK_STAGE_LABELS,
  stageIndex,
  type TrackStage,
} from "@/lib/os/tracking-stages";
import { cn } from "@/lib/utils";

/**
 * Courier-style progress rail: horizontal on desktop, vertical on phones so the
 * stage copy stays readable instead of squeezing into five columns.
 */
export function TrackStepper({ stage }: { stage: TrackStage }) {
  const current = stageIndex(stage);

  return (
    <div className="rounded-[22px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 backdrop-blur-md sm:p-7">
      {/* Desktop rail */}
      <ol className="hidden sm:flex">
        {TRACK_STAGES.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s} className="relative flex-1 last:flex-none last:w-auto">
              <div className="flex items-center">
                <span
                  className={cn(
                    "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors",
                    done && "border-[var(--dash-accent)] bg-[var(--dash-accent)]",
                    active &&
                      "border-[var(--dash-accent)] bg-[rgba(200,245,66,0.16)]",
                    !done && !active && "border-[var(--dash-border)] bg-[var(--dash-bg)]"
                  )}
                >
                  {active ? (
                    <span className="absolute inset-0 animate-ping rounded-full bg-[rgba(200,245,66,0.28)]" />
                  ) : null}
                  {done ? (
                    <Check className="h-4 w-4 text-[#0c0c0c]" strokeWidth={3} />
                  ) : (
                    <span
                      className={cn(
                        "relative h-2 w-2 rounded-full",
                        active ? "bg-[var(--dash-accent)]" : "bg-[var(--dash-faint)]"
                      )}
                    />
                  )}
                </span>
                {i < TRACK_STAGES.length - 1 ? (
                  <span
                    className={cn(
                      "mx-1 h-[2px] flex-1 rounded-full",
                      i < current ? "bg-[var(--dash-accent)]" : "bg-[var(--dash-border)]"
                    )}
                  />
                ) : null}
              </div>
              <div className="mt-3 pr-4">
                <p
                  className={cn(
                    "font-inter text-[13px] font-semibold",
                    i <= current ? "text-[var(--dash-text)]" : "text-[var(--dash-faint)]"
                  )}
                >
                  {TRACK_STAGE_LABELS[s]}
                </p>
                {active ? (
                  <p className="mt-1 max-w-[190px] font-inter text-xs leading-relaxed text-[var(--dash-muted)]">
                    {TRACK_STAGE_BLURBS[s]}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Mobile rail */}
      <ol className="space-y-0 sm:hidden">
        {TRACK_STAGES.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const last = i === TRACK_STAGES.length - 1;
          return (
            <li key={s} className="flex gap-3.5">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "relative grid h-8 w-8 shrink-0 place-items-center rounded-full border",
                    done && "border-[var(--dash-accent)] bg-[var(--dash-accent)]",
                    active && "border-[var(--dash-accent)] bg-[rgba(200,245,66,0.16)]",
                    !done && !active && "border-[var(--dash-border)] bg-[var(--dash-bg)]"
                  )}
                >
                  {active ? (
                    <span className="absolute inset-0 animate-ping rounded-full bg-[rgba(200,245,66,0.28)]" />
                  ) : null}
                  {done ? (
                    <Check className="h-3.5 w-3.5 text-[#0c0c0c]" strokeWidth={3} />
                  ) : (
                    <span
                      className={cn(
                        "relative h-1.5 w-1.5 rounded-full",
                        active ? "bg-[var(--dash-accent)]" : "bg-[var(--dash-faint)]"
                      )}
                    />
                  )}
                </span>
                {!last ? (
                  <span
                    className={cn(
                      "w-[2px] flex-1 rounded-full",
                      done ? "bg-[var(--dash-accent)]" : "bg-[var(--dash-border)]"
                    )}
                  />
                ) : null}
              </div>
              <div className={cn("min-w-0 flex-1", last ? "pb-0" : "pb-6")}>
                <p
                  className={cn(
                    "font-inter text-sm font-semibold",
                    i <= current ? "text-[var(--dash-text)]" : "text-[var(--dash-faint)]"
                  )}
                >
                  {TRACK_STAGE_LABELS[s]}
                </p>
                {active ? (
                  <p className="mt-1 font-inter text-xs leading-relaxed text-[var(--dash-muted)]">
                    {TRACK_STAGE_BLURBS[s]}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
