export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { resolvePortalByUuid } from "@/lib/os/resolve-portal";
import { Project } from "@/models/os/Project";
import { PROJECT_STATUS_LABELS, normalizeProjectStatus } from "@/lib/os/constants";
import { PortalCard, PortalPageHeader } from "@/components/os/portal/ui";

export default async function ClientProjectsPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const portal = await resolvePortalByUuid(uuid);
  if (!portal) notFound();
  const projects = await Project.find({
    conversionUuid: portal.conversion.conversionUuid,
    recordStatus: "active",
    status: { $ne: "cancelled" },
  }).lean();

  return (
    <main className="px-4 py-10 sm:px-8">
      <PortalPageHeader
        title="Projects"
        subtitle="Active workstreams shared with your team."
      />
      <ul className="space-y-4">
        {projects.map((p) => (
          <li key={String(p._id)}>
            <Link href={`/client-portal/${uuid}/projects/${p._id}`}>
              <PortalCard className="transition-colors hover:bg-[var(--dash-hover)]">
                <p className="font-inter text-lg text-[var(--dash-text)]">
                  {p.name}
                </p>
                <p className="text-sm text-[var(--dash-muted)]">
                  {PROJECT_STATUS_LABELS[normalizeProjectStatus(p.status)]} ·{" "}
                  {p.progress || 0}%
                </p>
                {p.description ? (
                  <p className="mt-2 text-sm text-[var(--dash-muted)]">
                    {p.description}
                  </p>
                ) : null}
              </PortalCard>
            </Link>
          </li>
        ))}
      </ul>
      {projects.length === 0 ? (
        <p className="font-inter text-sm text-[var(--dash-muted)]">
          No projects yet.
        </p>
      ) : null}
    </main>
  );
}
