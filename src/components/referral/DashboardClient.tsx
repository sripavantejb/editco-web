"use client";

import Link from "next/link";
import { LinkBlock } from "@/components/referral/LinkBlock";
import { StageStepper } from "@/components/referral/StageStepper";
import { PublicPartnerToggle } from "@/components/referral/PublicPartnerToggle";
import { MotionCard, MotionItem, MotionSection } from "@/components/referral/motion";
import { CardDescription, CardTitle } from "@/components/referral/ui/card";
import { TIER_LABELS, type Stage, type Tier } from "@/lib/constants";
import { formatCurrencyINR, formatDateTime } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";

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

export function DashboardClient({
  referrer,
  referrals,
  clickTotal,
  clicksBySource,
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
  const first = referrer.fullName.split(" ")[0];
  const statCards = [
    { label: "Total referrals", value: String(stats.total), hint: "All time" },
    { label: "Converted", value: String(stats.converted), hint: "Won deals" },
    { label: "In progress", value: String(stats.inProgress), hint: "Active" },
    {
      label: "Reward earned",
      value: formatCurrencyINR(stats.earned),
      hint: "Lifetime",
    },
    {
      label: "Current tier",
      value: TIER_LABELS[referrer.tier],
      hint: "Badge",
    },
  ];

  return (
    <main className="relative min-h-[calc(100vh-4rem)] w-full">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,78,0,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-gaude-orange/25 via-[#121212] to-[#070707] p-6 sm:p-8 lg:p-10"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gaude-orange/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-gaude-purple/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-gaude-orange/40 bg-black/30 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-gaude-orange" />
                Partner dashboard
              </p>
              <h1 className="font-archivo mt-4 text-4xl uppercase leading-[0.95] tracking-tighter text-white sm:text-5xl lg:text-6xl">
                Hey, <span className="text-gaude-orange">{first}</span>
              </h1>
              <p className="mt-3 max-w-xl font-inter text-base text-white/65 sm:text-lg">
                Your live referral pipeline — share your link, add leads, and
                watch every stage move in real time.
              </p>
            </div>
            <Link
              href="/dashboard/new"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gaude-orange px-7 font-archivo text-xs uppercase tracking-[0.1em] text-white shadow-[0_0_36px_rgba(255,78,0,0.45)] transition hover:scale-[1.02] hover:bg-gaude-orange/90"
            >
              Add a Referral
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        <MotionSection className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {statCards.map((stat) => (
            <MotionCard
              key={stat.label}
              className="min-h-[120px] bg-gradient-to-b from-white/[0.05] to-transparent"
            >
              <CardDescription className="font-archivo text-[10px] uppercase tracking-[0.18em] text-white/40">
                {stat.label}
              </CardDescription>
              <p className="mt-3 font-archivo text-2xl uppercase tracking-wide text-white lg:text-3xl">
                {stat.value}
              </p>
              <p className="mt-2 font-inter text-xs text-white/35">{stat.hint}</p>
            </MotionCard>
          ))}
        </MotionSection>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <LinkBlock
              code={referrer.referralCode}
              fullName={referrer.fullName}
            />

            <MotionSection className="space-y-4">
              <MotionItem>
                <h2 className="font-archivo text-2xl uppercase tracking-tighter text-white lg:text-3xl">
                  Your pipeline
                </h2>
                <p className="mt-1 font-inter text-sm text-white/45">
                  Follow each referral from submitted to won — including notes
                  from the Editco team.
                </p>
              </MotionItem>

              {referrals.length === 0 ? (
                <MotionCard className="py-14 text-center">
                  <CardTitle>No referrals yet</CardTitle>
                  <CardDescription className="mx-auto mt-2 max-w-md font-inter normal-case tracking-normal">
                    Add someone you know, or share your link. Your first
                    referral unlocks the pipeline view.
                  </CardDescription>
                  <Link
                    href="/dashboard/new"
                    className="mt-6 inline-flex h-11 items-center rounded-full bg-gaude-orange px-6 font-archivo text-xs uppercase tracking-[0.08em] text-white hover:bg-gaude-orange/90"
                  >
                    Add your first referral
                  </Link>
                </MotionCard>
              ) : (
                <div className="space-y-4">
                  {referrals.map((r) => (
                    <MotionCard
                      key={r.id}
                      className="space-y-5 bg-gradient-to-br from-white/[0.04] to-transparent"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <CardTitle className="text-lg normal-case tracking-normal">
                            {r.referredName}
                          </CardTitle>
                          <CardDescription className="mt-1 font-inter normal-case tracking-normal">
                            {r.referredBusiness || "No business listed"} ·{" "}
                            {r.source === "manual_submission"
                              ? "You submitted"
                              : "Via your link"}{" "}
                            · Updated {formatDateTime(r.updatedAt)}
                          </CardDescription>
                        </div>
                        {r.stage === "won" && (
                          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                            {formatCurrencyINR(r.rewardAmount || 0)} ·{" "}
                            {r.rewardStatus === "paid" ? "Paid" : "Pending"}
                          </div>
                        )}
                      </div>
                      <StageStepper
                        stage={r.stage}
                        lostReason={r.lostReason}
                        latestNote={r.latestNote}
                        latestNoteAt={r.latestNoteAt}
                      />
                    </MotionCard>
                  ))}
                </div>
              )}
            </MotionSection>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <PublicPartnerToggle
              isPublic={referrer.isPublicPartner}
              isElite={referrer.tier === "elite_partner"}
            />

            <MotionSection className="space-y-4">
              <MotionItem>
                <h2 className="font-archivo text-xl uppercase tracking-tighter text-white">
                  Link performance
                </h2>
              </MotionItem>
              <MotionCard className="bg-gradient-to-b from-gaude-orange/10 to-transparent">
                <p className="font-inter text-sm text-white/50">Total clicks</p>
                <p className="mt-2 font-archivo text-4xl text-white">
                  {clickTotal}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {Object.keys(clicksBySource).length === 0 ? (
                    <p className="font-inter text-sm text-white/40">
                      No link clicks yet. Share your referral link to start
                      tracking.
                    </p>
                  ) : (
                    Object.entries(clicksBySource).map(([source, count]) => (
                      <span
                        key={source}
                        className="rounded-full border border-white/10 bg-black/30 px-3 py-1 font-archivo text-[10px] uppercase tracking-wide text-white/70"
                      >
                        {source}: {count}
                      </span>
                    ))
                  )}
                </div>
              </MotionCard>
            </MotionSection>
          </aside>
        </div>
      </div>
    </main>
  );
}
