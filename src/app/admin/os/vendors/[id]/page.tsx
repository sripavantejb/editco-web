export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireOsPage } from "@/lib/os/page";
import { Vendor, VENDOR_ACTIVE_STATUSES, VENDOR_ACTIVE_STATUS_LABELS } from "@/models/os/Vendor";
import { Conversion } from "@/models/os/Conversion";
import { Project } from "@/models/os/Project";
import { Payment } from "@/models/os/Payment";
import { PortalAccess } from "@/models/os/PortalAccess";
import { conversionRollup } from "@/lib/os/rollups";
import { updateVendor, deleteVendor } from "@/actions/os/vendors";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, OsLink, OsPage, osInputClass, osTextareaClass } from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import { OsDateInput } from "@/components/os/OsDateInput";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { GeneratePortalForm } from "@/components/os/OsForms";
import { CopyPortalUrl } from "@/components/os/CopyPortalUrl";
import { RecordClientPaymentDrawer } from "@/components/os/RecordClientPaymentDrawer";
import { hasPermission } from "@/lib/os/permissions";
import { revokeClientPortal } from "@/actions/os/portal";
import Link from "next/link";

async function deleteVendorForm(formData: FormData) {
  "use server";
  const result = await deleteVendor({}, formData);
  if (!result.error) redirect("/admin/os/vendors");
}

function appOrigin(host: string | null, proto: string | null) {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (host) return `${proto === "https" ? "https" : "http"}://${host}`;
  return "http://localhost:3000";
}

function toDateInputValue(value?: Date | string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireOsPage("vendors:read");
  const { id } = await params;
  const vendor = await Vendor.findById(id).lean();
  if (!vendor) notFound();
  const conversion = await Conversion.findOne({
    conversionUuid: vendor.conversionUuid,
  }).lean();
  const [projects, payments, portal, rollup] = await Promise.all([
    Project.find({
      conversionUuid: vendor.conversionUuid,
      recordStatus: "active",
    }).lean(),
    Payment.find({
      conversionUuid: vendor.conversionUuid,
      recordStatus: "active",
    })
      .sort({ paidAt: -1 })
      .limit(20)
      .lean(),
    PortalAccess.findOne({
      conversionUuid: vendor.conversionUuid,
    }).lean(),
    conversionRollup(vendor.conversionUuid),
  ]);
  const canWrite = hasPermission(staff.permissions, "vendors:write");
  const canPay =
    canWrite || hasPermission(staff.permissions, "payments:write");
  const h = await headers();
  const origin = appOrigin(h.get("host"), h.get("x-forwarded-proto"));
  const portalUrl =
    portal?.isActive
      ? `${origin}/client-portal/${vendor.conversionUuid}`
      : null;

  return (
    <OsPage
      title={vendor.companyName}
      subtitle={`Onboarded relationship · ${conversion?.publicCode || vendor.conversionUuid}`}
      backHref="/admin/os/vendors"
      backLabel="Back to clients"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {canPay ? <RecordClientPaymentDrawer vendorId={id} /> : null}
          {conversion ? (
            <OsLink href={`/admin/os/c/${conversion.publicCode}`}>
              Conversion hub
            </OsLink>
          ) : null}
        </div>
      }
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--dash-border)] p-4 font-inter text-sm">
          Total business
          <p className="font-archivo text-xl">
            {formatCurrencyINR(rollup.contract)}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--dash-border)] p-4 font-inter text-sm">
          Received
          <p className="font-archivo text-xl">
            {formatCurrencyINR(rollup.received)}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--dash-border)] p-4 font-inter text-sm">
          Outstanding
          <p className="font-archivo text-xl">
            {formatCurrencyINR(rollup.outstanding)}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--dash-border)] p-4 font-inter text-sm">
          Projects
          <p className="font-archivo text-xl">
            {rollup.activeProjects} active / {rollup.completedProjects} done
          </p>
        </div>
      </div>

      {canWrite ? (
        <OsActionForm
          action={updateVendor}
          submitLabel="Save client"
          className="mb-10 grid max-w-3xl gap-3 sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={id} />
          <Field label="Company">
            <input
              name="companyName"
              defaultValue={vendor.companyName}
              className={osInputClass()}
            />
          </Field>
          <Field label="Contact">
            <input
              name="contactPerson"
              defaultValue={vendor.contactPerson}
              className={osInputClass()}
            />
          </Field>
          <Field label="Email">
            <input
              name="email"
              defaultValue={vendor.email}
              className={osInputClass()}
            />
          </Field>
          <Field label="Phone">
            <input
              name="phone"
              defaultValue={vendor.phone}
              className={osInputClass()}
            />
          </Field>
          <Field label="Location">
            <input
              name="location"
              defaultValue={vendor.location}
              className={osInputClass()}
            />
          </Field>
          <Field label="Active status">
            <OsSelect
              name="activeStatus"
              defaultValue={vendor.activeStatus || "active"}
              options={VENDOR_ACTIVE_STATUSES.map((s) => ({
                value: s,
                label: VENDOR_ACTIVE_STATUS_LABELS[s],
              }))}
            />
          </Field>
          <Field label="Industry">
            <input
              name="industry"
              defaultValue={vendor.industry}
              className={osInputClass()}
            />
          </Field>
          <Field label="GST">
            <input
              name="gstNumber"
              defaultValue={vendor.gstNumber}
              className={osInputClass()}
            />
          </Field>
          <Field label="Website">
            <input
              name="website"
              defaultValue={vendor.website}
              className={osInputClass()}
            />
          </Field>
          <Field label="Account owner">
            <input
              name="accountOwner"
              defaultValue={vendor.accountOwner}
              className={osInputClass()}
            />
          </Field>
          <Field label="Deal value (₹)">
            <input
              name="conversionValue"
              type="number"
              min="0"
              step="0.01"
              defaultValue={conversion?.conversionValue ?? 0}
              className={osInputClass()}
            />
          </Field>
          <Field label="Expected start">
            <OsDateInput
              name="expectedStart"
              defaultValue={toDateInputValue(conversion?.expectedStart)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address">
              <textarea
                name="address"
                defaultValue={vendor.address}
                className={osTextareaClass()}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Social links">
              <input
                name="socialLinks"
                defaultValue={vendor.socialLinks}
                className={osInputClass()}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea
                name="notes"
                defaultValue={conversion?.notes || ""}
                className={osTextareaClass()}
              />
            </Field>
          </div>
        </OsActionForm>
      ) : null}

      <section className="mb-10 max-w-3xl">
        <h2 className="mb-3 font-archivo text-sm uppercase">Money received</h2>
        {payments.length === 0 ? (
          <p className="font-inter text-sm text-[var(--dash-muted)]">
            No payments yet. Use Record money when this client pays — it updates
            Received here and Revenue.
          </p>
        ) : (
          <ul className="space-y-2 font-inter text-sm">
            {payments.map((p) => (
              <li
                key={String(p._id)}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--dash-border)] px-3 py-2"
              >
                <span>
                  {formatCurrencyINR(p.amount)} · {p.method || "—"} ·{" "}
                  {formatDate(p.paidAt)}
                  {p.reference ? ` · ${p.reference}` : ""}
                </span>
                {p.notes ? (
                  <span className="text-[var(--dash-muted)]">{p.notes}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {canWrite ? (
        <form action={deleteVendorForm} className="mb-10">
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="font-inter text-xs text-red-400 hover:underline"
          >
            Delete client
          </button>
        </form>
      ) : null}

      {canWrite ? (
        <section className="mb-8 max-w-xl space-y-3">
          <h2 className="font-archivo text-sm uppercase">Client portal</h2>
          {portalUrl ? (
            <div className="rounded-2xl border border-[var(--dash-border)] p-4">
              <p className="mb-2 font-inter text-xs text-[var(--dash-muted)]">
                Dashboard URL (stable for this client)
              </p>
              <CopyPortalUrl url={portalUrl} />
            </div>
          ) : (
            <p className="font-inter text-sm text-[var(--dash-muted)]">
              Generate below to enable{" "}
              <span className="text-[var(--dash-text)]">
                /client-portal/{vendor.conversionUuid}
              </span>
            </p>
          )}
          <GeneratePortalForm conversionUuid={vendor.conversionUuid} />
          {portal?.isActive ? (
            <form action={revokeClientPortal}>
              <input
                type="hidden"
                name="conversionUuid"
                value={vendor.conversionUuid}
              />
              <button
                type="submit"
                className="font-inter text-xs text-red-400 hover:underline"
              >
                Revoke portal
              </button>
            </form>
          ) : null}
        </section>
      ) : null}

      <h2 className="mb-3 font-archivo text-sm uppercase">Projects</h2>
      <ul className="font-inter text-sm">
        {projects.map((p) => (
          <li key={String(p._id)}>
            <Link href={`/admin/os/projects/${p._id}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </OsPage>
  );
}
