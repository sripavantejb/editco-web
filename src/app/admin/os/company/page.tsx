export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { Vendor } from "@/models/os/Vendor";
import { Referrer } from "@/models/Referrer";
import { SalesCustomer } from "@/models/sales/SalesCustomer";
import { OsBadge, OsPage, OsStat, OsTable, Td, Th } from "@/components/os/ui";
import { formatDate } from "@/lib/utils";
import "@/models/sales/register";

export default async function CompanyOverviewPage() {
  await requireOsPage("*");

  const [vendors, salesCustomers, referrerCount] = await Promise.all([
    Vendor.find({ recordStatus: "active" }).select("companyName accountOwner createdAt").lean(),
    SalesCustomer.find({ recordStatus: "active" }).select("name company customerSince").lean(),
    Referrer.countDocuments({}),
  ]);

  type ClientRow = { id: string; name: string; source: "Editco OS" | "Sales CRM"; owner: string; since: Date };
  const rows: ClientRow[] = [
    ...vendors.map((v) => ({
      id: String(v._id),
      name: v.companyName,
      source: "Editco OS" as const,
      owner: v.accountOwner || "—",
      since: v.createdAt,
    })),
    ...salesCustomers.map((c) => ({
      id: String(c._id),
      name: c.company || c.name,
      source: "Sales CRM" as const,
      owner: "—",
      since: c.customerSince,
    })),
  ].sort((a, b) => new Date(b.since).getTime() - new Date(a.since).getTime());

  const totalClients = vendors.length + salesCustomers.length;

  return (
    <OsPage
      title="Company Overview"
      subtitle="Everything that touches Editco as a business — referrals, and every client whether they came through Editco OS or the Sales CRM."
      backHref="/admin/os"
      backLabel="Back to dashboard"
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/referrals" className="block rounded-[20px] border border-[var(--dash-border)] p-5 transition-colors hover:border-[var(--dash-accent)]">
          <p className="font-inter text-[11px] uppercase tracking-[0.14em] text-[var(--dash-faint)]">Referrals</p>
          <p className="mt-2 font-archivo text-2xl text-[var(--dash-text)]">{referrerCount}</p>
          <p className="mt-1 font-inter text-xs text-[var(--dash-accent)]">View referrals →</p>
        </Link>
        <Link href="/admin/os/vendors" className="block rounded-[20px] border border-[var(--dash-border)] p-5 transition-colors hover:border-[var(--dash-accent)]">
          <p className="font-inter text-[11px] uppercase tracking-[0.14em] text-[var(--dash-faint)]">Total clients (all sources)</p>
          <p className="mt-2 font-archivo text-2xl text-[var(--dash-text)]">{totalClients}</p>
          <p className="mt-1 font-inter text-xs text-[var(--dash-accent)]">Editco OS clients →</p>
        </Link>
        <OsStat label="Sales CRM customers" value={String(salesCustomers.length)} />
      </div>

      <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
        All clients — past and present
      </h2>
      <OsTable>
        <thead>
          <tr><Th>Client</Th><Th>Source</Th><Th>Owner</Th><Th>Client since</Th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.source}-${r.id}`}>
              <Td>{r.name}</Td>
              <Td><OsBadge tone={r.source === "Editco OS" ? "accent" : "ok"}>{r.source}</OsBadge></Td>
              <Td>{r.owner}</Td>
              <Td>{formatDate(r.since)}</Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {rows.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No clients recorded yet, from either system.</p> : null}
    </OsPage>
  );
}
