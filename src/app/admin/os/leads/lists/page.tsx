export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { LeadList } from "@/models/os/LeadList";
import { Lead } from "@/models/os/Lead";
import { buildLeadListQuery } from "@/lib/os/services/lead-list-service";
import { OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { formatDate } from "@/lib/utils";
import { hasPermission } from "@/lib/os/permissions";

export default async function LeadListsPage() {
  const staff = await requireOsPage("leads:read");
  const canWrite = hasPermission(staff.permissions, "leads:write");

  const lists = await LeadList.find({ recordStatus: "active" })
    .sort({ updatedAt: -1 })
    .lean();

  const listsWithCounts = await Promise.all(
    lists.map(async (l) => {
      const query = buildLeadListQuery((l.filters || {}) as any);
      const count = await Lead.countDocuments(query);
      return { list: l, count };
    })
  );

  return (
    <OsPage
      title="Lead lists"
      subtitle="Saved filters over the shared Lead entity. Lists never duplicate leads."
      backHref="/admin/os/leads"
      backLabel="Back to leads"
      actions={
        canWrite ? (
          <Link
            href="/admin/os/leads/lists/new"
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--dash-accent)] px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-on-accent)]"
          >
            Create list
          </Link>
        ) : null
      }
    >
      <OsTable>
      <thead>
      <tr>
      <Th>Name</Th>
      <Th>Filters</Th>
      <Th>Lead count</Th>
      <Th>Updated</Th>
      </tr>
      </thead>
      <tbody>
          {listsWithCounts.map(({ list: l, count }) => (
            <tr key={String(l._id)}>
      <Td>
      <Link
                  href={`/admin/os/leads/lists/${l._id}`}
                  className="text-[var(--dash-accent)]"
                >
                  {l.name}
                </Link>
      </Td>
      <Td>
      <span className="text-xs text-[var(--dash-muted)]">
                  {l.filters && Object.keys(l.filters).length
                    ? Object.entries(l.filters)
                        .slice(0, 3)
                        .map(([k, v]) => `${k}`)
                        .join(", ")
                    : "—"}
                </span>
      </Td>
      <Td>
                {count}
              </Td>
      <Td>{formatDate(l.updatedAt)}</Td>
      </tr>
          ))}
        </tbody>
      </OsTable>

      {listsWithCounts.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">
          No lead lists yet.
        </p>
      ) : null}
    </OsPage>
  );
}

