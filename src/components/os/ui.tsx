import { cn } from "@/lib/utils";
import { formatCurrencyINR } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

/** Apple-style back control: chevron + destination name (no pill button). */
export function OsBackLink({
  href,
  label = "Back",
}: {
  href: string;
  label?: string;
}) {
  const text = label.replace(/^back(\s+to)?\s+/i, "").trim() || "Back";

  return (
    <Link
      href={href}
      className="group -ml-1.5 inline-flex max-w-full items-center gap-0.5 rounded-md py-1 pr-2 font-inter text-[17px] font-normal leading-none text-[#0071e3] transition-opacity hover:opacity-70 active:opacity-50"
    >
      <ChevronLeft
        className="h-[22px] w-[22px] shrink-0 -translate-x-0.5 stroke-[2.25]"
        aria-hidden
      />
      <span className="truncate capitalize tracking-[-0.01em]">{text}</span>
    </Link>
  );
}

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
        <div className="mb-5">
          <OsBackLink href={backHref} label={backLabel} />
        </div>
      ) : null}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-archivo text-2xl uppercase tracking-wide text-[var(--dash-text)]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1.5 max-w-2xl font-inter text-sm leading-relaxed text-[var(--dash-muted)]">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
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
    neutral: "bg-[#f3f4f6] text-[#4b5563] ring-[#e5e7eb]",
    ok: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    warn: "bg-amber-50 text-amber-800 ring-amber-200",
    bad: "bg-red-50 text-red-700 ring-red-200",
    accent: "bg-sky-50 text-sky-800 ring-sky-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-inter text-[11px] font-medium uppercase leading-5 tracking-wide ring-1 ring-inset",
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
    <div className="rounded-xl border border-[var(--dash-border)] bg-white p-5">
      <p className="font-inter text-[11px] uppercase tracking-[0.14em] text-[var(--dash-faint)]">
        {label}
      </p>
      <p className="mt-2 font-archivo text-2xl text-[var(--dash-text)]">
        {typeof value === "number" ? formatCurrencyINR(value) : value}
      </p>
    </div>
  );
}

/** HRMS card heading — sentence case, optional “View all →”. */
export function CardTitle({
  title,
  href,
  actionLabel = "View all →",
}: {
  title: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-inter text-[15px] font-semibold tracking-[-0.01em] text-[#111111]">
        {title}
      </h2>
      {href ? (
        <Link
          href={href}
          className="shrink-0 font-inter text-[13px] font-medium text-[#6b7280] transition-colors hover:text-[#111111]"
        >
          {actionLabel}
        </Link>
      ) : null}
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
      className="inline-flex h-10 items-center rounded-lg bg-[#111111] px-4 font-inter text-[13px] font-medium text-white transition hover:bg-[#222222]"
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
      className="inline-flex h-10 items-center rounded-lg border border-[#e5e7eb] bg-white px-4 font-inter text-[13px] font-medium text-[#111111] transition hover:bg-[#f5f5f5]"
    >
      {children}
    </Link>
  );
}

export function OsTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--dash-border)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <table className="w-full min-w-[640px] border-collapse text-left font-inter text-sm [&_tbody_tr:last-child>td]:border-b-0 [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-[#fafafa]">
        {children}
      </table>
    </div>
  );
}

type CellAlign = "left" | "center" | "right";
const ALIGN_CLASS: Record<CellAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function Th({
  children,
  align = "left",
  className,
}: {
  children?: ReactNode;
  align?: CellAlign;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "whitespace-nowrap border-b border-[var(--dash-border)] bg-[#f8f9fa] px-4 py-3 align-middle font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]",
        ALIGN_CLASS[align],
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  align = "left",
}: {
  children?: ReactNode;
  className?: string;
  align?: CellAlign;
}) {
  return (
    <td
      className={cn(
        "border-b border-[var(--dash-border)] px-4 py-3.5 align-middle text-[var(--dash-text)]",
        ALIGN_CLASS[align],
        className
      )}
    >
      {children}
    </td>
  );
}

/** Shared button looks so page actions line up across sections. */
export function osButtonClass(variant: "primary" | "secondary" | "ghost" = "primary", size: "md" | "sm" = "md") {
  return cn(
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-inter font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
    size === "md" ? "h-10 px-4 text-[13px]" : "h-8 px-3 text-[12px]",
    variant === "primary" && "bg-[#111111] text-white hover:bg-[#262626]",
    variant === "secondary" && "border border-[#e5e7eb] bg-white text-[#111111] hover:bg-[#f5f5f5]",
    variant === "ghost" && "text-[#4b5563] hover:bg-[#f5f5f5] hover:text-[#111111]"
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
