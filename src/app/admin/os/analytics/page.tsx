export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { Lead } from "@/models/os/Lead";
import { Conversion } from "@/models/os/Conversion";
import { Invoice } from "@/models/os/Invoice";
import { displayInvoiceStatus, outstandingOf } from "@/lib/os/money";
import { formatCurrencyINR } from "@/lib/utils";
import { INDUSTRY_SECTORS } from "@/lib/os/constants";
import { OsPage, OsStat } from "@/components/os/ui";

export default async function AnalyticsPage() {
  await requireOsPage("analytics:read");
  const leads = await Lead.find({ recordStatus: "active" }).lean();
  const conversions = await Conversion.find({ recordStatus: "active" }).lean();
  const invoices = await Invoice.find({
    recordStatus: "active",
    status: { $ne: "cancelled" },
  }).lean();
  const issued = invoices.filter((i) => i.status !== "draft");
  const received = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const invoiced = issued.reduce((s, i) => s + (i.total || 0), 0);
  const overdue = issued.filter(
    (i) =>
      displayInvoiceStatus({
        status: i.status,
        dueDate: i.dueDate,
        amountPaid: i.amountPaid || 0,
        total: i.total || 0,
      }) === "overdue"
  );
  const conversionRate =
    leads.length === 0
      ? 0
      : Math.round((conversions.length / leads.length) * 100);

  const aging = [
    { label: "0–30 days", days: [0, 30] },
    { label: "31–60 days", days: [31, 60] },
    { label: "61+ days", days: [61, 3650] },
  ].map((bucket) => {
    const now = Date.now();
    const amount = issued.reduce((s, i) => {
      const due = outstandingOf(i.total || 0, i.amountPaid || 0);
      if (due <= 0 || !i.dueDate) return s;
      const age = Math.floor(
        (now - new Date(i.dueDate).getTime()) / 86400000
      );
      if (age >= bucket.days[0] && age <= bucket.days[1]) return s + due;
      return s;
    }, 0);
    return { ...bucket, amount };
  });

  const sectorCounts = new Map<string, number>();
  for (const lead of leads) {
    const sector =
      (lead.sector && String(lead.sector).trim()) ||
      (lead.industry && String(lead.industry).trim()) ||
      "Unspecified";
    sectorCounts.set(sector, (sectorCounts.get(sector) || 0) + 1);
  }
  const sectorRows = [
    ...INDUSTRY_SECTORS.map((sector) => ({
      sector,
      count: sectorCounts.get(sector) || 0,
    })),
    ...[...sectorCounts.entries()]
      .filter(
        ([sector]) =>
          !(INDUSTRY_SECTORS as readonly string[]).includes(sector) &&
          sector !== "Unspecified"
      )
      .map(([sector, count]) => ({ sector, count })),
    {
      sector: "Unspecified",
      count: sectorCounts.get("Unspecified") || 0,
    },
  ]
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);

  const topSector = sectorRows[0]?.sector || "—";

  return (
    <OsPage title="Analytics"
      backHref="/admin/os"
      backLabel="Back to dashboard">
      <div className="grid gap-4 sm:grid-cols-3">
      <OsStat label="Conversion rate" value={`${conversionRate}%`} />
      <OsStat label="Revenue collected" value={received} />
      <OsStat label="Invoiced" value={invoiced} />
      </div>
      <h2 className="mb-3 mt-10 font-archivo text-sm uppercase">
        Sector focus (from lead industries)
      </h2>
      <p className="mb-4 max-w-xl font-inter text-sm text-[var(--dash-muted)]">
        Auto-derived from industry selections on leads. Top sector right now:{" "}
        <span className="text-[var(--dash-accent)]">{topSector}</span>
      </p>
      {sectorRows.length === 0 ? (
        <p className="font-inter text-sm text-[var(--dash-muted)]">
          No industry data yet. Add leads with an industry to build this view.
        </p>
      ) : (
        <ul className="max-w-md space-y-2 font-inter text-sm">
          {sectorRows.map((row) => (
            <li key={row.sector} className="flex justify-between gap-4">
      <span>{row.sector}</span>
      <span className="text-[var(--dash-muted)]">
                {row.count} lead{row.count === 1 ? "" : "s"}
              </span>
      </li>
          ))}
        </ul>
      )}

      <h2 className="mb-3 mt-10 font-archivo text-sm uppercase">
        AR aging (past due)
      </h2>
      <ul className="max-w-md space-y-2 font-inter text-sm">
        {aging.map((b) => (
          <li key={b.label} className="flex justify-between">
            {b.label}
            <span>{formatCurrencyINR(b.amount)}</span>
      </li>
        ))}
        <li className="flex justify-between text-red-300">
          Overdue invoices
          <span>{overdue.length}</span>
      </li>
      </ul>
      </OsPage>
  );
}
