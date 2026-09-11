import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { TrackLoginForm } from "@/components/track/TrackLoginForm";
import { EDITCO_LOGO_URL } from "@/components/os/portal/ui";
import { getTrackSession, normalizeTrackingCode } from "@/lib/os/tracking";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track your project · Editco Media",
  description:
    "Enter your Editco tracking code to follow your project from kickoff to delivery.",
  robots: { index: false, follow: false },
};

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
    /* h-dvh + overflow-hidden: this screen is one viewport, never a scroll. */
    <div className="dashboard-theme relative flex h-dvh flex-col overflow-hidden bg-[var(--dash-bg)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(200,245,66,0.14), transparent 60%), radial-gradient(ellipse 50% 40% at 10% 100%, rgba(200,245,66,0.06), transparent 55%)",
        }}
      />

      <header className="relative z-10 shrink-0 border-b border-[var(--dash-border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <a
            href="https://editcomedia.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center"
            aria-label="Editco Media"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={EDITCO_LOGO_URL}
              alt="Editco Media"
              className="h-6 w-auto max-w-[100px] object-contain object-left"
            />
          </a>

          <div className="flex items-center gap-5">
            <span className="hidden font-inter text-[12px] text-[var(--dash-muted)] sm:inline">
              Client tracking
            </span>
            <a
              href="https://editcomedia.com"
              target="_blank"
              rel="noreferrer"
              className="font-inter text-[12px] text-[var(--dash-muted)] transition-colors hover:text-[var(--dash-text)]"
            >
              Back to site →
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-5 py-6">
        <div className="w-full max-w-[400px]">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
            <PackageSearch className="h-4 w-4 text-[var(--dash-accent)]" strokeWidth={1.75} />
          </div>

          <h1 className="font-archivo text-[26px] leading-[1.1] tracking-[-0.02em] text-[var(--dash-text)] sm:text-[30px]">
            Track your project
          </h1>
          <p className="mt-2 font-inter text-[14px] leading-relaxed text-[var(--dash-muted)]">
            Enter your tracking code to see every stage, deliverable and payment.
          </p>

          <div className="mt-5 rounded-[20px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 backdrop-blur-md">
            <TrackLoginForm defaultCode={sp.code ? normalizeTrackingCode(sp.code) : ""} />
          </div>

          <p className="mt-4 font-inter text-[11px] leading-relaxed text-[var(--dash-faint)]">
            Lost your code? It&apos;s in your kickoff email, or ask your Editco point
            of contact — they can resend it any time.
          </p>
        </div>
      </main>
    </div>
  );
}
