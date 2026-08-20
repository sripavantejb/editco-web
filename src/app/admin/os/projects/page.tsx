export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { Project } from "@/models/os/Project";
import { Conversion } from "@/models/os/Conversion";
import { StaffUser } from "@/models/os/StaffUser";
import { ACTIVE_PROJECT_STATUSES, PROJECT_STATUS_LABELS, normalizeProjectStatus } from "@/lib/os/constants";
import { OsBadge, OsLink, OsPage, OsTable, Td, Th, projectTone } from "@/components/os/ui";
import { formatDate } from "@/lib/utils";
import { projectRollup } from "@/lib/os/rollups";
import { formatCurrencyINR } from "@/lib/utils";
import { migrateLegacyProjectStatuses } from "@/lib/os/services/project-service";
import { projectIdsForStaff } from "@/lib/os/project-access";
import { hasPermission } from "@/lib/os/permissions";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const staff = await requireOsPage("projects:read");
  await migrateLegacyProjectStatuses();
  const { filter } = await searchParams;
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 86400000);

  const scoped = await projectIdsForStaff(staff);
  let projects =
    scoped === "all"
      ? await Project.find({ recordStatus: "active" }).sort({ updatedAt: -1 }).lean()
      : await Project.find({
          recordStatus: "active",
          _id: { $in: scoped.length ? scoped : ["__none__"] },
        })
          .sort({ updatedAt: -1 })
          .lean();

  if (filter === "active") {
    projects = projects.filter((p) =>
      ACTIVE_PROJECT_STATUSES.includes(normalizeProjectStatus(p.status))
    );
  } else if (filter === "completed") {
    projects = projects.filter((p) => normalizeProjectStatus(p.status) === "completed");
  } else if (filter === "due") {
    projects = projects.filter(
      (p) =>
        p.expectedDelivery &&
        new Date(p.expectedDelivery) <= in7 &&
        new Date(p.expectedDelivery) >= now
    );
  }

  const conversions = await Conversion.find({
    conversionUuid: { $in: projects.map((p) => p.conversionUuid) },
  }).lean();
  const codeBy = Object.fromEntries(conversions.map((c) => [c.conversionUuid, c.publicCode]));
  const rollups = await Promise.all(projects.map((p) => projectRollup(String(p._id))));
  const pocIds = projects
    .map((p) => (p.primaryPocUserId ? String(p.primaryPocUserId) : ""))
    .filter(Boolean);
  const pocUsers = pocIds.length
    ? await StaffUser.find({ _id: { $in: pocIds } }).lean()
    : [];
  const pocById = Object.fromEntries(pocUsers.map((u) => [String(u._id), u]));
  const canWrite = hasPermission(staff.permissions, "projects:write");

  return (
    <OsPage
      title={filter === "due" ? "Due soon" : filter === "completed" ? "Completed" : filter === "active" ? "Active projects" : "Projects"}
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={
        canWrite ? <OsLink href="/admin/os/projects/new">Add project</OsLink> : undefined
      }
    >
      <OsTable>
        <thead>
          <tr>
            <Th>Project</Th>
            <Th>Conversion</Th>
            <Th>Primary POC</Th>
            <Th>Status</Th>
            <Th>Progress</Th>
            <Th>Delivery</Th>
            <Th>Outstanding</Th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => {
            const st = normalizeProjectStatus(p.status);
            const poc = p.primaryPocUserId
              ? pocById[String(p.primaryPocUserId)]
              : null;
            return (
              <tr key={String(p._id)}>
                <Td>
                  <Link href={`/admin/os/projects/${p._id}`} className="text-[var(--dash-accent)]">
                    {p.name}
                  </Link>
                </Td>
                <Td>
                  <Link href={`/admin/os/c/${codeBy[p.conversionUuid]}`}>
                    {codeBy[p.conversionUuid]}
                  </Link>
                </Td>
                <Td>{poc?.name || poc?.email || p.projectManager || "—"}</Td>
                <Td>
                  <OsBadge tone={projectTone(st)}>{PROJECT_STATUS_LABELS[st]}</OsBadge>
                </Td>
                <Td>{p.progress || 0}%</Td>
                <Td>{p.expectedDelivery ? formatDate(p.expectedDelivery) : "—"}</Td>
                <Td>{formatCurrencyINR(rollups[i]?.outstanding || 0)}</Td>
              </tr>
            );
          })}
        </tbody>
      </OsTable>
    </OsPage>
  );
}
