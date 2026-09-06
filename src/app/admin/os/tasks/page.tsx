export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { OsTask } from "@/models/os/Task";
import { Project } from "@/models/os/Project";
import { StaffUser } from "@/models/os/StaffUser";
import { TaskDependency } from "@/models/os/TaskDependency";
import { TaskComment } from "@/models/os/TaskComment";
import { TaskWorkSession } from "@/models/os/TaskWorkSession";
import { migrateTaskStatuses } from "@/actions/os/tasks";
import { TaskCard } from "@/components/os/TaskCard";
import { AddTaskDrawer } from "@/components/os/AddTaskDrawer";
import { OsPage, OsLink } from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
} from "@/lib/os/constants";
import { hasPermission } from "@/lib/os/permissions";
import { projectIdsForStaff, staffCanManageAllProjects } from "@/lib/os/project-access";
import { sumSessionDurations } from "@/lib/os/task-timing";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    projectId?: string;
    assignee?: string;
    status?: string;
    priority?: string;
  }>;
}) {
  const staff = await requireOsPage("tasks:read");
  await migrateTaskStatuses();
  const sp = await searchParams;
  const view = sp.view || "my";
  const canWrite = hasPermission(staff.permissions, "tasks:write");
  const canSeeAll = staffCanManageAllProjects(staff);

  const scopedIds = await projectIdsForStaff(staff);
  const projectFilter =
    scopedIds === "all"
      ? {}
      : { projectId: { $in: scopedIds.length ? scopedIds : ["000000000000000000000000"] } };

  let query: Record<string, unknown> = {
    recordStatus: "active",
    ...projectFilter,
  };

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  if (view === "my") {
    query.assignedToId = staff.userId;
  } else if (view === "today") {
    query.dueDate = { $gte: todayStart, $lte: todayEnd };
    query.status = { $nin: ["completed", "cancelled"] };
  } else if (view === "upcoming") {
    query.dueDate = { $gt: todayEnd };
    query.status = { $nin: ["completed", "cancelled"] };
  } else if (view === "overdue") {
    query.dueDate = { $lt: todayStart };
    query.status = { $nin: ["completed", "cancelled"] };
  } else if (view === "blocked") {
    query.status = "blocked";
  } else if (view === "in_progress") {
    query.status = "in_progress";
  } else if (view === "completed") {
    query.status = "completed";
  } else if (view === "all" && !canSeeAll) {
    query.assignedToId = staff.userId;
  }

  if (sp.projectId) query.projectId = sp.projectId;
  if (sp.assignee) query.assignedToId = sp.assignee;
  if (sp.status && TASK_STATUSES.includes(sp.status as (typeof TASK_STATUSES)[number])) {
    query.status = sp.status;
  }
  if (
    sp.priority &&
    TASK_PRIORITIES.includes(sp.priority as (typeof TASK_PRIORITIES)[number])
  ) {
    query.priority = sp.priority;
  }

  const tasks = await OsTask.find(query).sort({ dueDate: 1, createdAt: -1 }).lean();
  const projectIds = [
    ...new Set(tasks.map((t) => (t.projectId ? String(t.projectId) : "")).filter(Boolean)),
  ];
  const [projects, allProjects, staffUsers, deps, comments, sessions] =
    await Promise.all([
      Project.find({ _id: { $in: projectIds } }).lean(),
      Project.find(
        scopedIds === "all"
          ? { recordStatus: "active" }
          : { _id: { $in: scopedIds }, recordStatus: "active" }
      ).lean(),
      StaffUser.find({ isActive: true }).sort({ name: 1 }).lean(),
      TaskDependency.find({
        taskId: { $in: tasks.map((t) => t._id) },
      }).lean(),
      TaskComment.find({
        taskId: { $in: tasks.map((t) => t._id) },
      })
        .select("taskId")
        .lean(),
      TaskWorkSession.find({
        taskId: { $in: tasks.map((t) => t._id) },
      }).lean(),
    ]);

  const projectById = Object.fromEntries(projects.map((p) => [String(p._id), p]));
  const staffById = Object.fromEntries(staffUsers.map((u) => [String(u._id), u]));
  const depCount = new Map<string, number>();
  for (const d of deps) {
    const id = String(d.taskId);
    depCount.set(id, (depCount.get(id) || 0) + 1);
  }
  const commentCount = new Map<string, number>();
  for (const c of comments) {
    const id = String(c.taskId);
    commentCount.set(id, (commentCount.get(id) || 0) + 1);
  }
  const durationByTask = new Map<string, number>();
  for (const t of tasks) {
    const tid = String(t._id);
    const sess = sessions.filter((s) => String(s.taskId) === tid);
    durationByTask.set(tid, sumSessionDurations(sess));
  }

  const views = [
    { id: "my", label: "My Tasks" },
    { id: "today", label: "Today" },
    { id: "upcoming", label: "Upcoming" },
    { id: "overdue", label: "Overdue" },
    { id: "blocked", label: "Blocked" },
    { id: "in_progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
    ...(canSeeAll ? [{ id: "all", label: "All Tasks" }] : []),
    { id: "by_project", label: "By Project" },
  ];

  const byProject =
    view === "by_project"
      ? Object.entries(
          tasks.reduce<Record<string, typeof tasks>>((acc, t) => {
            const key = t.projectId ? String(t.projectId) : "none";
            (acc[key] ||= []).push(t);
            return acc;
          }, {})
        )
      : null;

  return (
    <OsPage
      title="Tasks"
      subtitle="Project execution — assignments, timing, and daily work."
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <OsLink href="/admin/os/tasks?view=my">My tasks</OsLink>
          {canWrite ? (
            <AddTaskDrawer
              projects={allProjects.map((p) => ({ id: String(p._id), name: p.name }))}
              staffUsers={staffUsers.map((u) => ({
                id: String(u._id),
                label: u.name || u.email,
              }))}
            />
          ) : null}
        </div>
      }
    >
      <nav className="mb-6 flex flex-wrap gap-2">
        {views.map((v) => (
          <Link
            key={v.id}
            href={`/admin/os/tasks?view=${v.id}`}
            className={`rounded-lg px-3 py-1.5 font-archivo text-[11px] uppercase tracking-wide ${
              view === v.id
                ? "bg-[var(--dash-accent)] text-white"
                : "border border-[var(--dash-border)] text-[var(--dash-muted)]"
            }`}
          >
            {v.label}
          </Link>
        ))}
      </nav>

      <form className="mb-6 flex flex-wrap gap-2" method="get">
        <input type="hidden" name="view" value={view} />
        <OsSelect
          name="projectId"
          defaultValue={sp.projectId || ""}
          placeholder="All projects"
          className="w-auto min-w-[160px]"
          options={allProjects.map((p) => ({ value: String(p._id), label: p.name }))}
        />
        <OsSelect
          name="assignee"
          defaultValue={sp.assignee || ""}
          placeholder="All assignees"
          className="w-auto min-w-[160px]"
          options={staffUsers.map((u) => ({ value: String(u._id), label: u.name || u.email }))}
        />
        <OsSelect
          name="status"
          defaultValue={sp.status || ""}
          placeholder="All statuses"
          className="w-auto min-w-[160px]"
          options={TASK_STATUSES.map((s) => ({ value: s, label: TASK_STATUS_LABELS[s] }))}
        />
        <OsSelect
          name="priority"
          defaultValue={sp.priority || ""}
          placeholder="All priorities"
          className="w-auto min-w-[160px]"
          options={TASK_PRIORITIES.map((p) => ({ value: p, label: TASK_PRIORITY_LABELS[p] }))}
        />
        <button type="submit" className="rounded-lg bg-[var(--dash-input)] px-3 py-2 text-sm">
          Filter
        </button>
      </form>

      {byProject ? (
        <div className="space-y-8">
          {byProject.map(([pid, list]) => (
            <section key={pid}>
              <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide">
                {pid === "none" ? "No project" : projectById[pid]?.name || "Project"}
              </h2>
              <div className="grid gap-3">
                {list.map((t) => (
                  <TaskCard
                    key={String(t._id)}
                    task={t}
                    projectName={
                      t.projectId ? projectById[String(t.projectId)]?.name : undefined
                    }
                    assigneeName={
                      t.assignedToId
                        ? staffById[String(t.assignedToId)]?.name ||
                          staffById[String(t.assignedToId)]?.email
                        : t.assignee
                    }
                    dependencyCount={depCount.get(String(t._id)) || 0}
                    commentCount={commentCount.get(String(t._id)) || 0}
                    actualDurationMs={durationByTask.get(String(t._id)) || 0}
                    canDelete={canWrite}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {tasks.map((t) => (
            <TaskCard
              key={String(t._id)}
              task={t}
              projectName={
                t.projectId ? projectById[String(t.projectId)]?.name : undefined
              }
              assigneeName={
                t.assignedToId
                  ? staffById[String(t.assignedToId)]?.name ||
                    staffById[String(t.assignedToId)]?.email
                  : t.assignee
              }
              dependencyCount={depCount.get(String(t._id)) || 0}
              commentCount={commentCount.get(String(t._id)) || 0}
              actualDurationMs={durationByTask.get(String(t._id)) || 0}
              canDelete={canWrite}
            />
          ))}
          {tasks.length === 0 ? (
            <p className="font-inter text-sm text-[var(--dash-muted)]">No tasks in this view.</p>
          ) : null}
        </div>
      )}
    </OsPage>
  );
}
