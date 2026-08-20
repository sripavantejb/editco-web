export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { Conversion } from "@/models/os/Conversion";
import { Vendor } from "@/models/os/Vendor";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { OsPage, OsTable, Td, Th } from "@/components/os/ui";

export default async function ConversionsPage() {
  await requireOsPage("conversions:read");
  const conversions = await Conversion.find({ recordStatus: "active" })
    .sort({ convertedAt: -1 })
    .lean();
  const vendors = await Vendor.find({
    conversionUuid: { $in: conversions.map((c) => c.conversionUuid) },
  }).lean();
  const vendorByUuid = Object.fromEntries(vendors.map((v) => [v.conversionUuid, v]));

  return (
    <OsPage title="Conversions" subtitle="Each row is a conversion event with a permanent UUID."
      backHref="/admin/os"
      backLabel="Back to dashboard">
      <OsTable>
      <thead>
      <tr>
      <Th>Code</Th>
      <Th>Client</Th>
      <Th>Value</Th>
      <Th>Owner</Th>
      <Th>Date</Th>
      </tr>
      </thead>
      <tbody>
          {conversions.map((c) => (
            <tr key={String(c._id)}>
      <Td>
      <Link href={`/admin/os/c/${c.publicCode}`} className="text-[var(--dash-accent)]">
                  {c.publicCode}
                </Link>
      </Td>
      <Td>{vendorByUuid[c.conversionUuid]?.companyName || "—"}</Td>
      <Td>{formatCurrencyINR(c.conversionValue || 0)}</Td>
      <Td>{c.owner || "—"}</Td>
      <Td>{c.convertedAt ? formatDate(c.convertedAt) : "—"}</Td>
      </tr>
          ))}
        </tbody>
      </OsTable>
      </OsPage>
  );
}
