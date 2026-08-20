export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { Project } from "@/models/os/Project";
import { Conversion } from "@/models/os/Conversion";
import { Vendor } from "@/models/os/Vendor";
import { Meeting } from "@/models/os/Meeting";
import { OsTask } from "@/models/os/Task";
import { OsDocument } from "@/models/os/Document";
import { Invoice } from "@/models/os/Invoice";
import { ActivityEvent } from "@/models/os/ActivityEvent";
import { Milestone } from "@/models/os/Milestone";
import { ProjectUpdate } from "@/models/os/ProjectUpdate";
import { AuditLog } from "@/models/os/AuditLog";
import { uploadDocument } from "@/actions/os/documents";
import {
  createMilestone,
  seedDefaultMilestones,
  updateMilestoneStatus,
  updateMilestoneVisibility,
} from "@/actions/os/milestones";
import {
  createProjectUpdate,
  setProjectUpdateVisibility,
} from "@/actions/os/project-updates";
import { projectRollup } from "@/lib/os/rollups";
import { migrateLegacyProjectStatuses } from "@/lib/os/services/project-service";
import { calculateMilestoneProgress } from "@/lib/os/services/milestone-service";
import { OsActionForm } from "@/components/os/OsActionForm";
import {
  Field,
  OsBadge,
  OsLink,
  OsPage,
  osInputClass, osSelectClass,
  osTextareaClass,
  projectTone,
} from "@/components/os/ui";
import { OsDateInput } from "@/components/os/OsDateInput";
import {
  ProjectWorkspaceTabs,
  type ProjectWorkspaceTabId,
  PROJECT_WORKSPACE_TABS,
} from "@/components/os/ProjectWorkspaceTabs";
import {
  MILESTONE_STATUSES,
  MILESTONE_STATUS_LABELS,
  PROJECT_PRIORITIES,
  PROJECT_STATUS_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  VISIBILITY_LEVELS,
  VISIBILITY_LEVEL_LABELS,
  normalizeProjectStatus,
  type MilestoneStatus,
  type ProjectStatus,
} from "@/lib/os/constants";
import { formatCurrencyINR, formatDate, formatDateTime } from "@/lib/utils";
import { hasPermission } from "@/lib/os/permissions";
import { displayInvoiceStatus } from "@/lib/os/money";
import { PROJECT_TRANSITIONS } from "@/lib/os/transitions";
import { ActivityTimeline } from "@/components/os/ActivityTimeline";
import { TaskCard } from "@/components/os/TaskCard";
import { updateProject, addProjectMember, removeProjectMember } from "@/actions/os/projects";
import { createTask, updateTaskStatusAction, updateTaskVisibility } from "@/actions/os/tasks";

function formatDateInput(d: Date | string) {
  const date = new Date(d);
  return date.toISOString().slice(0, 10);
}

function parseTab(raw: string | undefined): ProjectWorkspaceTabId {
  const found = PROJECT_WORKSPACE_TABS.find((t) => t.id === raw);
  return found?.id ?? "overview";
}

export default async function ProjectWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const staff = await requireOsPage("projects:read");
  await migrateLegacyProjectStatuses();

  const { id } = await params;
  const { tab: tabRaw } = await searchParams;
  const tab = parseTab(tabRaw);

  const project = await Project.findById(id).lean();
  if (!project) notFound();

  const { canViewProject } = await import("@/lib/os/project-access");
  if (!(await canViewProject(staff, project))) notFound();

  const status = normalizeProjectStatus(project.status);
  const allowedNext = PROJECT_TRANSITIONS[status] ?? [];
  const statusOptions = Array.from(new Set([status, ...allowedNext]));

  const [
    conversion,
    vendor,
    meetings,
    tasks,
    documents,
    invoices,
    activity,
    milestones,
    updates,
    audits,
    rollup,
    members,
    allStaff,
  ] = await Promise.all([
      Conversion.findOne({ conversionUuid: project.conversionUuid }).lean(),
      Vendor.findById(project.vendorId).lean(),
      Meeting.find({ projectId: project._id, recordStatus: "active" }).sort({ startsAt: -1 }).lean(),
      OsTask.find({ projectId: project._id, recordStatus: "active" }).sort({ createdAt: -1 }).lean(),
      OsDocument.find({ projectId: project._id, recordStatus: "active" }).sort({ createdAt: -1 }).lean(),
      Invoice.find({ projectId: project._id, recordStatus: "active" }).sort({ createdAt: -1 }).lean(),
      ActivityEvent.find({ projectId: project._id }).sort({ createdAt: -1 }).limit(40).lean(),
      Milestone.find({ projectId: project._id, recordStatus: "active" }).sort({ sortOrder: 1 }).lean(),
      ProjectUpdate.find({ projectId: project._id, recordStatus: "active" })
        .sort({ createdAt: -1 })
        .lean(),
      AuditLog.find({ entityType: "project", entityId: String(project._id), field: "status" })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      projectRollup(id),
      (await import("@/models/os/ProjectMember")).ProjectMember.find({
        projectId: project._id,
      }).lean(),
      (await import("@/models/os/StaffUser")).StaffUser.find({}).lean(),
    ]);

  const staffById = Object.fromEntries(
    allStaff.map((u) => [String(u._id), u])
  );
  const pocUser = project.primaryPocUserId
    ? staffById[String(project.primaryPocUserId)]
    : null;
  const memberUsers = members
    .map((m) => staffById[String(m.userId)])
    .filter(Boolean);
  const activeStaff = allStaff.filter((u) => u.isActive);
  const memberIds = new Set(members.map((m) => String(m.userId)));
  if (project.primaryPocUserId) memberIds.add(String(project.primaryPocUserId));
  const assignable = activeStaff.filter((u) => memberIds.has(String(u._id)));

  const taskSummary = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo" || t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  const { resolveActorNames } = await import("@/lib/os/activity");
  const actorNames = await resolveActorNames(activity);

  const derivedProgress =
    milestones.length > 0
      ? calculateMilestoneProgress(
          milestones.map((m) => ({
            status: m.status as MilestoneStatus,
            weight: m.weight ?? 1,
          }))
        )
      : project.progress || 0;

  const canWrite = hasPermission(staff.permissions, "projects:write");
  const canMilestones = hasPermission(staff.permissions, "milestones:write");
  const canTasks = hasPermission(staff.permissions, "tasks:write");
  const canDocs = hasPermission(staff.permissions, "documents:write");
  const canUpdates = hasPermission(staff.permissions, "project_updates:write");
  const canInvoices = hasPermission(staff.permissions, "invoices:write");

  return (
    <OsPage
      title={project.name}
      subtitle={[
        conversion?.publicCode,
        vendor?.companyName,
        `${derivedProgress}%`,
      ]
        .filter(Boolean)
        .join(" · ")}
      backHref="/admin/os/projects"
      backLabel="Back to projects"
      actions={
        <>
          {conversion ? <OsLink href={`/admin/os/c/${conversion.publicCode}`}>Hub</OsLink> : null}
          {canWrite ? <OsLink href={`/admin/os/meetings/new?projectId=${id}`}>Add meeting</OsLink> : null}
          {canInvoices ? (
            <OsLink href={`/admin/os/invoices/new?projectId=${id}`}>Create invoice</OsLink>
          ) : null}
        </>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <OsBadge tone={projectTone(status)}>
          {PROJECT_STATUS_LABELS[status]}
        </OsBadge>
        <span className="font-inter text-sm text-[var(--dash-muted)]">
          Progress {derivedProgress}%
          {milestones.length > 0 ? " (from milestones)" : " (manual)"}
        </span>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 font-inter text-sm">
        <div className="rounded-2xl border border-[var(--dash-border)] p-4">
          <p className="font-archivo text-[11px] uppercase tracking-wide text-[var(--dash-muted)]">
            Primary POC
          </p>
          <p className="mt-1 font-archivo text-lg text-[var(--dash-text)]">
            {pocUser?.name || pocUser?.email || project.projectManager || "Not set"}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--dash-border)] p-4 sm:col-span-2">
          <p className="font-archivo text-[11px] uppercase tracking-wide text-[var(--dash-muted)]">
            Members
          </p>
          <p className="mt-1 text-[var(--dash-text)]">
            {memberUsers.length
              ? memberUsers.map((u) => u!.name || u!.email).join(", ")
              : project.assignedTeam || "No members yet"}
          </p>
        </div>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-4 font-inter text-sm">
      <div className="rounded-2xl border border-[var(--dash-border)] p-4">
          Contract{" "}
          <p className="font-archivo text-xl">{formatCurrencyINR(rollup.contract)}</p>
      </div>
      <div className="rounded-2xl border border-[var(--dash-border)] p-4">
          Invoiced{" "}
          <p className="font-archivo text-xl">{formatCurrencyINR(rollup.invoiced)}</p>
      </div>
      <div className="rounded-2xl border border-[var(--dash-border)] p-4">
          Received{" "}
          <p className="font-archivo text-xl">{formatCurrencyINR(rollup.received)}</p>
      </div>
      <div className="rounded-2xl border border-[var(--dash-border)] p-4">
          Outstanding{" "}
          <p className="font-archivo text-xl">{formatCurrencyINR(rollup.outstanding)}</p>
      </div>
      </div>
      <ProjectWorkspaceTabs projectId={id} active={tab} />

      {tab === "overview" ? (
        <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 font-inter text-sm text-[var(--dash-muted)]">
      <p>
              Client:{" "}
              <span className="text-[var(--dash-text)]">
                {vendor ? (
                  <Link href={`/admin/os/vendors/${vendor._id}`}>{vendor.companyName}</Link>
                ) : (
                  "—"
                )}
              </span>
      </p>
      <p>
              Primary POC:{" "}
              <span className="text-[var(--dash-text)]">
                {pocUser?.name || pocUser?.email || project.projectManager || "—"}
              </span>
            </p>
            <p>
              Members:{" "}
              <span className="text-[var(--dash-text)]">
                {memberUsers.length
                  ? memberUsers.map((u) => u!.name || u!.email).join(", ")
                  : project.assignedTeam || "—"}
              </span>
            </p>
            <p>
              Priority:{" "}
              <span className="text-[var(--dash-text)]">
                {project.priority || "medium"}
              </span>
            </p>
          </div>

          {canWrite ? (
            <OsActionForm
              action={updateProject}
              submitLabel="Save project"
              className="grid max-w-3xl gap-3 sm:grid-cols-2"
            >
              <input type="hidden" name="id" value={id} />
              <Field label="Name">
                <input name="name" defaultValue={project.name} className={osInputClass()} />
              </Field>
              <Field label="Service">
                <input name="service" defaultValue={project.service} className={osInputClass()} />
              </Field>
              <Field label="Status">
                <select name="status" defaultValue={status} className={osSelectClass()}>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {PROJECT_STATUS_LABELS[s as ProjectStatus]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status reason (required for blocked/cancelled)">
                <input name="statusReason" className={osInputClass()} placeholder="Optional unless blocked/cancelled" />
              </Field>
              <Field label="Priority">
                <select
                  name="priority"
                  defaultValue={project.priority || "medium"}
                  className={osSelectClass()}
                >
                  {PROJECT_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Primary POC">
                <select
                  name="primaryPocUserId"
                  defaultValue={
                    project.primaryPocUserId ? String(project.primaryPocUserId) : ""
                  }
                  className={osSelectClass()}
                >
                  <option value="">Select POC</option>
                  {activeStaff.map((u) => (
                    <option key={String(u._id)} value={String(u._id)}>
                      {u.name || u.email}
                    </option>
                  ))}
                </select>
              </Field>
              {milestones.length === 0 ? (
                <Field label="Progress % (manual — add milestones to auto-calculate)">
                  <input
                    type="number"
                    name="progress"
                    defaultValue={project.progress}
                    className={osInputClass()}
                  />
                </Field>
              ) : (
                <div className="sm:col-span-2 rounded-xl border border-[var(--dash-border)] p-3 font-inter text-sm text-[var(--dash-muted)]">
                  Progress is calculated from milestones ({derivedProgress}%). Edit milestones to change it.
                </div>
              )}
              <Field label="Start">
                <OsDateInput
                  name="startDate"
                  defaultValue={project.startDate ? formatDateInput(project.startDate) : ""}
                />
              </Field>
              <Field label="Expected delivery">
                <OsDateInput
                  name="expectedDelivery"
                  defaultValue={
                    project.expectedDelivery ? formatDateInput(project.expectedDelivery) : ""
                  }
                />
              </Field>
              <Field label="Actual completion">
                <OsDateInput
                  name="actualCompletion"
                  defaultValue={
                    project.actualCompletion ? formatDateInput(project.actualCompletion) : ""
                  }
                />
              </Field>
              <Field label="Budget">
                <input
                  type="number"
                  name="budget"
                  defaultValue={project.budget}
                  className={osInputClass()}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea
                    name="description"
                    defaultValue={project.description}
                    className={osTextareaClass()}
                  />
                </Field>
              </div>
            </OsActionForm>
          ) : null}

          {canWrite ? (
            <div className="grid max-w-3xl gap-4 rounded-2xl border border-[var(--dash-border)] p-4">
              <h3 className="font-archivo text-sm uppercase tracking-wide">Members</h3>
              <ul className="space-y-2 font-inter text-sm">
                {memberUsers.map((u) => (
                  <li key={String(u!._id)} className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      {u!.name || u!.email}
                      {project.primaryPocUserId &&
                      String(project.primaryPocUserId) === String(u!._id)
                        ? " (POC)"
                        : ""}
                    </span>
                    <OsActionForm
                      action={removeProjectMember}
                      submitLabel="Remove"
                      className="flex flex-wrap items-center gap-2"
                    >
                      <input type="hidden" name="projectId" value={id} />
                      <input type="hidden" name="userId" value={String(u!._id)} />
                      <select name="taskDisposition" className={osSelectClass()}>
                        <option value="keep">Keep task assignments</option>
                        <option value="reassign">Reassign open tasks</option>
                      </select>
                      <select name="reassignToUserId" className={osSelectClass()}>
                        <option value="">Reassign to…</option>
                        {assignable
                          .filter((a) => String(a._id) !== String(u!._id))
                          .map((a) => (
                            <option key={String(a._id)} value={String(a._id)}>
                              {a.name || a.email}
                            </option>
                          ))}
                      </select>
                    </OsActionForm>
                  </li>
                ))}
              </ul>
              <OsActionForm
                action={addProjectMember}
                submitLabel="Add member"
                className="flex flex-wrap items-end gap-2"
              >
                <input type="hidden" name="projectId" value={id} />
                <Field label="Add member">
                  <select name="userId" required className={osSelectClass()}>
                    <option value="">Select user</option>
                    {activeStaff
                      .filter((u) => !memberIds.has(String(u._id)))
                      .map((u) => (
                        <option key={String(u._id)} value={String(u._id)}>
                          {u.name || u.email}
                        </option>
                      ))}
                  </select>
                </Field>
              </OsActionForm>
            </div>
          ) : null}

          {audits.length > 0 ? (
            <div>
      <h3 className="mb-2 font-archivo text-xs uppercase text-[var(--dash-faint)]">
                Status audit
              </h3>
      <ul className="space-y-2 font-inter text-sm text-[var(--dash-muted)]">
                {audits.map((a) => (
                  <li key={String(a._id)}>
                    {a.oldValue} → {a.newValue} · {a.createdBy} · {formatDateTime(a.createdAt)}
                    {a.reason ? ` · ${a.reason}` : ""}
                  </li>
                ))}
              </ul>
      </div>
          ) : null}
        </section>
      ) : null}

      {tab === "tracking" ? (
        <section className="space-y-8">
      <div>
      <div className="mb-3 flex items-center justify-between">
      <h2 className="font-archivo text-sm uppercase">Milestone timeline</h2>
      <p className="font-inter text-sm text-[var(--dash-muted)]">{derivedProgress}%</p>
      </div>
            {milestones.length === 0 ? (
              <div className="space-y-3">
      <p className="font-inter text-sm text-[var(--dash-muted)]">
                  No milestones yet. Seed the default Discovery → Launch track or add custom ones.
                </p>
                {canMilestones ? (
                  <OsActionForm action={seedDefaultMilestones} submitLabel="Seed default milestones">
      <input type="hidden" name="projectId" value={id} />
      </OsActionForm>
                ) : null}
              </div>
            ) : (
              <ol className="space-y-3">
                {milestones.map((m) => {
                  const done = m.status === "completed";
                  const active = m.status === "in_progress";
                  return (
                    <li
                      key={String(m._id)}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--dash-border)] p-4"
                    >
      <div>
      <p className="font-inter text-sm text-[var(--dash-text)]">
                          {done ? "✓ " : active ? "● " : "○ "}
                          {m.name}
                        </p>
      <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
                          {MILESTONE_STATUS_LABELS[m.status as MilestoneStatus]}
                          {m.visibleToClient ? " · client visible" : " · internal"}
                          {m.dueDate ? ` · due ${formatDate(m.dueDate)}` : ""}
                        </p>
      </div>
                      {canMilestones ? (
                        <OsActionForm
                          action={updateMilestoneStatus}
                          submitLabel="Set"
                          className="flex flex-wrap items-end gap-2"
                        >
      <input type="hidden" name="id" value={String(m._id)} />
      <select
                            name="status"
                            defaultValue={m.status}
                            className={osSelectClass()}
                          >
                            {MILESTONE_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {MILESTONE_STATUS_LABELS[s]}
                              </option>
                            ))}
                          </select>
      </OsActionForm>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
      <div>
      <h2 className="mb-3 font-archivo text-sm uppercase">Project updates</h2>
            {canUpdates ? (
              <OsActionForm
                action={createProjectUpdate}
                submitLabel="Publish update"
                className="mb-4 grid max-w-2xl gap-2"
              >
      <input type="hidden" name="projectId" value={id} />
      <input type="hidden" name="publish" value="true" />
      <input name="title" required placeholder="Update title" className={osInputClass()} />
      <textarea name="body" placeholder="What changed…" className={osTextareaClass()} />
      <select name="visibility" defaultValue="client_visible" className={osSelectClass()}>
                  {VISIBILITY_LEVELS.map((v) => (
                    <option key={v} value={v}>
                      {VISIBILITY_LEVEL_LABELS[v]}
                    </option>
                  ))}
                </select>
      </OsActionForm>
            ) : null}
            <ul className="space-y-2 font-inter text-sm">
              {updates.map((u) => (
                <li key={String(u._id)} className="rounded-xl border border-[var(--dash-border)] p-3">
      <p className="text-[var(--dash-text)]">{u.title}</p>
      <p className="text-xs text-[var(--dash-muted)]">
                    {VISIBILITY_LEVEL_LABELS[u.visibility as keyof typeof VISIBILITY_LEVEL_LABELS]} ·{" "}
                    {formatDateTime(u.createdAt)}
                  </p>
                  {u.body ? (
                    <p className="mt-1 text-[var(--dash-muted)]">{u.body}</p>
                  ) : null}
                </li>
              ))}
            </ul>
      </div>
      </section>
      ) : null}

      {tab === "milestones" ? (
        <section className="space-y-6">
          {canMilestones ? (
            <>
              {milestones.length === 0 ? (
                <OsActionForm action={seedDefaultMilestones} submitLabel="Seed Discovery → Launch">
      <input type="hidden" name="projectId" value={id} />
      </OsActionForm>
              ) : null}
              <OsActionForm
                action={createMilestone}
                submitLabel="Add milestone"
                className="grid max-w-2xl gap-2 sm:grid-cols-2"
              >
      <input type="hidden" name="projectId" value={id} />
      <Field label="Name">
      <input name="name" required className={osInputClass()} />
      </Field>
      <Field label="Weight">
      <input name="weight" type="number" defaultValue={1} className={osInputClass()} />
      </Field>
      <Field label="Due">
        <OsDateInput name="dueDate" />
      </Field>
      <label className="flex items-center gap-2 self-end font-inter text-sm">
      <input type="checkbox" name="visibleToClient" defaultChecked />
                  Visible to client
                </label>
      <div className="sm:col-span-2">
      <Field label="Description">
      <textarea name="description" className={osTextareaClass()} />
      </Field>
      </div>
      </OsActionForm>
      </>
          ) : null}
          <ul className="space-y-3">
            {milestones.map((m) => (
              <li
                key={String(m._id)}
                className="rounded-2xl border border-[var(--dash-border)] p-4 font-inter text-sm"
              >
      <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-[var(--dash-text)]">
                    {m.name}{" "}
                    <OsBadge>
                      {MILESTONE_STATUS_LABELS[m.status as MilestoneStatus]}
                    </OsBadge>
      </p>
      <span className="text-xs text-[var(--dash-muted)]">weight {m.weight ?? 1}</span>
      </div>
                {canMilestones ? (
                  <div className="mt-3 flex flex-wrap gap-4">
      <OsActionForm
                      action={updateMilestoneStatus}
                      submitLabel="Update status"
                      className="flex items-end gap-2"
                    >
      <input type="hidden" name="id" value={String(m._id)} />
      <select name="status" defaultValue={m.status} className={osSelectClass()}>
                        {MILESTONE_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {MILESTONE_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
      </OsActionForm>
      </div>
                ) : null}
              </li>
            ))}
          </ul>
      </section>
      ) : null}

      {tab === "tasks" ? (
        <section className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-5">
            <div className="rounded-xl border border-[var(--dash-border)] p-3 font-inter text-sm">
              Total <p className="font-archivo text-xl">{taskSummary.total}</p>
            </div>
            <div className="rounded-xl border border-[var(--dash-border)] p-3 font-inter text-sm">
              To do <p className="font-archivo text-xl">{taskSummary.todo}</p>
            </div>
            <div className="rounded-xl border border-[var(--dash-border)] p-3 font-inter text-sm">
              In progress <p className="font-archivo text-xl">{taskSummary.in_progress}</p>
            </div>
            <div className="rounded-xl border border-[var(--dash-border)] p-3 font-inter text-sm">
              Blocked <p className="font-archivo text-xl">{taskSummary.blocked}</p>
            </div>
            <div className="rounded-xl border border-[var(--dash-border)] p-3 font-inter text-sm">
              Completed <p className="font-archivo text-xl">{taskSummary.completed}</p>
            </div>
          </div>
          {canTasks ? (
            <OsActionForm action={createTask} submitLabel="Add task" className="grid max-w-xl gap-2">
              <input type="hidden" name="projectId" value={id} />
              <input name="title" required placeholder="Task title" className={osInputClass()} />
              <select name="assignedToId" required className={osSelectClass()}>
                <option value="">Assign to…</option>
                {assignable.map((u) => (
                  <option key={String(u._id)} value={String(u._id)}>
                    {u.name || u.email}
                  </option>
                ))}
              </select>
              <select name="priority" defaultValue="medium" className={osSelectClass()}>
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {TASK_PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
              <select name="ownerSide" className={osSelectClass()}>
                <option value="editco">Editco</option>
                <option value="client">Client</option>
              </select>
              <label className="flex items-center gap-2 font-inter text-sm">
                <input type="checkbox" name="visibleToClient" /> Visible to client
              </label>
            </OsActionForm>
          ) : null}
          <div className="grid gap-3">
            {tasks.map((t) => (
              <div key={String(t._id)} className="space-y-2">
                <TaskCard
                  task={t}
                  projectName={project.name}
                  assigneeName={
                    t.assignedToId
                      ? staffById[String(t.assignedToId)]?.name ||
                        staffById[String(t.assignedToId)]?.email ||
                        t.assignee
                      : t.assignee
                  }
                />
                {canTasks ? (
                  <OsActionForm
                    action={updateTaskStatusAction}
                    submitLabel="Update status"
                    className="flex items-end gap-2 px-1"
                  >
                    <input type="hidden" name="id" value={String(t._id)} />
                    <select name="status" defaultValue={t.status === "pending" ? "todo" : t.status} className={osSelectClass()}>
                      {TASK_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {TASK_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </OsActionForm>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "meetings" ? (
        <section>
      <ul className="space-y-2 font-inter text-sm">
            {meetings.map((m) => (
              <li key={String(m._id)}>
      <Link href={`/admin/os/meetings/${m._id}`} className="text-[var(--dash-accent)]">
                  {m.title}
                </Link>{" "}
                · {formatDateTime(m.startsAt)}
                {m.visibleToClient ? " · client visible" : " · internal"}
              </li>
            ))}
          </ul>
          {meetings.length === 0 ? (
            <p className="font-inter text-sm text-[var(--dash-muted)]">No meetings yet.</p>
          ) : null}
        </section>
      ) : null}

      {tab === "files" ? (
        <section>
          {canDocs ? (
            <OsActionForm action={uploadDocument} submitLabel="Upload" className="mb-4 max-w-xl space-y-2">
      <input type="hidden" name="conversionUuid" value={project.conversionUuid} />
      <input type="hidden" name="projectId" value={id} />
      <input name="title" required placeholder="Title" className={osInputClass()} />
      <input type="file" name="file" className="text-sm" />
      <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name="visibleToClient" /> Visible to client
              </label>
      </OsActionForm>
          ) : null}
          <ul className="font-inter text-sm space-y-1">
            {documents.map((d) => (
              <li key={String(d._id)}>
                {d.title}
                {d.visibleToClient ? " · client" : " · internal"}
              </li>
            ))}
          </ul>
      </section>
      ) : null}

      {tab === "invoices" ? (
        <section>
      <ul className="space-y-1 font-inter text-sm">
            {invoices.map((i) => (
              <li key={String(i._id)}>
      <Link href={`/admin/os/invoices/${i._id}`}>{i.invoiceNumber}</Link>{" "}
                {displayInvoiceStatus({
                  status: i.status,
                  dueDate: i.dueDate,
                  amountPaid: i.amountPaid || 0,
                  total: i.total || 0,
                })}
              </li>
            ))}
          </ul>
      </section>
      ) : null}

      {tab === "activity" ? (
        <section>
          <ActivityTimeline events={activity} actorNames={actorNames} />
        </section>
      ) : null}

      {tab === "visibility" ? (
        <section className="space-y-8">
      <p className="font-inter text-sm text-[var(--dash-muted)]">
            Only items marked client-visible appear in the client portal. Internal notes and private
            tasks stay admin-only.
          </p>
      <div>
      <h3 className="mb-3 font-archivo text-sm uppercase">Milestones</h3>
      <ul className="space-y-2">
              {milestones.map((m) => (
                <li
                  key={String(m._id)}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--dash-border)] px-3 py-2 font-inter text-sm"
                >
      <span>{m.name}</span>
                  {canMilestones ? (
                    <OsActionForm
                      action={updateMilestoneVisibility}
                      submitLabel="Save"
                      className="flex items-center gap-2"
                    >
      <input type="hidden" name="id" value={String(m._id)} />
      <label className="flex items-center gap-2">
      <input
                          type="checkbox"
                          name="visibleToClient"
                          defaultChecked={m.visibleToClient}
                        />
                        Client visible
                      </label>
      </OsActionForm>
                  ) : (
                    <span className="text-[var(--dash-muted)]">
                      {m.visibleToClient ? "client" : "internal"}
                    </span>
                  )}
                </li>
              ))}
            </ul>
      </div>
      <div>
      <h3 className="mb-3 font-archivo text-sm uppercase">Tasks</h3>
      <ul className="space-y-2">
              {tasks.map((t) => (
                <li
                  key={String(t._id)}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--dash-border)] px-3 py-2 font-inter text-sm"
                >
      <span>{t.title}</span>
                  {canTasks ? (
                    <OsActionForm
                      action={updateTaskVisibility}
                      submitLabel="Save"
                      className="flex flex-wrap items-center gap-3"
                    >
      <input type="hidden" name="id" value={String(t._id)} />
      <label className="flex items-center gap-2">
      <input
                          type="checkbox"
                          name="visibleToClient"
                          defaultChecked={t.visibleToClient}
                        />
                        Client visible
                      </label>
      <label className="flex items-center gap-2">
      <input
                          type="checkbox"
                          name="clientActionRequired"
                          defaultChecked={t.clientActionRequired}
                        />
                        Action required
                      </label>
      </OsActionForm>
                  ) : null}
                </li>
              ))}
            </ul>
      </div>
      <div>
      <h3 className="mb-3 font-archivo text-sm uppercase">Updates</h3>
      <ul className="space-y-2">
              {updates.map((u) => (
                <li
                  key={String(u._id)}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--dash-border)] px-3 py-2 font-inter text-sm"
                >
      <span>{u.title}</span>
                  {canUpdates ? (
                    <OsActionForm
                      action={setProjectUpdateVisibility}
                      submitLabel="Set"
                      className="flex items-end gap-2"
                    >
      <input type="hidden" name="id" value={String(u._id)} />
      <select
                        name="visibility"
                        defaultValue={u.visibility}
                        className={osSelectClass()}
                      >
                        {VISIBILITY_LEVELS.map((v) => (
                          <option key={v} value={v}>
                            {VISIBILITY_LEVEL_LABELS[v]}
                          </option>
                        ))}
                      </select>
      </OsActionForm>
                  ) : null}
                </li>
              ))}
            </ul>
      </div>
      <div>
      <h3 className="mb-3 font-archivo text-sm uppercase">Files / meetings</h3>
      <p className="font-inter text-sm text-[var(--dash-muted)]">
              Toggle visibility on each file upload or meeting detail page.{" "}
              {documents.filter((d) => d.visibleToClient).length} client-visible files ·{" "}
              {meetings.filter((m) => m.visibleToClient).length} client-visible meetings.
            </p>
      </div>
      </section>
      ) : null}
    </OsPage>
  );
}
