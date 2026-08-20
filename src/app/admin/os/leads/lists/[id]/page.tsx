export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireOsPage } from "@/lib/os/page";
import { LeadList } from "@/models/os/LeadList";
import { Lead } from "@/models/os/Lead";
import { buildLeadListQuery } from "@/lib/os/services/lead-list-service";
import { OsPage, OsTable, Td, Th, osInputClass } from "@/components/os/ui";
import Link from "next/link";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { hasPermission } from "@/lib/os/permissions";

export default async function LeadListDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const staff = await requireOsPage("leads:read");
  const canWrite = hasPermission(staff.permissions, "leads:write");
  const { id } = await params;
  const list = await LeadList.findById(id).lean();
  if (!list || list.recordStatus !== "active") notFound();

  const { page, pageSize } = await searchParams;
  const pageNum = Math.max(1, Number(page || 1));
  const limitNum = Math.min(50, Math.max(10, Number(pageSize || 25)));
  const skip = (pageNum - 1) * limitNum;

  const query = buildLeadListQuery((list.filters || {}) as any);
  const total = await Lead.countDocuments(query);
  const leads = await Lead.find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();
  const totalPages = Math.max(1, Math.ceil(total / limitNum));

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("pageSize", String(limitNum));
    const qs = params.toString();
    return `/admin/os/leads/lists/${id}?${qs}`;
  };

  return (
    <OsPage
      title={list.name}
      subtitle={list.description || "Saved lead list"}
      backHref="/admin/os/leads/lists"
      backLabel="Back to lead lists"
      actions={
        canWrite ? (
          <Link
            href="/admin/os/leads"
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--dash-accent)] px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-on-accent)]"
          >
            View in Leads
          </Link>
        ) : null
      }
    >
      <OsTable>
      <thead>
      <tr>
      <Th>Lead</Th>
      <Th>Company</Th>
      <Th>Status</Th>
      <Th>Value</Th>
      <Th>Owner</Th>
      </tr>
      </thead>
      <tbody>
          {leads.map((lead) => (
            <tr key={String(lead._id)}>
      <Td>
      <Link href={`/admin/os/leads/${lead._id}`} className="text-[var(--dash-accent)]">
                  {lead.name}
                </Link>
      </Td>
      <Td>{lead.company || "—"}</Td>
      <Td>{lead.status}</Td>
      <Td>{formatCurrencyINR(lead.estimatedValue || 0)}</Td>
      <Td>{lead.assignedOwner || "—"}</Td>
      </tr>
          ))}
        </tbody>
      </OsTable>

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between">
      <Link
            href={buildHref(Math.max(1, pageNum - 1))}
            className={`inline-flex min-h-11 items-center rounded-xl border px-4 font-archivo text-xs uppercase tracking-[0.08em] ${
              pageNum <= 1
                ? "pointer-events-none border-[var(--dash-border)] text-[var(--dash-muted)]"
                : "border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-hover)]"
            }`}
          >
            Prev
          </Link>
      <p className="font-inter text-sm text-[var(--dash-muted)]">
            Page {pageNum} of {totalPages}
          </p>
      <Link
            href={buildHref(Math.min(totalPages, pageNum + 1))}
            className={`inline-flex min-h-11 items-center rounded-xl border px-4 font-archivo text-xs uppercase tracking-[0.08em] ${
              pageNum >= totalPages
                ? "pointer-events-none border-[var(--dash-border)] text-[var(--dash-muted)]"
                : "border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-hover)]"
            }`}
          >
            Next
          </Link>
      </div>
      ) : null}
    </OsPage>
  );
}

