export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  FileText,
  FolderKanban,
  Receipt,
  Sparkles,
  Wallet,
} from "lucide-react";
import { requireOsPage } from "@/lib/os/page";
import { Conversion } from "@/models/os/Conversion";
import { Lead } from "@/models/os/Lead";
import { Vendor } from "@/models/os/Vendor";
import { Project } from "@/models/os/Project";
import { Invoice } from "@/models/os/Invoice";
import { Payment } from "@/models/os/Payment";
import { Meeting } from "@/models/os/Meeting";
import { OsDocument } from "@/models/os/Document";
import { ActivityEvent } from "@/models/os/ActivityEvent";
import { PortalAccess } from "@/models/os/PortalAccess";
import { Referral } from "@/models/Referral";
import { conversionRollup } from "@/lib/os/rollups";
import { displayInvoiceStatus } from "@/lib/os/money";
import { formatCurrencyINR, formatDate, formatDateTime } from "@/lib/utils";
import {
  INVOICE_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  normalizeProjectStatus,
} from "@/lib/os/constants";
import { GeneratePortalForm } from "@/components/os/OsForms";
import { CopyPortalUrl } from "@/components/os/CopyPortalUrl";
import { TrackingTicket } from "@/components/os/TrackingCodeCard";
import { revokeClientPortal } from "@/actions/os/portal";
import { clientPortalPath } from "@/lib/os/resolve-portal";
import { canAccessLegacyAdmin, hasPermission } from "@/lib/os/permissions";
import { STAGE_LABELS, type Stage } from "@/lib/constants";
import { headers } from "next/headers";

function appOrigin(host: string | null, proto: string | null) {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (host) return `${proto === "https" ? "https" : "http"}://${host}`;
  return "http://localhost:3000";
}

/* ------------------------------------------------------------------ */
/* Local presentational pieces                                         */
/* ------------------------------------------------------------------ */

function Card({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-inter text-[14px] font-semibold tracking-[-0.01em] text-[#111111]">
          <Icon className="h-4 w-4 text-[#9ca3af]" strokeWidth={1.75} />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-[#e5e7eb] px-4 py-5 text-center font-inter text-[13px] text-[#9ca3af]">
      {children}
    </p>
  );
}

const PILLS = {
  neutral: "border-[#e5e7eb] bg-[#f8f9fa] text-[#6b7280]",
  good: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
  bad: "border-rose-200 bg-rose-50 text-rose-700",
} as const;

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: keyof typeof PILLS;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 font-inter text-[11px] font-medium ${PILLS[tone]}`}
    >
      {children}
    </span>
  );
}

function invoiceTonePill(status: string) {
  if (status === "paid") return "good" as const;
  if (status === "overdue") return "bad" as const;
  if (status === "partially_paid") return "warn" as const;
  return "neutral" as const;
}

function projectTonePill(status: string) {
  if (status === "completed") return "good" as const;
  if (status === "blocked") return "bad" as const;
  if (status === "waiting_for_client") return "warn" as const;
  return "neutral" as const;
}

/* ------------------------------------------------------------------ */

export default async function ConversionHubPage({
  params,
}: {
  params: Promise<{ publicCode: string }>;
}) {
  const staff = await requireOsPage("search:read");
  const { publicCode } = await params;
  const conversion = await Conversion.findOne({
    publicCode: publicCode.toUpperCase(),
  }).lean();
  if (!conversion) notFound();
  const uuid = conversion.conversionUuid;

  const canViewLegacy = canAccessLegacyAdmin(staff.role);
  const h = await headers();
  const origin = appOrigin(h.get("host"), h.get("x-forwarded-proto"));

  const [vendor, projects, invoices, payments, meetings, documents, activity, portal] =
    await Promise.all([
      Vendor.findOne({ conversionUuid: uuid }).lean(),
      Project.find({ conversionUuid: uuid, recordStatus: "active" }).lean(),
      Invoice.find({ conversionUuid: uuid, recordStatus: "active" })
        .sort({ createdAt: -1 })
        .lean(),
      Payment.find({ conversionUuid: uuid, recordStatus: "active" })
        .sort({ paidAt: -1 })
        .lean(),
      Meeting.find({ conversionUuid: uuid, recordStatus: "active" })
        .sort({ startsAt: -1 })
        .lean(),
      OsDocument.find({ conversionUuid: uuid, recordStatus: "active" })
        .sort({ createdAt: -1 })
        .lean(),
      ActivityEvent.find({ conversionUuid: uuid })
        .sort({ createdAt: -1 })
        .limit(40)
        .lean(),
      PortalAccess.findOne({ conversionUuid: uuid }).lean(),
    ]);

  const [lead, referral] = await Promise.all([
    conversion.leadId ? Lead.findById(conversion.leadId).lean() : Promise.resolve(null),
    conversion.referralId && canViewLegacy
      ? Referral.findById(conversion.referralId).lean()
      : Promise.resolve(null),
  ]);
  const rollup = await conversionRollup(uuid);
  const canPortal = hasPermission(staff.permissions, "vendors:write");
  const originLabel =
    conversion.origin === "direct_client" ? "Direct client" : "Lead conversion";

  const collectedPct =
    rollup.invoiced > 0
      ? Math.min(100, Math.round((rollup.received / rollup.invoiced) * 100))
      : 0;
  const activeProjects = projects.filter(
    (p) => normalizeProjectStatus(p.status) !== "completed"
  ).length;

  return (
    <main id="main" className="px-4 py-8 sm:px-8">
      <div className="mb-5">
        <Link
          href="/admin/os/conversions"
          className="font-inter text-[13px] text-[#6b7280] transition-colors hover:text-[#111111]"
        >
          ← Back to conversions
        </Link>
      </div>

      {/* ---------------- Hero ---------------- */}
      <section className="relative mb-5 overflow-hidden rounded-[24px] bg-[#0d0d0d] p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at 88% -10%, rgba(200,245,66,0.16), transparent 60%)",
          }}
        />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-white/15 px-2.5 py-0.5 font-inter text-[11px] text-white/60">
                {originLabel}
              </span>
              {vendor ? (
                <span className="inline-flex items-center rounded-full border border-[rgba(200,245,66,0.3)] bg-[rgba(200,245,66,0.1)] px-2.5 py-0.5 font-inter text-[11px] text-[#c8f542]">
                  Active client
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 font-archivo text-[32px] leading-[1.05] tracking-[-0.02em] text-white sm:text-[42px]">
              {vendor?.companyName || "Unassigned conversion"}
            </h1>

            <p className="mt-3 font-inter text-[13px] text-white/45">
              Converted {formatDate(conversion.convertedAt)}
              {conversion.owner ? ` · Owner ${conversion.owner}` : ""}
            </p>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
              <div>
                <p className="font-inter text-[10px] uppercase tracking-[0.16em] text-white/35">
                  Contract
                </p>
                <p className="mt-1 font-archivo text-[22px] text-white">
                  {formatCurrencyINR(rollup.contract)}
                </p>
              </div>
              <div>
                <p className="font-inter text-[10px] uppercase tracking-[0.16em] text-white/35">
                  Received
                </p>
                <p className="mt-1 font-archivo text-[22px] text-[#c8f542]">
                  {formatCurrencyINR(rollup.received)}
                </p>
              </div>
              <div>
                <p className="font-inter text-[10px] uppercase tracking-[0.16em] text-white/35">
                  Outstanding
                </p>
                <p className="mt-1 font-archivo text-[22px] text-white">
                  {formatCurrencyINR(rollup.outstanding)}
                </p>
              </div>
              <div>
                <p className="font-inter text-[10px] uppercase tracking-[0.16em] text-white/35">
                  Projects
                </p>
                <p className="mt-1 font-archivo text-[22px] text-white">
                  {activeProjects}
                  <span className="text-[14px] text-white/40"> / {projects.length}</span>
                </p>
              </div>
            </div>

            {/* collection meter */}
            <div className="mt-6 max-w-md">
              <div className="mb-1.5 flex items-center justify-between font-inter text-[11px] text-white/40">
                <span>Collected</span>
                <span>{collectedPct}% of invoiced</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#c8f542]"
                  style={{ width: `${collectedPct}%` }}
                />
              </div>
            </div>
          </div>

          <TrackingTicket
            code={conversion.publicCode}
            trackUrl={`${origin}/track/${conversion.publicCode}`}
            clientEmail={vendor?.email || lead?.email || undefined}
          />
        </div>
      </section>

      {/* ---------------- Body ---------------- */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card
            title="Projects"
            icon={FolderKanban}
            action={
              vendor ? (
                <Link
                  href={`/admin/os/projects/new?conversion=${uuid}`}
                  className="font-inter text-[13px] font-medium text-[#6b7280] transition-colors hover:text-[#111111]"
                >
                  + Add project
                </Link>
              ) : null
            }
          >
            {projects.length === 0 ? (
              <Empty>No projects yet.</Empty>
            ) : (
              <ul className="space-y-2">
                {projects.map((p) => {
                  const status = normalizeProjectStatus(p.status);
                  return (
                    <li key={String(p._id)}>
                      <Link
                        href={`/admin/os/projects/${p._id}`}
                        className="group flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl border border-[#f3f4f6] px-4 py-3 transition-colors hover:border-[#111111]"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-inter text-[14px] font-medium text-[#111111]">
                            {p.name}
                          </p>
                          <p className="mt-0.5 font-inter text-[12px] text-[#9ca3af]">
                            {p.service || "—"}
                            {p.expectedDelivery
                              ? ` · due ${formatDate(p.expectedDelivery)}`
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Pill tone={projectTonePill(status)}>
                            {PROJECT_STATUS_LABELS[status]}
                          </Pill>
                          <ArrowUpRight className="h-3.5 w-3.5 text-[#d1d5db] transition-colors group-hover:text-[#111111]" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card
            title="Invoices"
            icon={Receipt}
            action={
              <Link
                href="/admin/os/invoices"
                className="font-inter text-[13px] font-medium text-[#6b7280] transition-colors hover:text-[#111111]"
              >
                View all →
              </Link>
            }
          >
            {invoices.length === 0 ? (
              <Empty>No invoices raised.</Empty>
            ) : (
              <ul className="space-y-2">
                {invoices.map((i) => {
                  const st = displayInvoiceStatus({
                    status: i.status,
                    dueDate: i.dueDate,
                    amountPaid: i.amountPaid || 0,
                    total: i.total || 0,
                  });
                  return (
                    <li key={String(i._id)}>
                      <Link
                        href={`/admin/os/invoices/${i._id}`}
                        className="group flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-xl border border-[#f3f4f6] px-4 py-3 transition-colors hover:border-[#111111]"
                      >
                        <div className="min-w-0">
                          <p className="font-inter text-[14px] font-medium text-[#111111]">
                            {i.invoiceNumber}
                          </p>
                          <p className="mt-0.5 font-inter text-[12px] text-[#9ca3af]">
                            {i.dueDate ? `Due ${formatDate(i.dueDate)}` : "No due date"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-archivo text-[14px] text-[#111111]">
                            {formatCurrencyINR(i.total)}
                          </span>
                          <Pill tone={invoiceTonePill(st)}>
                            {INVOICE_STATUS_LABELS[st]}
                          </Pill>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="Activity" icon={Sparkles}>
            {activity.length === 0 ? (
              <Empty>Nothing recorded yet.</Empty>
            ) : (
              <ol className="relative space-y-5 pl-5">
                <span
                  aria-hidden
                  className="absolute bottom-2 left-[5px] top-2 w-px bg-[#f3f4f6]"
                />
                {activity.map((a) => (
                  <li key={String(a._id)} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#d1d5db] ring-1 ring-[#e5e7eb]"
                    />
                    <p className="font-inter text-[13px] font-medium text-[#111111]">
                      {a.title}
                    </p>
                    <p className="mt-0.5 font-inter text-[12px] text-[#9ca3af]">
                      {formatDateTime(a.createdAt)}
                      {a.createdBy ? ` · ${a.createdBy}` : ""}
                      {a.detail ? ` · ${a.detail}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        {/* ---------------- Sidebar ---------------- */}
        <div className="space-y-5">
          <Card title="Client" icon={Building2}>
            {vendor ? (
              <Link
                href={`/admin/os/vendors/${vendor._id}`}
                className="font-inter text-[15px] font-medium text-[#111111] hover:underline"
              >
                {vendor.companyName}
              </Link>
            ) : (
              <p className="font-inter text-[13px] text-[#9ca3af]">No client record</p>
            )}

            <dl className="mt-4 space-y-2.5 font-inter text-[13px]">
              {vendor?.contactPerson ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-[#9ca3af]">Contact</dt>
                  <dd className="text-right text-[#111111]">{vendor.contactPerson}</dd>
                </div>
              ) : null}
              {vendor?.email ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-[#9ca3af]">Email</dt>
                  <dd className="truncate text-right text-[#111111]">{vendor.email}</dd>
                </div>
              ) : null}
              {lead ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-[#9ca3af]">Lead</dt>
                  <dd className="text-right">
                    <Link
                      href={`/admin/os/leads/${lead._id}`}
                      className="text-[#111111] hover:underline"
                    >
                      {lead.name}
                    </Link>
                  </dd>
                </div>
              ) : null}
              {referral ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-[#9ca3af]">Referral</dt>
                  <dd className="text-right">
                    <Link
                      href={`/admin/referrals/${String(referral._id)}`}
                      className="text-[#111111] hover:underline"
                    >
                      {referral.referredName}
                    </Link>
                    <span className="ml-1 text-[#9ca3af]">
                      {STAGE_LABELS[referral.stage as Stage]}
                    </span>
                  </dd>
                </div>
              ) : null}
            </dl>
          </Card>

          {canPortal ? (
            <Card title="Client portal" icon={Wallet}>
              <div className="space-y-3">
                {portal?.isActive ? (
                  <CopyPortalUrl url={`${origin}${clientPortalPath(uuid)}`} />
                ) : (
                  <p className="font-inter text-[13px] text-[#9ca3af]">
                    No portal link generated yet.
                  </p>
                )}
                <GeneratePortalForm conversionUuid={uuid} />
                {portal?.isActive ? (
                  <form action={revokeClientPortal}>
                    <input type="hidden" name="conversionUuid" value={uuid} />
                    <button
                      className="font-inter text-[12px] text-rose-600 hover:underline"
                      type="submit"
                    >
                      Revoke portal
                    </button>
                  </form>
                ) : null}
              </div>
            </Card>
          ) : null}

          <Card title="Payments" icon={Wallet}>
            {payments.length === 0 ? (
              <Empty>No payments received.</Empty>
            ) : (
              <ul className="space-y-2.5">
                {payments.slice(0, 8).map((p) => (
                  <li
                    key={String(p._id)}
                    className="flex items-center justify-between gap-3 font-inter text-[13px]"
                  >
                    <span className="min-w-0 truncate text-[#6b7280]">
                      {formatDate(p.paidAt)}
                      {p.method ? ` · ${p.method}` : ""}
                    </span>
                    <span className="shrink-0 font-medium text-[#111111]">
                      {formatCurrencyINR(p.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Meetings" icon={CalendarDays}>
            {meetings.length === 0 ? (
              <Empty>No meetings logged.</Empty>
            ) : (
              <ul className="space-y-2.5">
                {meetings.slice(0, 6).map((m) => (
                  <li key={String(m._id)}>
                    <Link
                      href={`/admin/os/meetings/${m._id}`}
                      className="font-inter text-[13px] text-[#111111] hover:underline"
                    >
                      {m.title}
                    </Link>
                    <p className="font-inter text-[12px] text-[#9ca3af]">
                      {formatDateTime(m.startsAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Documents" icon={FileText}>
            {documents.length === 0 ? (
              <Empty>No documents.</Empty>
            ) : (
              <ul className="space-y-2">
                {documents.slice(0, 8).map((d) => (
                  <li
                    key={String(d._id)}
                    className="flex items-center justify-between gap-3 font-inter text-[13px]"
                  >
                    <span className="min-w-0 truncate text-[#111111]">{d.title}</span>
                    {d.visibleToClient ? <Pill tone="good">Shared</Pill> : null}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}
