export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { resolvePortalByUuid } from "@/lib/os/resolve-portal";
import { Project } from "@/models/os/Project";
import { Milestone } from "@/models/os/Milestone";
import { OsTask } from "@/models/os/Task";
import { ProjectUpdate } from "@/models/os/ProjectUpdate";
import { Meeting } from "@/models/os/Meeting";
import { OsDocument } from "@/models/os/Document";
import { OsActionForm } from "@/components/os/OsActionForm";
import { completeClientTask } from "@/actions/os/portal";
import {
  MILESTONE_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  VISIBILITY_LEVEL_LABELS,
  normalizeProjectStatus,
  type MilestoneStatus,
  type VisibilityLevel,
} from "@/lib/os/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  PortalCard,
  PortalPageHeader,
  PortalSectionTitle,
} from "@/components/os/portal/ui";

export default async function ClientProjectDetailPage({
  params,
}: {
  params: Promise<{ uuid: string; id: string }>;
}) {
  const { uuid, id } = await params;
  const portal = await resolvePortalByUuid(uuid);
  if (!portal) notFound();

  const project = await Project.findOne({
    _id: id,
    conversionUuid: portal.conversion.conversionUuid,
    recordStatus: "active",
    status: { $ne: "cancelled" },
  }).lean();
  if (!project) notFound();

  const [milestones, tasks, updates, meetings, documents] = await Promise.all([
    Milestone.find({
      projectId: project._id,
      recordStatus: "active",
      visibleToClient: true,
    })
      .sort({ sortOrder: 1 })
      .lean(),
    OsTask.find({
      projectId: project._id,
      recordStatus: "active",
      visibleToClient: true,
      status: { $ne: "cancelled" },
    })
      .sort({ createdAt: -1 })
      .lean(),
    ProjectUpdate.find({
      projectId: project._id,
      recordStatus: "active",
      visibility: "client_visible",
      publishedAt: { $exists: true },
    })
      .sort({ publishedAt: -1 })
      .lean(),
    Meeting.find({
      projectId: project._id,
      recordStatus: "active",
      visibleToClient: true,
    })
      .sort({ startsAt: -1 })
      .lean(),
    OsDocument.find({
      projectId: project._id,
      recordStatus: "active",
      visibleToClient: true,
    })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return (
    <main className="px-4 py-10 sm:px-8">
      <Link
        href={`/client-portal/${uuid}/projects`}
        className="mb-4 inline-block font-inter text-sm text-[var(--dash-muted)] hover:text-[var(--dash-accent)]"
      >
        ← Back to projects
      </Link>
      <PortalPageHeader
        title={project.name}
        subtitle={`${PROJECT_STATUS_LABELS[normalizeProjectStatus(project.status)]} · ${project.progress || 0}% progress`}
      />
      {project.description ? (
        <p className="mb-8 max-w-3xl font-inter text-sm text-[var(--dash-muted)]">
          {project.description}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <PortalSectionTitle>Milestones</PortalSectionTitle>
          <ul className="space-y-3">
            {milestones.map((m) => (
              <li key={String(m._id)}>
                <PortalCard className="font-inter text-sm">
                  <p className="text-[var(--dash-text)]">{m.name}</p>
                  <p className="text-[var(--dash-muted)]">
                    {MILESTONE_STATUS_LABELS[m.status as MilestoneStatus]}
                    {m.dueDate ? ` · due ${formatDate(m.dueDate)}` : ""}
                  </p>
                  {m.description ? (
                    <p className="mt-2 text-[var(--dash-muted)]">
                      {m.description}
                    </p>
                  ) : null}
                </PortalCard>
              </li>
            ))}
          </ul>
          {milestones.length === 0 ? (
            <p className="font-inter text-sm text-[var(--dash-muted)]">
              No milestones shared yet.
            </p>
          ) : null}
        </section>

        <section>
          <PortalSectionTitle>Tasks</PortalSectionTitle>
          <ul className="space-y-3">
            {tasks.map((t) => (
              <li key={String(t._id)}>
                <PortalCard className="font-inter text-sm">
                  <p className="text-[var(--dash-text)]">{t.title}</p>
                  <p className="text-[var(--dash-muted)]">
                    {t.status}
                    {t.assignee ? ` · ${t.assignee}` : ""}
                    {t.dueDate ? ` · due ${formatDate(t.dueDate)}` : ""}
                  </p>
                  {t.description ? (
                    <p className="mt-2 text-[var(--dash-muted)]">
                      {t.description}
                    </p>
                  ) : null}
                  {t.clientActionRequired && t.status !== "completed" ? (
                    <div className="mt-3">
                      <OsActionForm
                        action={completeClientTask}
                        submitLabel="Mark complete"
                        className="space-y-2"
                      >
                        <input type="hidden" name="uuid" value={uuid} />
                        <input
                          type="hidden"
                          name="taskId"
                          value={String(t._id)}
                        />
                      </OsActionForm>
                    </div>
                  ) : null}
                </PortalCard>
              </li>
            ))}
          </ul>
          {tasks.length === 0 ? (
            <p className="font-inter text-sm text-[var(--dash-muted)]">
              No client-visible tasks yet.
            </p>
          ) : null}
        </section>

        <section>
          <PortalSectionTitle>Updates</PortalSectionTitle>
          <ul className="space-y-3">
            {updates.map((u) => (
              <li key={String(u._id)}>
                <PortalCard className="font-inter text-sm">
                  <p className="text-[var(--dash-text)]">{u.title}</p>
                  <p className="text-[var(--dash-muted)]">
                    {VISIBILITY_LEVEL_LABELS[u.visibility as VisibilityLevel]} ·{" "}
                    {formatDateTime(u.publishedAt || u.createdAt)}
                  </p>
                  {u.body ? (
                    <p className="mt-2 text-[var(--dash-muted)]">{u.body}</p>
                  ) : null}
                </PortalCard>
              </li>
            ))}
          </ul>
          {updates.length === 0 ? (
            <p className="font-inter text-sm text-[var(--dash-muted)]">
              No updates published yet.
            </p>
          ) : null}
        </section>

        <section>
          <PortalSectionTitle>Shared files & meetings</PortalSectionTitle>
          <PortalCard className="space-y-5 font-inter text-sm">
            <div>
              <p className="mb-2 text-[var(--dash-text)]">Meetings</p>
              <ul className="space-y-2">
                {meetings.map((m) => (
                  <li key={String(m._id)} className="text-[var(--dash-muted)]">
                    {m.title} · {formatDateTime(m.startsAt)}
                  </li>
                ))}
              </ul>
              {meetings.length === 0 ? (
                <p className="text-[var(--dash-muted)]">
                  No meetings shared yet.
                </p>
              ) : null}
            </div>
            <div>
              <p className="mb-2 text-[var(--dash-text)]">Documents</p>
              <ul className="space-y-2">
                {documents.map((d) => (
                  <li key={String(d._id)} className="text-[var(--dash-muted)]">
                    {d.title}
                    {d.dataBase64 ? (
                      <a
                        className="ml-2 text-[var(--dash-accent)]"
                        href={`data:${d.mimeType};base64,${d.dataBase64}`}
                        download={d.fileName || d.title}
                      >
                        Download
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
              {documents.length === 0 ? (
                <p className="text-[var(--dash-muted)]">
                  No documents shared yet.
                </p>
              ) : null}
            </div>
          </PortalCard>
        </section>
      </div>
    </main>
  );
}
