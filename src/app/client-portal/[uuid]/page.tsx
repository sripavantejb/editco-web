export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { resolvePortalByUuid } from "@/lib/os/resolve-portal";
import { conversionRollup } from "@/lib/os/rollups";
import { Project } from "@/models/os/Project";
import { ProjectUpdate } from "@/models/os/ProjectUpdate";
import { OsTask } from "@/models/os/Task";
import { Invoice } from "@/models/os/Invoice";
import { formatCurrencyINR } from "@/lib/utils";
import { ACTIVE_PROJECT_STATUSES, normalizeProjectStatus } from "@/lib/os/constants";
import {
  PortalCard,
  PortalPageHeader,
  PortalSectionTitle,
} from "@/components/os/portal/ui";

export default async function ClientOverviewPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const portal = await resolvePortalByUuid(uuid);
  if (!portal) notFound();
  const rollup = await conversionRollup(portal.conversion.conversionUuid);
  const [projects, updates, clientTasks, invoices] = await Promise.all([
    Project.find({
      conversionUuid: portal.conversion.conversionUuid,
      recordStatus: "active",
    }).lean(),
    ProjectUpdate.find({
      conversionUuid: portal.conversion.conversionUuid,
      recordStatus: "active",
      visibility: "client_visible",
      publishedAt: { $exists: true },
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean(),
    OsTask.find({
      conversionUuid: portal.conversion.conversionUuid,
      recordStatus: "active",
      visibleToClient: true,
      clientActionRequired: true,
      status: { $ne: "completed" },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Invoice.find({
      conversionUuid: portal.conversion.conversionUuid,
      recordStatus: "active",
      status: { $nin: ["draft", "cancelled"] },
    })
      .sort({ issueDate: -1 })
      .limit(3)
      .lean(),
  ]);
  const active = projects.filter((p) =>
    ACTIVE_PROJECT_STATUSES.includes(normalizeProjectStatus(p.status))
  );

  return (
    <main className="px-4 py-10 sm:px-8">
      <PortalPageHeader
        title="Overview"
        subtitle={`Updates Editco shares for ${portal.conversion.publicCode}.`}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <PortalCard>
          <p className="text-xs text-[var(--dash-faint)]">Contract</p>
          <p className="mt-2 font-archivo text-3xl tracking-tight">
            {formatCurrencyINR(rollup.contract)}
          </p>
        </PortalCard>
        <PortalCard>
          <p className="text-xs text-[var(--dash-faint)]">Paid</p>
          <p className="mt-2 font-archivo text-3xl tracking-tight">
            {formatCurrencyINR(rollup.received)}
          </p>
        </PortalCard>
        <PortalCard>
          <p className="text-xs text-[var(--dash-faint)]">Outstanding</p>
          <p className="mt-2 font-archivo text-3xl tracking-tight">
            {formatCurrencyINR(rollup.outstanding)}
          </p>
        </PortalCard>
      </div>
      <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">
        {active.length} active project{active.length === 1 ? "" : "s"}
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <PortalSectionTitle>Recent updates</PortalSectionTitle>
          <ul className="space-y-3 font-inter text-sm">
            {updates.map((u) => (
              <li key={String(u._id)}>
                <PortalCard>
                  <p className="text-[var(--dash-text)]">{u.title}</p>
                  {u.body ? (
                    <p className="mt-1 text-[var(--dash-muted)]">{u.body}</p>
                  ) : null}
                </PortalCard>
              </li>
            ))}
          </ul>
          {updates.length === 0 ? (
            <p className="font-inter text-sm text-[var(--dash-muted)]">
              No updates shared yet.
            </p>
          ) : null}
          <Link
            href={`/client-portal/${uuid}/projects`}
            className="mt-4 inline-block font-inter text-sm text-[var(--dash-accent)]"
          >
            Open project workspace
          </Link>
        </section>
        <section>
          <PortalSectionTitle>Action required</PortalSectionTitle>
          <ul className="space-y-3 font-inter text-sm">
            {clientTasks.map((task) => (
              <li key={String(task._id)}>
                <PortalCard>
                  <p className="text-[var(--dash-text)]">{task.title}</p>
                  <p className="mt-1 text-[var(--dash-muted)]">
                    {task.description || "Client action pending"}
                  </p>
                </PortalCard>
              </li>
            ))}
          </ul>
          {clientTasks.length === 0 ? (
            <p className="font-inter text-sm text-[var(--dash-muted)]">
              No pending client actions.
            </p>
          ) : null}
        </section>
      </div>

      {invoices.length > 0 ? (
        <section className="mt-10">
          <PortalSectionTitle>Recent invoices</PortalSectionTitle>
          <ul className="space-y-3">
            {invoices.map((i) => (
              <li key={String(i._id)}>
                <Link href={`/client-portal/${uuid}/invoices/${i._id}`}>
                  <PortalCard className="flex items-center justify-between gap-4 transition-colors hover:bg-[var(--dash-hover)]">
                    <span className="font-inter text-sm text-[var(--dash-text)]">
                      {i.invoiceNumber}
                    </span>
                    <span className="font-archivo text-sm">
                      {formatCurrencyINR(i.total)}
                    </span>
                  </PortalCard>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
