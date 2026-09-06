export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { requireOsPage } from "@/lib/os/page";
import { Vendor } from "@/models/os/Vendor";
import { Conversion } from "@/models/os/Conversion";
import { PortalAccess } from "@/models/os/PortalAccess";
import { conversionRollupsFor } from "@/lib/os/rollups";
import { OsLink, OsPage } from "@/components/os/ui";
import { ClientsTable, type ClientRowView } from "@/components/os/ClientsTable";
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
  const rollupByUuid = await conversionRollupsFor(vendors.map((v) => v.conversionUuid));

  const rows: ClientRowView[] = vendors.map((v) => {
    const portal = portalByUuid[v.conversionUuid];
    const rollup = rollupByUuid.get(v.conversionUuid);
    return {
      id: String(v._id),
      companyName: v.companyName,
      contactPerson: v.contactPerson || "",
      location: v.location || "",
      activeStatus: (v.activeStatus as string) || "active",
      conversionUuid: v.conversionUuid,
      publicCode: codeByUuid[v.conversionUuid] || "",
      accountOwner: v.accountOwner || "",
      received: rollup?.received || 0,
      outstanding: rollup?.outstanding || 0,
      portalUrl:
        portal?.isActive ? `${origin}/client-portal/${v.conversionUuid}` : null,
      canWrite,
    };
  });

  return (
    <OsPage
      title="Clients"
      subtitle="Onboarded business relationships. Click a client for conversion code and portal — without leaving this page."
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={
        canWrite ? <OsLink href="/admin/os/vendors/new">Add client</OsLink> : null
      }
    >
      <ClientsTable rows={rows} />
    </OsPage>
  );
}
