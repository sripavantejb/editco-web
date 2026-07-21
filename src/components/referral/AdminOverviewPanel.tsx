"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Filter,
  SlidersHorizontal,
  TrendingUp,
  Users,
  Wallet,
  CalendarDays,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  STAGE_LABELS,
  TIER_LABELS,
  type Stage,
  type Tier,
} from "@/lib/constants";
import { formatCurrencyINR, formatDate } from "@/lib/utils";

export type OverviewReferrer = {
  id: string;
  fullName: string;
  email: string;
  tier: Tier;
  successfulReferralCount: number;
  totalRewardEarned: number;
  totalRewardPaid: number;
  referralCount: number;
};

export type OverviewReferral = {
  id: string;
  referrerId: string;
  referredName: string;
  referredBusiness: string | null;
  source: string;
  stage: Stage;
  rewardStatus: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: string;
};

type MetricFilter = "referrers" | "month" | "won" | "rewards";

type OverviewStats = {
  totalReferrers: number;
  monthReferrals: number;
  conversionRate: number;
  paidRewards: string;
  pendingRewards: string;
};

function matchesManualFilters(
  r: OverviewReferral,
  referrers: OverviewReferrer[],
  q: string,
  stage: string,
  source: string
) {
  if (stage && r.stage !== stage) return false;
  if (source && r.source !== source) return false;
  if (q.trim()) {
    const ref = referrers.find((x) => x.id === r.referrerId);
    const hay =
      `${r.referredName} ${r.referredBusiness || ""} ${ref?.fullName || ""}`.toLowerCase();
    if (!hay.includes(q.trim().toLowerCase())) return false;
  }
  return true;
}

function matchesMetricFilter(
  r: OverviewReferral,
  metric: MetricFilter | null,
  monthStartIso: string
) {
  if (!metric || metric === "referrers") return true;
  if (metric === "month") return new Date(r.createdAt) >= new Date(monthStartIso);
  if (metric === "won") return r.stage === "won";
  if (metric === "rewards")
    return (
      r.stage === "won" &&
      (r.rewardStatus === "pending" || r.rewardStatus === "paid")
    );
  return true;
}

export function AdminOverviewPanel({
  referrers,
  referrals,
  stats,
  monthStartIso,
}: {
  referrers: OverviewReferrer[];
  referrals: OverviewReferral[];
  stats: OverviewStats;
  monthStartIso: string;
}) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [metricFilter, setMetricFilter] = useState<MetricFilter | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("");
  const [source, setSource] = useState("");

  const manualFiltersActive = Boolean(q.trim() || stage || source);
  const showReferralsView =
    manualFiltersActive || (metricFilter !== null && metricFilter !== "referrers");

  const referrerMap = useMemo(
    () => Object.fromEntries(referrers.map((r) => [r.id, r])),
    [referrers]
  );

  const filteredReferrals = useMemo(
    () =>
      referrals.filter(
        (r) =>
          matchesMetricFilter(r, metricFilter, monthStartIso) &&
          matchesManualFilters(r, referrers, q, stage, source)
      ),
    [referrals, referrers, metricFilter, monthStartIso, q, stage, source]
  );

  const referralsByReferrer = useMemo(() => {
    const map: Record<string, OverviewReferral[]> = {};
    for (const r of referrals) {
      const key = String(r.referrerId);
      if (!map[key]) map[key] = [];
      map[key].push(r);
    }
    return map;
  }, [referrals]);

  const activeFilterCount = [q.trim(), stage, source].filter(Boolean).length;

  const clearAll = () => {
    setQ("");
    setStage("");
    setSource("");
    setMetricFilter(null);
    setExpandedId(null);
  };

  const toggleMetric = (key: MetricFilter) => {
    setExpandedId(null);
    setMetricFilter((prev) => (prev === key ? null : key));
  };

  const metricCards = [
    {
      key: "referrers" as const,
      label: "Referrers",
      value: String(stats.totalReferrers),
      icon: Users,
      hint: "All partners",
    },
    {
      key: "month" as const,
      label: "This month",
      value: String(stats.monthReferrals),
      icon: CalendarDays,
      hint: "New referrals",
    },
    {
      key: "won" as const,
      label: "Conversion",
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      hint: "Won deals",
    },
    {
      key: "rewards" as const,
      label: "Rewards",
      value: `${stats.paidRewards} / ${stats.pendingRewards}`,
      icon: Wallet,
      hint: "Paid / pending",
    },
  ];

  const viewTitle = showReferralsView
    ? metricFilter === "month"
      ? "This month's referrals"
      : metricFilter === "won"
        ? "Won referrals"
        : metricFilter === "rewards"
          ? "Rewarded referrals"
          : "Filtered referrals"
    : "Referrers";

  const filterToggle = (
    <button
      type="button"
      onClick={() => setFiltersOpen((o) => !o)}
      aria-expanded={filtersOpen}
      aria-label="Toggle filters"
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all ${
        filtersOpen || manualFiltersActive
          ? "border-gaude-orange/50 bg-gaude-orange/15 text-gaude-orange shadow-[0_0_24px_rgba(200,245,66,0.25)]"
          : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/25 hover:text-white"
      }`}
    >
      <SlidersHorizontal className="h-4 w-4" />
      {activeFilterCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gaude-orange font-archivo text-[9px] text-white">
          {activeFilterCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card, i) => {
          const active = metricFilter === card.key;
          const Icon = card.icon;
          return (
            <motion.button
              key={card.key}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              onClick={() => toggleMetric(card.key)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                active
                  ? "border-gaude-orange/50 bg-gaude-orange/10 shadow-[0_0_32px_rgba(200,245,66,0.18)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="metric-glow"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gaude-orange/10 to-transparent"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative flex items-start justify-between gap-2">
                <div>
                  <p
                    className={`font-archivo text-[10px] uppercase tracking-[0.16em] ${
                      active ? "text-gaude-orange" : "text-white/40"
                    }`}
                  >
                    {card.label}
                  </p>
                  <p className="mt-2 font-archivo text-xl tracking-tight text-white sm:text-2xl">
                    {card.value}
                  </p>
                  <p className="mt-1 font-inter text-[11px] text-white/30">
                    {card.hint}
                  </p>
                </div>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    active
                      ? "border-gaude-orange/40 bg-gaude-orange/20 text-gaude-orange"
                      : "border-white/10 bg-white/5 text-white/40 group-hover:text-white/70"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Section header + filter icon on same line */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-archivo text-lg uppercase tracking-tight text-white">
            {viewTitle}
          </h2>
          <p className="mt-1 font-inter text-sm text-white/40">
            {showReferralsView
              ? `${filteredReferrals.length} result${filteredReferrals.length === 1 ? "" : "s"}`
              : "Click a partner to expand their referrals"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(metricFilter || manualFiltersActive) && (
            <button
              type="button"
              onClick={clearAll}
              className="hidden font-archivo text-[10px] uppercase tracking-widest text-gaude-orange transition hover:opacity-80 sm:inline"
            >
              Reset
            </button>
          )}
          {filterToggle}
        </div>
      </div>

      {/* Expandable filters */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-gaude-orange" />
                  <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-gaude-orange">
                    Refine
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setExpandedId(null);
                  }}
                  placeholder="Search name / business"
                  className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/30 focus:border-gaude-orange/50 focus:outline-none"
                />
                <select
                  value={stage}
                  onChange={(e) => {
                    setStage(e.target.value);
                    setExpandedId(null);
                  }}
                  className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-gaude-orange/50 focus:outline-none"
                >
                  <option value="" className="bg-gaude-black">
                    All stages
                  </option>
                  {Object.entries(STAGE_LABELS).map(([value, label]) => (
                    <option key={value} value={value} className="bg-gaude-black">
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={source}
                  onChange={(e) => {
                    setSource(e.target.value);
                    setExpandedId(null);
                  }}
                  className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-gaude-orange/50 focus:outline-none"
                >
                  <option value="" className="bg-gaude-black">
                    All sources
                  </option>
                  <option value="manual_submission" className="bg-gaude-black">
                    Manual
                  </option>
                  <option value="link_click" className="bg-gaude-black">
                    Link click
                  </option>
                </select>
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={!manualFiltersActive && !metricFilter}
                  className="h-10 rounded-full border border-white/10 font-archivo text-[10px] uppercase tracking-widest text-white/50 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Clear all
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {showReferralsView ? (
          <motion.div
            key="filtered-referrals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
          >
            <ReferralsTable
              referrals={filteredReferrals}
              referrerMap={referrerMap}
              showReferrer
              onOpen={(id) => router.push(`/admin/referrals/${id}`)}
              emptyLabel="No referrals match"
            />
          </motion.div>
        ) : (
          <motion.div
            key="referrers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.03]">
                    <tr>
                      <th className="px-4 py-3.5 font-archivo text-[10px] uppercase tracking-widest text-white/45">
                        Name
                      </th>
                      <th className="px-4 py-3.5 font-archivo text-[10px] uppercase tracking-widest text-white/45">
                        Tier
                      </th>
                      <th className="px-4 py-3.5 font-archivo text-[10px] uppercase tracking-widest text-white/45">
                        Referrals
                      </th>
                      <th className="px-4 py-3.5 font-archivo text-[10px] uppercase tracking-widest text-white/45">
                        Wins
                      </th>
                      <th className="px-4 py-3.5 font-archivo text-[10px] uppercase tracking-widest text-white/45">
                        Earned
                      </th>
                      <th className="px-4 py-3.5 font-archivo text-[10px] uppercase tracking-widest text-white/45">
                        Paid
                      </th>
                      <th className="w-10 px-4 py-3.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {referrers.map((r) => {
                      const open = expandedId === r.id;
                      const theirs = referralsByReferrer[r.id] || [];
                      return (
                        <ReferrerBlock
                          key={r.id}
                          referrer={r}
                          open={open}
                          referrals={theirs}
                          onToggle={() => setExpandedId(open ? null : r.id)}
                          onOpenReferral={(id) =>
                            router.push(`/admin/referrals/${id}`)
                          }
                        />
                      );
                    })}
                    {referrers.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-white/40"
                        >
                          No referrers yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReferralsTable({
  referrals,
  referrerMap,
  showReferrer,
  onOpen,
  emptyLabel,
}: {
  referrals: OverviewReferral[];
  referrerMap: Record<string, OverviewReferrer>;
  showReferrer?: boolean;
  onOpen: (id: string) => void;
  emptyLabel: string;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-white/[0.03]">
          <tr>
            <th className="px-4 py-3.5 font-archivo text-[10px] uppercase tracking-widest text-white/45">
              Lead
            </th>
            {showReferrer && (
              <th className="px-4 py-3.5 font-archivo text-[10px] uppercase tracking-widest text-white/45">
                Referrer
              </th>
            )}
            <th className="px-4 py-3.5 font-archivo text-[10px] uppercase tracking-widest text-white/45">
              Source
            </th>
            <th className="px-4 py-3.5 font-archivo text-[10px] uppercase tracking-widest text-white/45">
              Stage
            </th>
            <th className="px-4 py-3.5 font-archivo text-[10px] uppercase tracking-widest text-white/45">
              UTM
            </th>
            <th className="px-4 py-3.5 font-archivo text-[10px] uppercase tracking-widest text-white/45">
              Created
            </th>
            <th className="w-10 px-4 py-3.5" />
          </tr>
        </thead>
        <tbody>
          {referrals.map((ref) => (
            <tr
              key={ref.id}
              role="link"
              tabIndex={0}
              onClick={() => onOpen(ref.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen(ref.id);
                }
              }}
              className="cursor-pointer border-t border-white/10 transition hover:bg-gaude-orange/5"
            >
              <td className="px-4 py-3.5">
                <span className="font-medium text-white">{ref.referredName}</span>
                <div className="text-xs text-white/40">
                  {ref.referredBusiness || "—"}
                </div>
              </td>
              {showReferrer && (
                <td className="px-4 py-3.5 text-white/70">
                  {referrerMap[ref.referrerId]?.fullName || "—"}
                </td>
              )}
              <td className="px-4 py-3.5 text-white/50">
                {ref.source === "manual_submission" ? "Manual" : "Link"}
              </td>
              <td className="px-4 py-3.5 text-white/70">
                {STAGE_LABELS[ref.stage]}
              </td>
              <td className="px-4 py-3.5 text-xs text-white/40">
                {[ref.utmSource, ref.utmMedium, ref.utmCampaign]
                  .filter(Boolean)
                  .join(" / ") || "—"}
              </td>
              <td className="px-4 py-3.5 text-white/50">
                {formatDate(ref.createdAt)}
              </td>
              <td className="px-4 py-3.5 text-white/25">
                <ChevronRight className="h-4 w-4" />
              </td>
            </tr>
          ))}
          {referrals.length === 0 && (
            <tr>
              <td
                colSpan={showReferrer ? 7 : 6}
                className="px-4 py-10 text-center text-white/40"
              >
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ReferrerBlock({
  referrer,
  open,
  referrals,
  onToggle,
  onOpenReferral,
}: {
  referrer: OverviewReferrer;
  open: boolean;
  referrals: OverviewReferral[];
  onToggle: () => void;
  onOpenReferral: (id: string) => void;
}) {
  return (
    <>
      <tr
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className={`cursor-pointer border-t border-white/10 transition ${
          open ? "bg-gaude-orange/10" : "hover:bg-white/[0.04]"
        }`}
      >
        <td className="px-4 py-3.5 text-white">
          {referrer.fullName}
          <div className="text-xs text-white/40">{referrer.email}</div>
        </td>
        <td className="px-4 py-3.5 text-white/70">
          {TIER_LABELS[referrer.tier]}
        </td>
        <td className="px-4 py-3.5 text-white/70">{referrer.referralCount}</td>
        <td className="px-4 py-3.5 text-white/70">
          {referrer.successfulReferralCount}
        </td>
        <td className="px-4 py-3.5 text-white/70">
          {formatCurrencyINR(referrer.totalRewardEarned)}
        </td>
        <td className="px-4 py-3.5 text-white/70">
          {formatCurrencyINR(referrer.totalRewardPaid)}
        </td>
        <td className="px-4 py-3.5 text-white/30">
          <ChevronRight
            className={`h-4 w-4 transition-transform duration-300 ${
              open ? "rotate-90 text-gaude-orange" : ""
            }`}
          />
        </td>
      </tr>

      <tr className="border-0">
        <td colSpan={7} className="p-0">
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t border-gaude-orange/20 bg-black/40 px-4 py-5 sm:px-6">
                  <div className="mb-4">
                    <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-gaude-orange">
                      Referrals
                    </p>
                    <p className="mt-1 font-inter text-sm text-white/50">
                      {referrals.length === 0
                        ? "No referrals from this partner yet"
                        : `${referrals.length} referral${referrals.length === 1 ? "" : "s"} from ${referrer.fullName}`}
                    </p>
                  </div>

                  {referrals.length > 0 ? (
                    <ReferralsTable
                      referrals={referrals}
                      referrerMap={{}}
                      onOpen={onOpenReferral}
                      emptyLabel="No referrals yet for this partner"
                    />
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center font-inter text-sm text-white/40">
                      No referrals yet for this partner
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </td>
      </tr>
    </>
  );
}
