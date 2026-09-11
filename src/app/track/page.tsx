import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Clock,
  FileCheck2,
  Lock,
  PackageSearch,
  Receipt,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { TrackLoginForm } from "@/components/track/TrackLoginForm";
import { EDITCO_LOGO_URL } from "@/components/os/portal/ui";
import { getTrackSession, normalizeTrackingCode } from "@/lib/os/tracking";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track your project · Editco Media",
  description:
    "Enter your Editco tracking code to follow your project from kickoff to final delivery.",
  robots: { index: false, follow: false },
};

const FEATURE_POINTS = [
  {
    icon: Clock,
    title: "Live Timeline",
    desc: "Real-time updates on active stages, script reviews, and delivery dates.",
  },
  {
    icon: FileCheck2,
    title: "Deliverables & Review",
    desc: "Inspect latest drafts, feedback notes, and production assets.",
  },
  {
    icon: Receipt,
    title: "Invoices & Milestones",
    desc: "Transparent financial summary with instant payment status tracking.",
  },
];

export default async function TrackEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const sp = await searchParams;
  const session = await getTrackSession();
  // Already unlocked on this device — skip straight to the timeline.
  if (session && !sp.code) redirect(`/track/${session.code}`);

  return (
    <div className="dashboard-theme relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-[#080808] text-[#f5f5f5]">
      {/* Ambient background glows & subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 65% 45% at 50% -10%, rgba(200,245,66,0.14), transparent 65%),
            radial-gradient(ellipse 50% 40% at 85% 85%, rgba(200,245,66,0.06), transparent 60%),
            radial-gradient(ellipse 45% 35% at 15% 90%, rgba(200,245,66,0.04), transparent 55%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.035]"
      />

      {/* Header */}
      <header className="relative z-10 w-full border-b border-white/10 bg-[#080808]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a
            href="https://editcomedia.com"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 transition-opacity hover:opacity-90"
            aria-label="Editco Media"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={EDITCO_LOGO_URL}
              alt="Editco Media"
              width={100}
              height={26}
              style={{ height: "26px", width: "auto", maxHeight: "26px" }}
              className="h-[26px] w-auto object-contain"
            />
          </a>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,245,66,0.25)] bg-[rgba(200,245,66,0.08)] px-3 py-1 font-inter text-[11px] font-medium text-[var(--dash-accent)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--dash-accent)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--dash-accent)]" />
              </span>
              <span>Client Portal</span>
            </div>

            <a
              href="https://editcomedia.com"
              target="_blank"
              rel="noreferrer"
              className="group hidden items-center gap-1 font-inter text-[13px] text-white/60 transition-colors hover:text-white sm:inline-flex"
            >
              <span>Main site</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-10 sm:py-16">
        <div className="w-full max-w-[480px]">
          {/* Badge & Title */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[var(--dash-accent)]" />
              <span className="font-archivo text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                Live Project Tracker
              </span>
            </div>

            <h1 className="mt-4 font-archivo text-[32px] font-bold leading-[1.08] tracking-[-0.03em] text-white sm:text-[40px]">
              Track your project
            </h1>
            <p className="mt-2.5 font-inter text-[14px] leading-relaxed text-white/65 sm:text-[15px]">
              Every stage, deliverable and payment milestone in one place — from kickoff to final handover.
            </p>
          </div>

          {/* Form Card */}
          <div className="relative mt-8 overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-7">
            {/* Top subtle highlight */}
            <div className="pointer-events-none absolute -left-1/2 top-0 h-[1px] w-[200%] bg-gradient-to-r from-transparent via-[var(--dash-accent)]/30 to-transparent" />

            <TrackLoginForm defaultCode={sp.code ? normalizeTrackingCode(sp.code) : ""} />
          </div>

          {/* Security & Access Notice */}
          <div className="mt-5 flex items-center justify-center gap-2 text-center font-inter text-[12px] text-white/40">
            <Lock className="h-3.5 w-3.5 shrink-0 text-[var(--dash-accent)]/80" />
            <span>Encrypted 7-day session token saved securely on this device.</span>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FEATURE_POINTS.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="group rounded-2xl border border-white/8 bg-white/[0.025] p-3.5 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[var(--dash-accent)] transition-transform group-hover:scale-105">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="mt-2.5 font-archivo text-[12px] font-bold uppercase tracking-[0.08em] text-white/90">
                    {feat.title}
                  </h2>
                  <p className="mt-1 font-inter text-[11px] leading-relaxed text-white/50">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/8 py-4 text-center">
        <p className="font-inter text-[12px] text-white/40">
          Need assistance or misplaced your code?{" "}
          <a
            href="mailto:hello@editcomedia.com"
            className="text-[var(--dash-accent)] underline-offset-4 transition-colors hover:underline"
          >
            Contact your Editco POC
          </a>
        </p>
      </footer>
    </div>
  );
}
