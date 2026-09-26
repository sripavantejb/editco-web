export const dynamic = "force-dynamic";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Users, PhoneCall, BadgeCheck, FileText, Handshake, Trophy } from "lucide-react";
import { requireOsPage } from "@/lib/os/page";
import { Lead } from "@/models/os/Lead";
import { LeadActivity } from "@/models/os/LeadActivity";
import {
  LEAD_PIPELINE,
  LEAD_SOURCES,
  type LeadStatus,
} from "@/lib/os/constants";
import { OsPage, osSelectClass } from "@/components/os/ui";
import { hasPermission } from "@/lib/os/permissions";
import { PipelineBoard } from "@/components/os/PipelineBoard";
import { PipelineFunnel, type FunnelStep } from "@/components/os/PipelineFunnel";
import { formatCurrencyINR } from "@/lib/utils";

const RANGES = {
  all: { label: "All time", days: 0 },
  "30d": { label: "Last 30 days", days: 30 },
  "90d": { label: "Last 90 days", days: 90 },
  "365d": { label: "Last 12 months", days: 365 },
} as const;
type RangeKey = keyof typeof RANGES;

/** Card + funnel copy for each stage after "new" — how the step reads when a lead advances or drops. */
const STAGE_COPY: Record<string, { title: string; advanced: string; dropped: string; icon: LucideIcon }> = {
  new: { title: "Total leads", advanced: "Leads", dropped: "", icon: Users },
  contacted: { title: "Contacted", advanced: "Contacted", dropped: "Not contacted", icon: PhoneCall },
  qualified: { title: "Qualified", advanced: "Qualified", dropped: "Not qualified", icon: BadgeCheck },
  proposal: { title: "Proposal sent", advanced: "Proposal sent", dropped: "No proposal", icon: FileText },
  negotiation: { title: "Negotiation", advanced: "Negotiating", dropped: "Stalled before negotiation", icon: Handshake },
  converted: { title: "Converted", advanced: "Converted", dropped: "Not converted", icon: Trophy },
};

function sourceLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pct(n: number, d: number) {
  return d === 0 ? "0.0" : ((n / d) * 100).toFixed(1);
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; owner?: string; source?: string }>;
}) {
  const staff = await requireOsPage("leads:read");
  const canWrite = hasPermission(staff.permissions, "leads:write");
  const sp = await searchParams;
  const range: RangeKey = sp.range && sp.range in RANGES ? (sp.range as RangeKey) : "all";
  const owner = sp.owner || "";
  const source = sp.source && (LEAD_SOURCES as readonly string[]).includes(sp.source) ? sp.source : "";

  const query: Record<string, unknown> = { recordStatus: "active" };
  if (RANGES[range].days) {
    query.createdAt = { $gte: new Date(Date.now() - RANGES[range].days * 86400000) };
  }
  if (owner) query.assignedOwner = owner;
  if (source) query.source = source;

  const [leads, owners] = await Promise.all([
    Lead.find(query)
      .select("name company assignedOwner estimatedValue status")
      .lean(),
    Lead.distinct("assignedOwner", { recordStatus: "active" }),
  ]);

  const activities = leads.length
    ? await LeadActivity.find({
        leadId: { $in: leads.map((l) => l._id) },
        eventType: "status_change",
      })
        .select("leadId fromStatus toStatus")
        .lean()
    : [];

  // Furthest funnel stage each lead ever reached — lost / on-hold leads keep credit for how far they got.
  const stageIndex = (s?: string | null) => (s ? LEAD_PIPELINE.indexOf(s as LeadStatus) : -1);
  const furthest = new Map<string, number>();
  for (const l of leads) furthest.set(String(l._id), Math.max(0, stageIndex(l.status)));
  for (const a of activities) {
    const id = String(a.leadId);
    const best = Math.max(stageIndex(a.fromStatus), stageIndex(a.toStatus));
    if (best > (furthest.get(id) ?? 0)) furthest.set(id, best);
  }

  const reached = LEAD_PIPELINE.map((_, i) => [...furthest.values()].filter((f) => f >= i).length);
  const total = leads.length;

  const cards = LEAD_PIPELINE.map((stage, i) => {
    const copy = STAGE_COPY[stage];
    return {
      key: stage,
      title: copy.title,
      icon: copy.icon,
      value: reached[i],
      note: i === 0 ? "Base stage: 100.0%" : `${pct(reached[i], reached[i - 1])}% from ${STAGE_COPY[LEAD_PIPELINE[i - 1]].title}`,
    };
  });

  const steps: FunnelStep[] = LEAD_PIPELINE.map((stage, i) => {
    const copy = STAGE_COPY[stage];
    return {
      key: stage,
      label: i === 0 ? "Total leads added" : copy.title,
      cohort: i === 0 ? total : reached[i - 1],
      advanced: reached[i],
      advancedLabel: copy.advanced,
      droppedLabel: copy.dropped || "Dropped",
    };
  });

  const openStatuses: LeadStatus[] = ["new", "contacted", "qualified", "proposal", "negotiation"];
  const openLeads = leads.filter((l) => openStatuses.includes(l.status as LeadStatus));
  const pipelineValue = openLeads.reduce((s, l) => s + (l.estimatedValue || 0), 0);
  const lost = leads.filter((l) => l.status === "lost").length;
  const onHold = leads.filter((l) => l.status === "on_hold").length;
  const converted = reached[LEAD_PIPELINE.length - 1];
  const winRate = converted + lost === 0 ? 0 : (converted / (converted + lost)) * 100;

  const pipelineStatuses: LeadStatus[] = [...openStatuses, "lost", "on_hold"];
  const leadsByStatus: Record<string, Array<{
    _id: string;
    name: string;
    company?: string;
    assignedOwner?: string;
    estimatedValue?: number;
    status: LeadStatus;
  }>> = {};
  for (const s of pipelineStatuses) leadsByStatus[s] = [];
  for (const l of leads) {
    if (!leadsByStatus[l.status]) continue;
    leadsByStatus[l.status].push({
      _id: String(l._id),
      name: l.name,
      company: l.company,
      assignedOwner: l.assignedOwner,
      estimatedValue: l.estimatedValue,
      status: l.status as LeadStatus,
    });
  }

  const hasFilters = range !== "all" || Boolean(owner) || Boolean(source);

  return (
    <OsPage
      title="Pipeline"
      subtitle="Sales funnel analytics — how leads advance and where they drop. Converted deals live under Conversions."
      backHref="/admin/os"
      backLabel="Back to dashboard"
    >
      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <label className="block space-y-1.5">
          <span className="font-inter text-xs text-[var(--dash-muted)]">Period</span>
          <select name="range" defaultValue={range} className={`${osSelectClass()} w-44`}>
            {(Object.keys(RANGES) as RangeKey[]).map((k) => (
              <option key={k} value={k}>
                {RANGES[k].label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="font-inter text-xs text-[var(--dash-muted)]">Owner</span>
          <select name="owner" defaultValue={owner} className={`${osSelectClass()} w-44`}>
            <option value="">Everyone</option>
            {(owners as string[]).filter(Boolean).sort().map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="font-inter text-xs text-[var(--dash-muted)]">Source</span>
          <select name="source" defaultValue={source} className={`${osSelectClass()} w-40`}>
            <option value="">All sources</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {sourceLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-lg bg-[#111111] px-4 font-inter text-[13px] font-medium text-white hover:bg-[#222222]"
        >
          Apply filters
        </button>
        {hasFilters ? (
          <Link href="/admin/os/pipeline" className="h-11 content-center font-inter text-[13px] text-[var(--dash-muted)] hover:text-[var(--dash-text)]">
            Clear
          </Link>
        ) : null}
      </form>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.key} className="rounded-xl border border-[var(--dash-border)] bg-white p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-inter text-[11px] font-medium uppercase tracking-[0.12em] text-[#6b7280]">{c.title}</p>
                <Icon className="h-5 w-5 shrink-0 text-[#1e3a5f]" strokeWidth={1.75} />
              </div>
              <p className="mt-3 font-archivo text-3xl text-[#111111]">{c.value.toLocaleString("en-IN")}</p>
              <p className="mt-2 font-inter text-xs text-[#6b7280]">{c.note}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Open pipeline value", value: formatCurrencyINR(pipelineValue), note: `${openLeads.length} open leads` },
          { label: "Win rate", value: `${winRate.toFixed(1)}%`, note: "Converted vs lost" },
          { label: "Lost", value: lost.toLocaleString("en-IN"), note: `${pct(lost, total)}% of all leads` },
          { label: "On hold", value: onHold.toLocaleString("en-IN"), note: `${pct(onHold, total)}% of all leads` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--dash-border)] bg-[#f8f9fa] px-5 py-4">
            <p className="font-inter text-[11px] uppercase tracking-[0.12em] text-[#6b7280]">{s.label}</p>
            <p className="mt-1.5 font-archivo text-xl text-[#111111]">{s.value}</p>
            <p className="mt-1 font-inter text-xs text-[#6b7280]">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <PipelineFunnel steps={steps} total={total} />
      </div>

      <h2 className="mb-3 font-inter text-[15px] font-semibold text-[#111111]">Pipeline board</h2>
      <PipelineBoard columns={pipelineStatuses} leadsByStatus={leadsByStatus} canWrite={canWrite} />
    </OsPage>
  );
}
