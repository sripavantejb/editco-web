export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
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
import { OsBadge, OsPage, invoiceTone } from "@/components/os/ui";
import { INVOICE_STATUS_LABELS, PROJECT_STATUS_LABELS, normalizeProjectStatus } from "@/lib/os/constants";
import { GeneratePortalForm } from "@/components/os/OsForms";
import { CopyPortalUrl } from "@/components/os/CopyPortalUrl";
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
      Invoice.find({ conversionUuid: uuid, recordStatus: "active" }).sort({ createdAt: -1 }).lean(),
      Payment.find({ conversionUuid: uuid, recordStatus: "active" }).sort({ paidAt: -1 }).lean(),
      Meeting.find({ conversionUuid: uuid, recordStatus: "active" }).sort({ startsAt: -1 }).lean(),
      OsDocument.find({ conversionUuid: uuid, recordStatus: "active" }).sort({ createdAt: -1 }).lean(),
      ActivityEvent.find({ conversionUuid: uuid }).sort({ createdAt: -1 }).limit(40).lean(),
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

  return (
    <OsPage
      title={conversion.publicCode}
      subtitle={`${originLabel} · UUID ${conversion.conversionUuid}`}
      backHref="/admin/os/conversions"
      backLabel="Back to conversions"
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
      <div className="rounded-2xl border border-[var(--dash-border)] p-4">
      <p className="text-xs text-[var(--dash-faint)]">Contract</p>
      <p className="font-archivo text-xl">{formatCurrencyINR(rollup.contract)}</p>
      </div>
      <div className="rounded-2xl border border-[var(--dash-border)] p-4">
      <p className="text-xs text-[var(--dash-faint)]">Invoiced</p>
      <p className="font-archivo text-xl">{formatCurrencyINR(rollup.invoiced)}</p>
      </div>
      <div className="rounded-2xl border border-[var(--dash-border)] p-4">
      <p className="text-xs text-[var(--dash-faint)]">Received</p>
      <p className="font-archivo text-xl">{formatCurrencyINR(rollup.received)}</p>
      </div>
      <div className="rounded-2xl border border-[var(--dash-border)] p-4">
      <p className="text-xs text-[var(--dash-faint)]">Outstanding</p>
      <p className="font-archivo text-xl">{formatCurrencyINR(rollup.outstanding)}</p>
      </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
      <section>
      <h2 className="mb-2 font-archivo text-sm uppercase">Client</h2>
          {vendor ? (
            <Link href={`/admin/os/vendors/${vendor._id}`} className="text-[var(--dash-accent)]">
              {vendor.companyName}
            </Link>
          ) : (
            <p>No client record</p>
          )}
          {lead ? (
            <p className="mt-2 font-inter text-sm">
              Lead:{" "}
              <Link href={`/admin/os/leads/${lead._id}`} className="text-[var(--dash-text)]">
                {lead.name}
              </Link>
      </p>
          ) : null}
          {referral ? (
            <p className="mt-2 font-inter text-sm">
              Referral:{" "}
              <Link
                href={`/admin/referrals/${String(referral._id)}`}
                className="text-[var(--dash-text)]"
              >
                {referral.referredName}
              </Link>{" "}
              · {STAGE_LABELS[referral.stage as Stage]}
            </p>
          ) : null}
          {canPortal ? (
            <div className="mt-4 space-y-3">
              {portal?.isActive ? (
                <CopyPortalUrl url={`${origin}${clientPortalPath(uuid)}`} />
              ) : null}
              <GeneratePortalForm conversionUuid={uuid} />
              {portal?.isActive ? (
                <form action={revokeClientPortal}>
                  <input type="hidden" name="conversionUuid" value={uuid} />
                  <button className="text-sm text-red-300" type="submit">
                    Revoke portal
                  </button>
                </form>
              ) : null}
            </div>
          ) : null}
        </section>
      <section>
      <h2 className="mb-2 font-archivo text-sm uppercase">Projects</h2>
      <ul className="space-y-2 font-inter text-sm">
            {projects.map((p) => (
              <li key={String(p._id)}>
      <Link href={`/admin/os/projects/${p._id}`} className="text-[var(--dash-text)]">
                  {p.name}
                </Link>{" "}
                <OsBadge>{PROJECT_STATUS_LABELS[normalizeProjectStatus(p.status)]}</OsBadge>
      </li>
            ))}
          </ul>
          {vendor ? (
            <Link href={`/admin/os/projects/new?conversion=${uuid}`} className="mt-2 inline-block text-sm text-[var(--dash-accent)]">
              + Add project
            </Link>
          ) : null}
        </section>
      <section>
      <h2 className="mb-2 font-archivo text-sm uppercase">Invoices</h2>
      <ul className="space-y-2 font-inter text-sm">
            {invoices.map((i) => {
              const st = displayInvoiceStatus({
                status: i.status,
                dueDate: i.dueDate,
                amountPaid: i.amountPaid || 0,
                total: i.total || 0,
              });
              return (
                <li key={String(i._id)}>
      <Link href={`/admin/os/invoices/${i._id}`}>{i.invoiceNumber}</Link>{" "}
                  {formatCurrencyINR(i.total)}{" "}
                  <OsBadge tone={invoiceTone(st)}>{INVOICE_STATUS_LABELS[st]}</OsBadge>
      </li>
              );
            })}
          </ul>
      </section>
      <section>
      <h2 className="mb-2 font-archivo text-sm uppercase">Payments</h2>
      <ul className="space-y-2 font-inter text-sm">
            {payments.map((p) => (
              <li key={String(p._id)}>
                {formatCurrencyINR(p.amount)} · {p.reference || p.method} · {formatDate(p.paidAt)}
              </li>
            ))}
          </ul>
      </section>
      <section>
      <h2 className="mb-2 font-archivo text-sm uppercase">Meetings</h2>
      <ul className="space-y-2 font-inter text-sm">
            {meetings.map((m) => (
              <li key={String(m._id)}>
      <Link href={`/admin/os/meetings/${m._id}`}>{m.title}</Link> · {formatDateTime(m.startsAt)}
              </li>
            ))}
          </ul>
      </section>
      <section>
      <h2 className="mb-2 font-archivo text-sm uppercase">Documents</h2>
      <ul className="space-y-2 font-inter text-sm">
            {documents.map((d) => (
              <li key={String(d._id)}>{d.title}</li>
            ))}
          </ul>
      </section>
      </div>
      <section className="mt-10">
      <h2 className="mb-4 font-archivo text-sm uppercase">Activity history</h2>
      <ol className="space-y-3">
          {activity.map((a) => (
            <li key={String(a._id)} className="border-l border-[var(--dash-border)] pl-4 font-inter text-sm">
      <p>{a.title}</p>
      <p className="text-[var(--dash-muted)]">
                {formatDateTime(a.createdAt)} · {a.createdBy} {a.detail ? `· ${a.detail}` : ""}
              </p>
      </li>
          ))}
        </ol>
      </section>
      </OsPage>
  );
}
