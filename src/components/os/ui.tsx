import { cn } from "@/lib/utils";
import { formatCurrencyINR } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

export function OsPage({
  title,
  subtitle,
  actions,
  backHref,
  backLabel = "Back",
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <main id="main" className="px-4 py-8 sm:px-8">
      {backHref ? (
        <div className="mb-4">
          <OsGhostLink href={backHref}>{backLabel}</OsGhostLink>
        </div>
      ) : null}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-archivo text-2xl uppercase tracking-wide text-[var(--dash-text)]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 max-w-2xl font-inter text-sm text-[var(--dash-muted)]">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </main>
  );
}

export function OsBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "ok" | "warn" | "bad" | "accent";
}) {
  const map = {
    neutral: "bg-white/10 text-[var(--dash-muted)]",
    ok: "bg-emerald-500/15 text-emerald-300",
    warn: "bg-amber-500/15 text-amber-300",
    bad: "bg-red-500/15 text-red-300",
    accent: "bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 font-inter text-[11px] font-medium uppercase tracking-wide",
        map[tone]
      )}
    >
      {children}
    </span>
  );
}

export function OsStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[20px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5">
      <p className="font-inter text-[11px] uppercase tracking-[0.14em] text-[var(--dash-faint)]">
        {label}
      </p>
      <p className="mt-2 font-archivo text-2xl text-[var(--dash-text)]">
        {typeof value === "number" ? formatCurrencyINR(value) : value}
      </p>
    </div>
  );
}

export function OsLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center rounded-full bg-[var(--dash-accent)] px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-on-accent)]"
    >
      {children}
    </Link>
  );
}

export function OsGhostLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center rounded-full border border-[var(--dash-border)] px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-text)] hover:bg-[var(--dash-hover)]"
    >
      {children}
    </Link>
  );
}

export function OsTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[20px] border border-[var(--dash-border)]">
      <table className="w-full min-w-[640px] text-left font-inter text-sm">
        {children}
      </table>
    </div>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th className="border-b border-[var(--dash-border)] px-4 py-3 font-archivo text-[11px] uppercase tracking-wider text-[var(--dash-faint)]">
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("border-b border-[var(--dash-border)] px-4 py-3 text-[var(--dash-text)]", className)}>
      {children}
    </td>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-inter text-xs text-[var(--dash-muted)]">{label}</span>
      {children}
    </label>
  );
}

export function osInputClass() {
  return "flex h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gaude-orange";
}

export function osSelectClass() {
  return [
    "os-select",
    "flex h-11 w-full rounded-xl border border-[var(--dash-border)] px-3 pr-10 text-sm",
    "text-[var(--dash-text)]",
    "appearance-none cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gaude-orange",
    "bg-[length:1rem] bg-[right_0.85rem_center] bg-no-repeat",
    "bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23a3a3a3%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')]",
  ].join(" ");
}

export function osTextareaClass() {
  return "flex min-h-[88px] w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 py-2 text-sm text-[var(--dash-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gaude-orange";
}

export function leadTone(status: string): "neutral" | "ok" | "warn" | "bad" | "accent" {
  if (status === "converted") return "ok";
  if (status === "lost") return "bad";
  if (status === "on_hold") return "warn";
  if (status === "negotiation" || status === "proposal") return "accent";
  return "neutral";
}

export function projectTone(status: string): "neutral" | "ok" | "warn" | "bad" | "accent" {
  if (status === "completed") return "ok";
  if (status === "cancelled" || status === "blocked") return "bad";
  if (status === "waiting_for_client" || status === "in_review") return "warn";
  if (status === "in_progress" || status === "onboarding") return "accent";
  return "neutral";
}

export function invoiceTone(status: string): "neutral" | "ok" | "warn" | "bad" | "accent" {
  if (status === "paid") return "ok";
  if (status === "overdue") return "bad";
  if (status === "partially_paid") return "warn";
  if (status === "issued") return "accent";
  return "neutral";
}
