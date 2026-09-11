export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { Project } from "@/models/os/Project";
import { Conversion } from "@/models/os/Conversion";
import { StaffUser } from "@/models/os/StaffUser";
import { ACTIVE_PROJECT_STATUSES, PROJECT_STATUS_LABELS, normalizeProjectStatus } from "@/lib/os/constants";
import { OsBadge, OsLink, OsPage, OsTable, Td, Th, projectTone } from "@/components/os/ui";
import { cn, formatDate, formatCurrencyINR } from "@/lib/utils";
import { projectRollup } from "@/lib/os/rollups";
import { migrateLegacyProjectStatuses } from "@/lib/os/services/project-service";
import { projectIdsForStaff } from "@/lib/os/project-access";
import { hasPermission } from "@/lib/os/permissions";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import { archiveProject } from "@/actions/os/projects";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const staff = await requireOsPage("projects:read");
  await migrateLegacyProjectStatuses();
  const { filter } = await searchParams;
  const currentFilter = filter || "all";
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 86400000);

  const scoped = await projectIdsForStaff(staff);
  const allProjects =
    scoped === "all"
      ? await Project.find({ recordStatus: "active" }).sort({ updatedAt: -1 }).lean()
      : scoped.length === 0
        ? []
        : await Project.find({
            recordStatus: "active",
            _id: { $in: scoped },
          })
            .sort({ updatedAt: -1 })
            .lean();

  const totalCount = allProjects.length;
  const activeCount = allProjects.filter((p) =>
    ACTIVE_PROJECT_STATUSES.includes(normalizeProjectStatus(p.status))
  ).length;
  const dueCount = allProjects.filter(
    (p) =>
      p.expectedDelivery &&
      new Date(p.expectedDelivery) <= in7 &&
      new Date(p.expectedDelivery) >= now
  ).length;
  const completedCount = allProjects.filter(
    (p) => normalizeProjectStatus(p.status) === "completed"
  ).length;

  let projects = allProjects;
  if (currentFilter === "active") {
    projects = allProjects.filter((p) =>
      ACTIVE_PROJECT_STATUSES.includes(normalizeProjectStatus(p.status))
    );
  } else if (currentFilter === "completed") {
    projects = allProjects.filter((p) => normalizeProjectStatus(p.status) === "completed");
  } else if (currentFilter === "due") {
    projects = allProjects.filter(
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

  const filterTabs = [
    { key: "all", label: "All Projects", count: totalCount, href: "/admin/os/projects" },
    { key: "active", label: "Active", count: activeCount, href: "/admin/os/projects?filter=active" },
    { key: "due", label: "Due Soon", count: dueCount, href: "/admin/os/projects?filter=due" },
    { key: "completed", label: "Completed", count: completedCount, href: "/admin/os/projects?filter=completed" },
  ];

  return (
    <OsPage
      title="Projects"
      subtitle="Manage deliverables, milestones, and status across all client conversions."
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={
        canWrite ? <OsLink href="/admin/os/projects/new">+ Add Project</OsLink> : undefined
      }
    >
      {/* Segmented Filter Buttons */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {filterTabs.map((tab) => {
          const isActive = currentFilter === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 font-inter text-[13px] font-semibold transition-all",
                isActive
                  ? "bg-[#111111] text-white shadow-sm ring-1 ring-[#111111]"
                  : "border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-muted)] hover:border-[var(--dash-border)] hover:bg-black/5 hover:text-[var(--dash-text)]"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-bold",
                  isActive
                    ? "bg-[#c8f542]/20 text-[#c8f542]"
                    : "bg-black/5 text-[var(--dash-faint)]"
                )}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

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
            <Th>Delete</Th>
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-center font-inter text-sm text-[var(--dash-muted)]">
                No projects found for filter &ldquo;{currentFilter}&rdquo;.
              </td>
            </tr>
          ) : (
            projects.map((p, i) => {
              const st = normalizeProjectStatus(p.status);
              const poc = p.primaryPocUserId
                ? pocById[String(p.primaryPocUserId)]
                : null;
              return (
                <tr key={String(p._id)}>
                  <Td>
                    <Link href={`/admin/os/projects/${p._id}`} className="font-semibold text-[var(--dash-text)] hover:underline">
                      {p.name}
                    </Link>
                  </Td>
                  <Td>
                    <Link href={`/admin/os/c/${codeBy[p.conversionUuid]}`} className="font-mono text-xs uppercase tracking-wider text-[var(--dash-muted)] hover:text-[var(--dash-text)]">
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
                  <Td>
                    {canWrite ? (
                      <RowDeleteButton
                        action={archiveProject}
                        id={String(p._id)}
                        confirmMessage={`Delete project "${p.name}"?`}
                      />
                    ) : null}
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </OsTable>
    </OsPage>
  );
}
