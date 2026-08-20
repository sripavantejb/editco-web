export const dynamic = "force-dynamic";

import Link from "next/link";
import { headers } from "next/headers";
import { requireOsPage } from "@/lib/os/page";
import { Vendor } from "@/models/os/Vendor";
import { Conversion } from "@/models/os/Conversion";
import { PortalAccess } from "@/models/os/PortalAccess";
import { conversionRollup } from "@/lib/os/rollups";
import { formatCurrencyINR } from "@/lib/utils";
import { OsLink, OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { CopyPortalUrl } from "@/components/os/CopyPortalUrl";
import { hasPermission } from "@/lib/os/permissions";

function appOrigin(host: string | null, proto: string | null) {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (host) return `${proto === "https" ? "https" : "http"}://${host}`;
  return "http://localhost:3000";
}

export default async function VendorsPage() {
  const staff = await requireOsPage("vendors:read");
  const canWrite = hasPermission(staff.permissions, "vendors:write");
  const h = await headers();
  const origin = appOrigin(h.get("host"), h.get("x-forwarded-proto"));

  const vendors = await Vendor.find({ recordStatus: "active" })
    .sort({ updatedAt: -1 })
    .lean();
  const conversions = await Conversion.find({
    conversionUuid: { $in: vendors.map((v) => v.conversionUuid) },
  }).lean();
  const portals = await PortalAccess.find({
    conversionUuid: { $in: vendors.map((v) => v.conversionUuid) },
  }).lean();
  const codeByUuid = Object.fromEntries(
    conversions.map((c) => [c.conversionUuid, c.publicCode])
  );
  const portalByUuid = Object.fromEntries(
    portals.map((p) => [p.conversionUuid, p])
  );
  const rollups = await Promise.all(
    vendors.map((v) => conversionRollup(v.conversionUuid))
  );

  return (
    <OsPage
      title="Clients"
      subtitle="Onboarded business relationships. Prefer converting a lead when the deal came through sales; use Add client for already-won / existing accounts."
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={
        canWrite ? <OsLink href="/admin/os/vendors/new">Add client</OsLink> : null
      }
    >
      <OsTable>
        <thead>
          <tr>
            <Th>Company</Th>
            <Th>Conversion</Th>
            <Th>Owner</Th>
            <Th>Received</Th>
            <Th>Outstanding</Th>
            <Th>Portal</Th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v, i) => {
            const portal = portalByUuid[v.conversionUuid];
            const portalUrl =
              portal?.isActive
                ? `${origin}/client-portal/${v.conversionUuid}`
                : null;
            return (
              <tr key={String(v._id)}>
                <Td>
                  <Link
                    href={`/admin/os/vendors/${v._id}`}
                    className="text-[var(--dash-accent)]"
                  >
                    {v.companyName}
                  </Link>
                </Td>
                <Td>
                  <Link href={`/admin/os/c/${codeByUuid[v.conversionUuid]}`}>
                    {codeByUuid[v.conversionUuid]}
                  </Link>
                </Td>
                <Td>{v.accountOwner || "—"}</Td>
                <Td>{formatCurrencyINR(rollups[i].received)}</Td>
                <Td>{formatCurrencyINR(rollups[i].outstanding)}</Td>
                <Td>
                  {portalUrl ? (
                    <CopyPortalUrl url={portalUrl} />
                  ) : (
                    <span className="font-inter text-xs text-[var(--dash-faint)]">
                      —
                    </span>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </OsTable>
    </OsPage>
  );
}
