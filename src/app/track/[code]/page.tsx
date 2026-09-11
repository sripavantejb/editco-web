export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  CircleDot,
  FileText,
  LogOut,
  Receipt,
  Sparkles,
} from "lucide-react";
import { EDITCO_LOGO_URL } from "@/components/os/portal/ui";
import {
  TrackBar,
  TrackCard,
  TrackEmpty,
  TrackPill,
  TrackRing,
  TrackSectionTitle,
  TrackStat,
} from "@/components/track/TrackUI";
import { TrackStepper } from "@/components/track/TrackStepper";
import { signOutTracking } from "@/actions/os/track";
import {
  TRACK_STAGE_LABELS,
  deriveStage,
  normalizeTrackingCode,
  requireTrackSession,
} from "@/lib/os/tracking";
import { Conversion } from "@/models/os/Conversion";
import { Vendor } from "@/models/os/Vendor";
import { Project } from "@/models/os/Project";
import { Milestone } from "@/models/os/Milestone";
import { OsTask } from "@/models/os/Task";
import { Invoice } from "@/models/os/Invoice";
import { Payment } from "@/models/os/Payment";
import { Meeting } from "@/models/os/Meeting";
import { OsDocument } from "@/models/os/Document";
import { ProjectUpdate } from "@/models/os/ProjectUpdate";
import {
  INVOICE_STATUS_LABELS,
  MILESTONE_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  normalizeProjectStatus,
  type MilestoneStatus,
} from "@/lib/os/constants";
import { displayInvoiceStatus, outstandingOf } from "@/lib/os/money";
import { formatCurrencyINR, formatDate, formatDateTime } from "@/lib/utils";
import "@/models/os/register";

export const metadata: Metadata = {
  title: "Your project · Editco Media",
  robots: { index: false, follow: false },
};

function invoicePillTone(status: string) {
  if (status === "paid") return "good" as const;
  if (status === "overdue") return "bad" as const;
  if (status === "partially_paid") return "warn" as const;
  return "neutral" as const;
}

function milestonePillTone(status: MilestoneStatus) {
  if (status === "completed") return "good" as const;
  if (status === "in_progress") return "accent" as const;
  return "neutral" as const;
}

export default async function TrackDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = normalizeTrackingCode(rawCode);
  const session = await requireTrackSession(code);
  if (!session) redirect(`/track?code=${encodeURIComponent(code)}`);

  const uuid = session.conversionUuid;
  const conversion = await Conversion.findOne({ conversionUuid: uuid })
    .select("publicCode convertedAt services expectedStart conversionValue")
    .lean();
  if (!conversion) redirect("/track");

  const [vendor, projects, invoices, payments, meetings, documents] =
    await Promise.all([
      Vendor.findOne({ conversionUuid: uuid }).select("companyName contactPerson").lean(),
      Project.find({ conversionUuid: uuid, recordStatus: "active" })
        .sort({ createdAt: 1 })
        .select("name service status progress startDate expectedDelivery actualCompletion")
        .lean(),
      Invoice.find({
        conversionUuid: uuid,
        recordStatus: "active",
        status: { $nin: ["draft", "cancelled"] },
      })
        .sort({ issueDate: -1 })
        .select("invoiceNumber total amountPaid status issueDate dueDate")
        .lean(),
      Payment.find({ conversionUuid: uuid, recordStatus: "active" })
        .sort({ paidAt: -1 })
        .limit(12)
        .select("amount method reference paidAt")
        .lean(),
      Meeting.find({
        conversionUuid: uuid,
        recordStatus: "active",
        visibleToClient: true,
        startsAt: { $gte: new Date() },
      })
        .sort({ startsAt: 1 })
        .limit(6)
        .select("title startsAt location")
        .lean(),
      OsDocument.find({
        conversionUuid: uuid,
        recordStatus: "active",
        visibleToClient: true,
      })
        .sort({ createdAt: -1 })
        .limit(12)
        .select("title createdAt")
        .lean(),
    ]);

  const projectIds = projects.map((p) => p._id);
  const [milestones, tasks, updates] = await Promise.all([
    Milestone.find({
      projectId: { $in: projectIds },
      recordStatus: "active",
      visibleToClient: true,
    })
      .sort({ sortOrder: 1, createdAt: 1 })
      .select("projectId name status dueDate completedAt")
      .lean(),
    OsTask.find({ projectId: { $in: projectIds }, recordStatus: "active" })
      .select("projectId status")
      .lean(),
    ProjectUpdate.find({
      conversionUuid: uuid,
      recordStatus: "active",
      visibility: "client_visible",
      publishedAt: { $ne: null },
    })
      .sort({ publishedAt: -1 })
      .limit(10)
      .select("title body publishedAt projectId")
      .lean(),
  ]);

  /* ---- progress ------------------------------------------------------- */
  const milestonesByProject = new Map<string, typeof milestones>();
  for (const m of milestones) {
    const key = String(m.projectId);
    const list = milestonesByProject.get(key) || [];
    list.push(m);
    milestonesByProject.set(key, list);
  }

  /** Staff-set progress wins; otherwise infer from milestones, then tasks. */
  function projectProgress(p: (typeof projects)[number]) {
    const status = normalizeProjectStatus(p.status);
    if (status === "completed") return 100;
    if (typeof p.progress === "number" && p.progress > 0) {
      return Math.min(100, p.progress);
    }
    const ms = milestonesByProject.get(String(p._id)) || [];
    if (ms.length) {
      const done = ms.filter((m) => m.status === "completed").length;
      return Math.round((done / ms.length) * 100);
    }
    const ts = tasks.filter((t) => String(t.projectId) === String(p._id));
    if (ts.length) {
      const done = ts.filter((t) => t.status === "completed").length;
      return Math.round((done / ts.length) * 100);
    }
    return 0;
  }

  const live = projects.filter((p) => normalizeProjectStatus(p.status) !== "cancelled");
  const overall = live.length
    ? Math.round(live.reduce((s, p) => s + projectProgress(p), 0) / live.length)
    : 0;
  const stage = deriveStage(
    projects.map((p) => p.status),
    projects.length > 0
  );

  /* ---- money ---------------------------------------------------------- */
  const invoiced = invoices.reduce((s, i) => s + (i.total || 0), 0);
  const received = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const outstanding = outstandingOf(invoiced, received);

  const nextDelivery = live
    .map((p) => p.expectedDelivery)
    .filter(Boolean)
    .map((d) => new Date(d as Date))
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const clientName = vendor?.companyName || "Your project";

  return (
    <div className="dashboard-theme relative min-h-screen bg-[var(--dash-bg)]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(200,245,66,0.12), transparent 58%)",
        }}
      />

      <header className="sticky top-0 z-40 border-b border-[var(--dash-border)] bg-[color-mix(in_srgb,var(--dash-bg)_80%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3">
          <a
            href="https://editcomedia.com"
            target="_blank"
            rel="noreferrer"
            className="shrink-0"
            aria-label="Editco Media"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={EDITCO_LOGO_URL}
              alt="Editco Media"
              width={100}
              height={26}
              style={{ height: "26px", width: "auto", maxHeight: "26px" }}
              className="h-[26px] w-auto object-contain object-left"
            />
          </a>
          <div className="min-w-0 flex-1">
            <p className="font-archivo text-[10px] uppercase tracking-[0.18em] text-[var(--dash-accent)]">
              Project tracking
            </p>
            <p className="truncate font-inter text-sm font-medium text-[var(--dash-text)]">
              {clientName}
            </p>
          </div>
          <form action={signOutTracking}>
            <input type="hidden" name="code" value={code} />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--dash-border)] px-2.5 py-1.5 font-inter text-xs text-[var(--dash-muted)] transition-colors hover:text-[var(--dash-text)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl space-y-4 px-5 py-6 sm:space-y-5 sm:py-9">
        {/* Hero */}
        <TrackCard className="sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <TrackPill tone="accent">
                <CircleDot className="mr-1.5 h-3 w-3" />
                {TRACK_STAGE_LABELS[stage]}
              </TrackPill>
              <h1 className="mt-3 font-archivo text-[30px] leading-[1.1] tracking-[-0.02em] text-[var(--dash-text)] sm:text-[38px]">
                {clientName}
              </h1>
              <p className="mt-2 font-mono text-[13px] uppercase tracking-[0.14em] text-[var(--dash-muted)]">
                {conversion.publicCode}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-inter text-[13px] text-[var(--dash-muted)]">
                <span>
                  Started{" "}
                  <span className="text-[var(--dash-text)]">
                    {formatDate(conversion.convertedAt)}
                  </span>
                </span>
                {nextDelivery ? (
                  <span>
                    Next delivery{" "}
                    <span className="text-[var(--dash-text)]">
                      {formatDate(nextDelivery)}
                    </span>
                  </span>
                ) : null}
                <span>
                  Projects <span className="text-[var(--dash-text)]">{live.length}</span>
                </span>
              </div>
            </div>
            <TrackRing pct={overall} label="Complete" />
          </div>
        </TrackCard>

        <TrackStepper stage={stage} />

        {/* Projects */}
        <TrackCard>
          <TrackSectionTitle
            title="Your projects"
            hint={live.length ? `${overall}% overall` : undefined}
          />
          {projects.length === 0 ? (
            <TrackEmpty>
              Your project file is open. We&apos;ll add deliverables here as soon as
              kickoff is scheduled.
            </TrackEmpty>
          ) : (
            <ul className="space-y-3">
              {projects.map((p) => {
                const status = normalizeProjectStatus(p.status);
                const pct = projectProgress(p);
                const ms = milestonesByProject.get(String(p._id)) || [];
                return (
                  <li
                    key={String(p._id)}
                    className="rounded-2xl border border-[var(--dash-border)] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                      <div className="min-w-0">
                        <p className="font-inter text-[15px] font-semibold text-[var(--dash-text)]">
                          {p.name}
                        </p>
                        {p.service ? (
                          <p className="mt-0.5 font-inter text-xs text-[var(--dash-faint)]">
                            {p.service}
                          </p>
                        ) : null}
                      </div>
                      <TrackPill
                        tone={
                          status === "completed"
                            ? "good"
                            : status === "blocked"
                              ? "bad"
                              : status === "waiting_for_client"
                                ? "warn"
                                : "neutral"
                        }
                      >
                        {PROJECT_STATUS_LABELS[status]}
                      </TrackPill>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <TrackBar pct={pct} />
                      <span className="shrink-0 font-archivo text-xs text-[var(--dash-muted)]">
                        {pct}%
                      </span>
                    </div>

                    {p.expectedDelivery || p.actualCompletion ? (
                      <p className="mt-2.5 font-inter text-xs text-[var(--dash-faint)]">
                        {status === "completed" && p.actualCompletion
                          ? `Delivered ${formatDate(p.actualCompletion)}`
                          : p.expectedDelivery
                            ? `Expected ${formatDate(p.expectedDelivery)}`
                            : ""}
                      </p>
                    ) : null}

                    {ms.length ? (
                      <ul className="mt-3.5 space-y-2 border-t border-[var(--dash-border)] pt-3.5">
                        {ms.map((m) => (
                          <li
                            key={String(m._id)}
                            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"
                          >
                            <span className="min-w-0 flex-1 truncate font-inter text-[13px] text-[var(--dash-muted)]">
                              {m.name}
                            </span>
                            <TrackPill tone={milestonePillTone(m.status as MilestoneStatus)}>
                              {MILESTONE_STATUS_LABELS[m.status as MilestoneStatus]}
                            </TrackPill>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </TrackCard>

        {/* Updates */}
        {updates.length ? (
          <TrackCard>
            <TrackSectionTitle title="Latest updates" />
            <ol className="space-y-4">
              {updates.map((u) => (
                <li key={String(u._id)} className="relative pl-6">
                  <span className="absolute left-0 top-1.5 grid h-3 w-3 place-items-center rounded-full border border-[var(--dash-accent)] bg-[rgba(200,245,66,0.16)]">
                    <Sparkles className="h-1.5 w-1.5 text-[var(--dash-accent)]" />
                  </span>
                  <p className="font-inter text-sm font-semibold text-[var(--dash-text)]">
                    {u.title}
                  </p>
                  {u.body ? (
                    <p className="mt-1 font-inter text-[13px] leading-relaxed text-[var(--dash-muted)]">
                      {u.body}
                    </p>
                  ) : null}
                  <p className="mt-1 font-inter text-[11px] text-[var(--dash-faint)]">
                    {formatDate(u.publishedAt)}
                  </p>
                </li>
              ))}
            </ol>
          </TrackCard>
        ) : null}

        {/* Money */}
        <TrackCard>
          <TrackSectionTitle title="Payments" />
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <TrackStat label="Invoiced" value={formatCurrencyINR(invoiced)} />
            <TrackStat label="Paid" value={formatCurrencyINR(received)} tone="accent" />
            <TrackStat
              label="Outstanding"
              value={formatCurrencyINR(outstanding)}
              tone={outstanding > 0 ? "warn" : undefined}
            />
          </div>

          {invoices.length === 0 ? (
            <TrackEmpty>No invoices raised yet.</TrackEmpty>
          ) : (
            <ul className="space-y-2.5">
              {invoices.map((i) => {
                const st = displayInvoiceStatus({
                  status: i.status,
                  dueDate: i.dueDate,
                  amountPaid: i.amountPaid || 0,
                  total: i.total || 0,
                });
                return (
                  <li
                    key={String(i._id)}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-xl border border-[var(--dash-border)] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-inter text-sm text-[var(--dash-text)]">
                        <Receipt className="h-3.5 w-3.5 shrink-0 text-[var(--dash-faint)]" />
                        {i.invoiceNumber}
                      </p>
                      <p className="mt-0.5 font-inter text-xs text-[var(--dash-faint)]">
                        Issued {formatDate(i.issueDate)}
                        {i.dueDate ? ` · Due ${formatDate(i.dueDate)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-archivo text-sm text-[var(--dash-text)]">
                        {formatCurrencyINR(i.total)}
                      </span>
                      <TrackPill tone={invoicePillTone(st)}>
                        {INVOICE_STATUS_LABELS[st]}
                      </TrackPill>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {payments.length ? (
            <div className="mt-5 border-t border-[var(--dash-border)] pt-4">
              <p className="mb-2.5 font-inter text-[11px] uppercase tracking-[0.14em] text-[var(--dash-faint)]">
                Payments received
              </p>
              <ul className="space-y-1.5">
                {payments.map((p) => (
                  <li
                    key={String(p._id)}
                    className="flex flex-wrap items-center justify-between gap-x-3 font-inter text-[13px]"
                  >
                    <span className="text-[var(--dash-muted)]">
                      {formatDate(p.paidAt)}
                      {p.method ? ` · ${p.method}` : ""}
                    </span>
                    <span className="text-[var(--dash-accent)]">
                      {formatCurrencyINR(p.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </TrackCard>

        {/* Meetings + documents */}
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
          <TrackCard>
            <TrackSectionTitle title="Upcoming meetings" />
            {meetings.length === 0 ? (
              <TrackEmpty>Nothing scheduled right now.</TrackEmpty>
            ) : (
              <ul className="space-y-2.5">
                {meetings.map((m) => (
                  <li key={String(m._id)} className="flex items-start gap-2.5">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[var(--dash-faint)]" />
                    <div className="min-w-0">
                      <p className="font-inter text-sm text-[var(--dash-text)]">{m.title}</p>
                      <p className="font-inter text-xs text-[var(--dash-faint)]">
                        {formatDateTime(m.startsAt)}
                        {m.location ? ` · ${m.location}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TrackCard>

          <TrackCard>
            <TrackSectionTitle title="Shared documents" />
            {documents.length === 0 ? (
              <TrackEmpty>No documents shared yet.</TrackEmpty>
            ) : (
              <ul className="space-y-2.5">
                {documents.map((d) => (
                  <li key={String(d._id)} className="flex items-start gap-2.5">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--dash-faint)]" />
                    <div className="min-w-0">
                      <p className="font-inter text-sm text-[var(--dash-text)]">{d.title}</p>
                      <p className="font-inter text-xs text-[var(--dash-faint)]">
                        {formatDate(d.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TrackCard>
        </div>

        <p className="pb-4 pt-2 text-center font-inter text-xs text-[var(--dash-faint)]">
          Questions about your project? Reply to any Editco email and your point of
          contact will pick it up.
        </p>
      </main>
    </div>
  );
}
