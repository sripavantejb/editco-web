export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { OsTask } from "@/models/os/Task";
import { Project } from "@/models/os/Project";
import { StaffUser } from "@/models/os/StaffUser";
import { TaskWorkSession } from "@/models/os/TaskWorkSession";
import { TaskDependency } from "@/models/os/TaskDependency";
import { TaskComment } from "@/models/os/TaskComment";
import { ActivityEvent } from "@/models/os/ActivityEvent";
import { ProjectMember } from "@/models/os/ProjectMember";
import {
  updateTask,
  updateTaskStatusAction,
  startTask,
  pauseTask,
  completeTask,
  addTaskComment,
  addTaskDependency,
  removeTaskDependency,
  migrateTaskStatuses,
} from "@/actions/os/tasks";
import { canViewProject } from "@/lib/os/project-access";
import { resolveActorNames } from "@/lib/os/activity";
import { hasPermission } from "@/lib/os/permissions";
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
} from "@/lib/os/constants";
import { OsActionForm } from "@/components/os/OsActionForm";
import { ActivityTimeline } from "@/components/os/ActivityTimeline";
import {
  Field,
  OsBadge,
  OsPage,
  osInputClass,
  osSelectClass,
  osTextareaClass,
} from "@/components/os/ui";
import { OsDateInput } from "@/components/os/OsDateInput";
import { formatDateTime } from "@/lib/utils";
import {
  exceededPlanned,
  formatDurationMs,
  plannedDurationMs,
  sumSessionDurations,
} from "@/lib/os/task-timing";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireOsPage("tasks:read");
  await migrateTaskStatuses();
  const { id } = await params;
  const task = await OsTask.findById(id).lean();
  if (!task || task.recordStatus !== "active") notFound();

  const project = task.projectId
    ? await Project.findById(task.projectId).lean()
    : null;
  if (project && !(await canViewProject(staff, project))) notFound();

  const canWrite = hasPermission(staff.permissions, "tasks:write");

  const [
    sessions,
    deps,
    comments,
    activity,
    members,
    projectTasks,
    allStaff,
  ] = await Promise.all([
    TaskWorkSession.find({ taskId: task._id }).sort({ startedAt: -1 }).lean(),
    TaskDependency.find({ taskId: task._id }).lean(),
    TaskComment.find({ taskId: task._id }).sort({ createdAt: 1 }).lean(),
    ActivityEvent.find({ entityType: "task", entityId: String(task._id) })
      .sort({ createdAt: -1 })
      .limit(40)
      .lean(),
    project
      ? ProjectMember.find({ projectId: project._id }).lean()
      : Promise.resolve([]),
    project
      ? OsTask.find({
          projectId: project._id,
          recordStatus: "active",
          _id: { $ne: task._id },
        })
          .select("title status")
          .lean()
      : Promise.resolve([]),
    StaffUser.find({}).lean(),
  ]);

  const staffById = Object.fromEntries(allStaff.map((u) => [String(u._id), u]));
  const memberIds = new Set(members.map((m) => String(m.userId)));
  if (project?.primaryPocUserId) memberIds.add(String(project.primaryPocUserId));
  const assignable = allStaff.filter(
    (u) => u.isActive && (memberIds.size === 0 || memberIds.has(String(u._id)))
  );
  const assignee = task.assignedToId
    ? staffById[String(task.assignedToId)]
    : null;
  const blockerTasks = await OsTask.find({
    _id: { $in: deps.map((d) => d.dependsOnTaskId) },
  }).lean();
  const blockerById = Object.fromEntries(
    blockerTasks.map((t) => [String(t._id), t])
  );
  const actorNames = await resolveActorNames(activity);
  const actualMs = sumSessionDurations(sessions);
  const plannedMs = plannedDurationMs(task.plannedStartTime, task.plannedEndTime);
  const over = exceededPlanned(
    actualMs,
    task.plannedStartTime,
    task.plannedEndTime
  );
  const openSession = sessions.find((s) => !s.endedAt);
  const status = task.status === "pending" ? "todo" : task.status;

  return (
    <OsPage
      title={task.title}
      subtitle={project ? project.name : "No project"}
      backHref="/admin/os/tasks"
      backLabel="Back to tasks"
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <OsBadge tone="accent">
          {TASK_STATUS_LABELS[status as keyof typeof TASK_STATUS_LABELS] || status}
        </OsBadge>
        <OsBadge>
          {TASK_PRIORITY_LABELS[(task.priority as keyof typeof TASK_PRIORITY_LABELS) || "medium"]}
        </OsBadge>
        {assignee ? (
          <span className="font-inter text-sm text-[var(--dash-muted)]">
            Assigned to {assignee.name || assignee.email}
          </span>
        ) : null}
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--dash-border)] p-4">
          <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide">Timing</h2>
          <dl className="space-y-2 font-inter text-sm">
            <div>
              Planned:{" "}
              {task.plannedStartTime && task.plannedEndTime
                ? `${formatDateTime(task.plannedStartTime)} – ${formatDateTime(task.plannedEndTime)}`
                : "—"}
              {plannedMs != null ? ` (${formatDurationMs(plannedMs)})` : ""}
            </div>
            <div>
              Actual:{" "}
              {task.actualStartTime
                ? `${formatDateTime(task.actualStartTime)}${
                    task.actualEndTime
                      ? ` – ${formatDateTime(task.actualEndTime)}`
                      : " – ongoing"
                  }`
                : "—"}
            </div>
            <div className={over ? "text-red-500" : ""}>
              Duration: {formatDurationMs(actualMs)}
              {over ? " (exceeded planned)" : ""}
            </div>
          </dl>
          {canWrite ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {!openSession ? (
                <OsActionForm action={startTask} submitLabel="Start task">
                  <input type="hidden" name="id" value={id} />
                  <label className="mr-2 flex items-center gap-1 font-inter text-xs">
                    <input type="checkbox" name="overrideDeps" value="true" />
                    Override deps
                  </label>
                </OsActionForm>
              ) : (
                <OsActionForm action={pauseTask} submitLabel="Pause">
                  <input type="hidden" name="id" value={id} />
                </OsActionForm>
              )}
              {status !== "completed" ? (
                <OsActionForm action={completeTask} submitLabel="Complete">
                  <input type="hidden" name="id" value={id} />
                </OsActionForm>
              ) : null}
            </div>
          ) : null}
          <ul className="mt-4 space-y-1 font-inter text-xs text-[var(--dash-muted)]">
            {sessions.map((s) => (
              <li key={String(s._id)}>
                {formatDateTime(s.startedAt)}
                {s.endedAt ? ` – ${formatDateTime(s.endedAt)}` : " – open"}
                {s.durationMs ? ` · ${formatDurationMs(s.durationMs)}` : ""}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--dash-border)] p-4">
          <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide">Status</h2>
          {canWrite ? (
            <OsActionForm
              action={updateTaskStatusAction}
              submitLabel="Update status"
              className="grid gap-2"
            >
              <input type="hidden" name="id" value={id} />
              <select name="status" defaultValue={status} className={osSelectClass()}>
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {TASK_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 font-inter text-xs">
                <input type="checkbox" name="overrideDeps" value="true" />
                Override incomplete dependencies
              </label>
            </OsActionForm>
          ) : (
            <p className="font-inter text-sm">{TASK_STATUS_LABELS[status as keyof typeof TASK_STATUS_LABELS]}</p>
          )}
        </section>
      </div>

      {canWrite ? (
        <OsActionForm
          action={updateTask}
          submitLabel="Save task"
          className="mb-8 grid max-w-2xl gap-3 rounded-2xl border border-[var(--dash-border)] p-4 sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={id} />
          <Field label="Title">
            <input name="title" defaultValue={task.title} className={osInputClass()} />
          </Field>
          <Field label="Assignee">
            <select
              name="assignedToId"
              defaultValue={task.assignedToId ? String(task.assignedToId) : ""}
              className={osSelectClass()}
            >
              {assignable.map((u) => (
                <option key={String(u._id)} value={String(u._id)}>
                  {u.name || u.email}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              name="priority"
              defaultValue={task.priority || "medium"}
              className={osSelectClass()}
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {TASK_PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Due date">
            <OsDateInput
              name="dueDate"
              defaultValue={
                task.dueDate
                  ? new Date(task.dueDate).toISOString().slice(0, 10)
                  : ""
              }
            />
          </Field>
          <Field label="Planned start">
            <input
              type="datetime-local"
              name="plannedStartTime"
              defaultValue={
                task.plannedStartTime
                  ? new Date(task.plannedStartTime).toISOString().slice(0, 16)
                  : ""
              }
              className={osInputClass()}
            />
          </Field>
          <Field label="Planned end">
            <input
              type="datetime-local"
              name="plannedEndTime"
              defaultValue={
                task.plannedEndTime
                  ? new Date(task.plannedEndTime).toISOString().slice(0, 16)
                  : ""
              }
              className={osInputClass()}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea
                name="description"
                defaultValue={task.description}
                className={osTextareaClass()}
              />
            </Field>
          </div>
        </OsActionForm>
      ) : (
        <p className="mb-8 font-inter text-sm text-[var(--dash-muted)]">
          {task.description || "No description."}
        </p>
      )}

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--dash-border)] p-4">
          <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide">
            Dependencies
          </h2>
          <ul className="mb-4 space-y-2 font-inter text-sm">
            {deps.map((d) => {
              const b = blockerById[String(d.dependsOnTaskId)];
              return (
                <li key={String(d._id)} className="flex items-center justify-between gap-2">
                  <span>
                    Blocked by{" "}
                    {b ? (
                      <Link
                        href={`/admin/os/tasks/${b._id}`}
                        className="text-[var(--dash-accent)]"
                      >
                        {b.title}
                      </Link>
                    ) : (
                      "Unknown"
                    )}{" "}
                    ({b?.status || "?"})
                  </span>
                  {canWrite ? (
                    <OsActionForm
                      action={removeTaskDependency}
                      submitLabel="Remove"
                    >
                      <input type="hidden" name="dependencyId" value={String(d._id)} />
                    </OsActionForm>
                  ) : null}
                </li>
              );
            })}
            {deps.length === 0 ? (
              <li className="text-[var(--dash-muted)]">No dependencies.</li>
            ) : null}
          </ul>
          {canWrite && projectTasks.length > 0 ? (
            <OsActionForm
              action={addTaskDependency}
              submitLabel="Add dependency"
              className="flex flex-wrap gap-2"
            >
              <input type="hidden" name="taskId" value={id} />
              <select name="dependsOnTaskId" required className={osSelectClass()}>
                <option value="">Depends on…</option>
                {projectTasks.map((t) => (
                  <option key={String(t._id)} value={String(t._id)}>
                    {t.title}
                  </option>
                ))}
              </select>
            </OsActionForm>
          ) : null}
        </div>

        <div className="rounded-2xl border border-[var(--dash-border)] p-4">
          <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide">
            Conversation
          </h2>
          <ul className="mb-4 max-h-80 space-y-3 overflow-y-auto">
            {comments.map((c) => {
              const u = staffById[String(c.userId)];
              return (
                <li key={String(c._id)} className="font-inter text-sm">
                  <p className="font-medium text-[var(--dash-text)]">
                    {u?.name || u?.email || "User"}
                    <span className="ml-2 font-normal text-xs text-[var(--dash-muted)]">
                      {formatDateTime(c.createdAt)}
                    </span>
                  </p>
                  <p className="text-[var(--dash-muted)]">{c.message}</p>
                </li>
              );
            })}
            {comments.length === 0 ? (
              <li className="text-[var(--dash-muted)]">No comments yet.</li>
            ) : null}
          </ul>
          {canWrite ? (
            <OsActionForm action={addTaskComment} submitLabel="Send" className="grid gap-2">
              <input type="hidden" name="taskId" value={id} />
              <textarea
                name="message"
                required
                placeholder="Write a comment… Use @email@domain.com to mention"
                className={osTextareaClass()}
              />
            </OsActionForm>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--dash-border)] p-4">
        <h2 className="mb-4 font-archivo text-sm uppercase tracking-wide">
          Task activity
        </h2>
        <ActivityTimeline events={activity} actorNames={actorNames} />
      </section>
    </OsPage>
  );
}
