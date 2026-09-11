import { cn } from "@/lib/utils";

export function TrackCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[22px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 backdrop-blur-md sm:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}

export function TrackSectionTitle({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h2 className="font-archivo text-[12px] uppercase tracking-[0.14em] text-[var(--dash-muted)]">
        {title}
      </h2>
      {hint ? (
        <span className="font-inter text-xs text-[var(--dash-faint)]">{hint}</span>
      ) : null}
    </div>
  );
}

/** Thin horizontal meter used for per-project completion. */
export function TrackBar({ pct, className }: { pct: number; className?: string }) {
  const safe = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]",
        className
      )}
      role="progressbar"
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-[var(--dash-accent)] transition-[width] duration-700"
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}

/** Big circular completion dial for the hero. */
export function TrackRing({ pct, label }: { pct: number; label: string }) {
  const safe = Math.max(0, Math.min(100, Math.round(pct)));
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dash = (safe / 100) * circumference;

  return (
    <div className="relative grid h-[132px] w-[132px] shrink-0 place-items-center">
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full -rotate-90"
        aria-hidden
        focusable="false"
      >
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--dash-accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-archivo text-[30px] leading-none text-[var(--dash-text)]">
            {safe}
            <span className="text-[16px] text-[var(--dash-muted)]">%</span>
          </p>
          <p className="mt-1 font-inter text-[10px] uppercase tracking-[0.14em] text-[var(--dash-faint)]">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TrackStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "accent" | "warn";
}) {
  return (
    <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
      <p className="font-inter text-[10px] uppercase tracking-[0.14em] text-[var(--dash-faint)]">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-archivo text-xl",
          tone === "accent" && "text-[var(--dash-accent)]",
          tone === "warn" && "text-amber-300",
          !tone && "text-[var(--dash-text)]"
        )}
      >
        {value}
      </p>
    </div>
  );
}

const PILL_TONES = {
  neutral: "border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-muted)]",
  accent: "border-[rgba(200,245,66,0.35)] bg-[rgba(200,245,66,0.12)] text-[var(--dash-accent)]",
  good: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  warn: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  bad: "border-rose-400/30 bg-rose-400/10 text-rose-300",
} as const;

export function TrackPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: keyof typeof PILL_TONES;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 font-inter text-[11px] font-medium",
        PILL_TONES[tone]
      )}
    >
      {children}
    </span>
  );
}

export function TrackEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-[var(--dash-border)] px-4 py-5 text-center font-inter text-sm text-[var(--dash-faint)]">
      {children}
    </p>
  );
}
