"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShareReferralModal } from "@/components/referral/ShareReferralModal";
import { StageStepper } from "@/components/referral/StageStepper";
import { PublicPartnerToggle } from "@/components/referral/PublicPartnerToggle";
import {
  STAGE_LABELS,
  TIER_LABELS,
  type Stage,
  type Tier,
} from "@/lib/constants";
import { cn, formatCurrencyINR, formatDateTime } from "@/lib/utils";
import { ChevronDown, Plus, Share2 } from "lucide-react";

export type DashboardReferral = {
  id: string;
  referredName: string;
  referredBusiness?: string | null;
  source: string;
  stage: Stage;
  lostReason?: string | null;
  rewardAmount?: number | null;
  rewardStatus?: string | null;
  updatedAt: string;
  latestNote?: string | null;
  latestNoteAt?: string | null;
};

function stageTone(stage: Stage) {
  if (stage === "won")
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
  if (stage === "lost")
    return "border-red-500/30 bg-red-500/10 text-red-400";
  return "border-[var(--dash-border)] bg-[var(--dash-hover)] text-[var(--dash-muted)]";
}

export function DashboardClient({
  referrer,
  referrals,
  clickTotal,
  clicksBySource: _clicksBySource,
  stats,
}: {
  referrer: {
    fullName: string;
    referralCode: string;
    tier: Tier;
    isPublicPartner: boolean;
  };
  referrals: DashboardReferral[];
  clickTotal: number;
  clicksBySource: Record<string, number>;
  stats: {
    total: number;
    converted: number;
    inProgress: number;
    earned: number;
  };
}) {
  void _clicksBySource;
  const first = referrer.fullName.split(" ")[0];
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const statCards = [
    { label: "Referrals", value: String(stats.total) },
    { label: "Converted", value: String(stats.converted) },
    { label: "Clicks", value: String(clickTotal) },
    { label: "Earned", value: formatCurrencyINR(stats.earned) },
    { label: "Tier", value: TIER_LABELS[referrer.tier] },
  ];

  function toggleReferral(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-8 px-4 py-7 sm:px-6 lg:px-10 lg:py-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-archivo text-3xl tracking-tight text-[var(--dash-text)] sm:text-4xl">
          Hi, {first}
        </h1>
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="inline-flex h-11 items-center gap-2.5 rounded-full bg-[var(--dash-accent)] px-5 font-archivo text-[10px] font-bold uppercase tracking-widest text-[var(--dash-on-accent)] shadow-[0_0_0_1px_rgba(200,245,66,0.35),0_8px_28px_var(--dash-accent-glow)] transition hover:bg-[var(--dash-accent-hover)] hover:shadow-[0_0_0_1px_rgba(200,245,66,0.5),0_10px_32px_var(--dash-accent-glow)]"
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={2.5} />
          Share link
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[20px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-4"
          >
            <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-faint)]">
              {stat.label}
            </p>
            <p className="mt-2 font-archivo text-xl tracking-tight text-[var(--dash-text)] sm:text-2xl">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <PublicPartnerToggle
        isPublic={referrer.isPublicPartner}
        isElite={referrer.tier === "elite_partner"}
      />

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-archivo text-lg uppercase tracking-tight text-[var(--dash-text)]">
              Your referrals
            </h2>
            <p className="mt-1 font-inter text-sm text-[var(--dash-muted)]">
              Select a lead to view its pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-archivo text-[10px] uppercase tracking-widest text-[var(--dash-faint)]">
              {referrals.length} lead{referrals.length === 1 ? "" : "s"}
            </span>
            <Link
              href="/dashboard/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3.5 font-archivo text-[10px] uppercase tracking-widest text-[var(--dash-muted)] transition hover:border-[var(--dash-accent)]/40 hover:text-[var(--dash-text)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Link>
          </div>
        </div>

        {referrals.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[var(--dash-border)] bg-[var(--dash-surface)] px-6 py-14 text-center">
            <p className="font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
              No referrals yet
            </p>
            <p className="mx-auto mt-2 max-w-md font-inter text-sm text-[var(--dash-muted)]">
              Share your link or add someone you know to start your pipeline.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="dash-cta inline-flex h-10 items-center gap-2 rounded-full px-5 font-archivo text-[10px] uppercase tracking-widest transition"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share link
              </button>
              <Link
                href="/dashboard/new"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--dash-border)] px-5 font-archivo text-[10px] uppercase tracking-widest text-[var(--dash-muted)] transition hover:text-[var(--dash-text)]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add referral
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[24px] border border-[var(--dash-border)] bg-[var(--dash-surface)]">
            {referrals.map((r, index) => {
              const open = selectedId === r.id;
              return (
                <div
                  key={r.id}
                  className={cn(
                    index > 0 && "border-t border-[var(--dash-border)]"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleReferral(r.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-4 text-left transition sm:px-5 sm:py-5",
                      open
                        ? "bg-[var(--dash-accent-soft)]"
                        : "hover:bg-[var(--dash-hover)]"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-archivo text-base text-[var(--dash-text)]">
                          {r.referredName}
                        </p>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 font-archivo text-[9px] uppercase tracking-widest",
                            stageTone(r.stage)
                          )}
                        >
                          {STAGE_LABELS[r.stage]}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-inter text-sm text-[var(--dash-muted)]">
                        {r.referredBusiness || "No business listed"} ·{" "}
                        {r.source === "manual_submission"
                          ? "You submitted"
                          : "Via your link"}{" "}
                        · {formatDateTime(r.updatedAt)}
                      </p>
                    </div>

                    {r.stage === "won" && (
                      <div className="hidden shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-500 sm:block">
                        {formatCurrencyINR(r.rewardAmount || 0)} ·{" "}
                        {r.rewardStatus === "paid" ? "Paid" : "Pending"}
                      </div>
                    )}

                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-[var(--dash-faint)] transition-transform duration-300",
                        open && "rotate-180 text-[var(--dash-accent)]"
                      )}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        key={`${r.id}-pipeline`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[var(--dash-border)] bg-[var(--dash-bg)]/40 px-4 py-5 sm:px-5">
                          <p className="mb-4 font-archivo text-[10px] uppercase tracking-[0.18em] text-[var(--dash-faint)]">
                            Pipeline
                          </p>
                          <StageStepper
                            stage={r.stage}
                            lostReason={r.lostReason}
                            latestNote={r.latestNote}
                            latestNoteAt={r.latestNoteAt}
                          />
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ShareReferralModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        code={referrer.referralCode}
        fullName={referrer.fullName}
      />
    </main>
  );
}
