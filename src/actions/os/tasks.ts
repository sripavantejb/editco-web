"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity, notifyStaff } from "@/lib/os/activity";
import { bool, optDate, str } from "@/lib/os/form";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/os/constants";
import { canTransitionTask } from "@/lib/os/transitions";
import {
  canViewProject,
  isProjectMember,
  listProjectMemberIds,
  staffCanManageAllProjects,
} from "@/lib/os/project-access";
import { wouldCreateDependencyCycle } from "@/lib/os/task-deps";
import { OsTask } from "@/models/os/Task";
import { Project } from "@/models/os/Project";
import { StaffUser } from "@/models/os/StaffUser";
import { TaskWorkSession } from "@/models/os/TaskWorkSession";
import { TaskDependency } from "@/models/os/TaskDependency";
import { TaskComment } from "@/models/os/TaskComment";
import type { ActionState } from "@/actions/auth";
import type { StaffContext } from "@/lib/os/staff";

let taskStatusMigrated = false;

export async function migrateTaskStatuses() {
  if (taskStatusMigrated) return;
  await connectDB();
  await OsTask.updateMany({ status: "pending" }, { $set: { status: "todo" } });
  taskStatusMigrated = true;
}

function revalidateTask(task: { _id: { toString(): string }; projectId?: unknown }) {
  revalidatePath("/admin/os", "layout");
  revalidatePath("/admin/os/tasks");
  revalidatePath(`/admin/os/tasks/${task._id}`);
  if (task.projectId) {
    revalidatePath(`/admin/os/projects/${task.projectId}`);
  }
}

async function loadTaskForStaff(taskId: string, staff: StaffContext) {
  await migrateTaskStatuses();
  const task = await OsTask.findById(taskId);
  if (!task || task.recordStatus !== "active") {
    return { ok: false as const, error: "Task not found" };
  }
  if (task.projectId) {
    const project = await Project.findById(task.projectId);
    if (!project) return { ok: false as const, error: "Project not found" };
    if (!(await canViewProject(staff, project))) {
      return { ok: false as const, error: "You do not have access to this task" };
    }
    return { ok: true as const, task, project };
  }
  if (!staffCanManageAllProjects(staff) && !hasTasksWrite(staff)) {
    return { ok: false as const, error: "You do not have access to this task" };
  }
  return { ok: true as const, task, project: null };
}

function hasTasksWrite(staff: StaffContext) {
  return (
    staff.permissions.includes("*") ||
    staff.permissions.includes("tasks:*") ||
    staff.permissions.includes("tasks:write")
  );
}

async function resolveAssignee(assigneeId: string, projectId?: string | null) {
  const user = await StaffUser.findOne({ _id: assigneeId, isActive: true });
  if (!user) return { error: "Assignee must be an active user" as const };
  if (projectId) {
    const ok = await isProjectMember(projectId, assigneeId);
    const project = await Project.findById(projectId).select("primaryPocUserId").lean();
    const isPoc =
      project?.primaryPocUserId &&
      String(project.primaryPocUserId) === assigneeId;
    if (!ok && !isPoc) {
      return { error: "Assignee must be a project member" as const };
    }
  }
  return {
    user,
    assignedToId: user._id,
    assignee: user.name || user.email,
  };
}

async function incompleteBlockers(taskId: string) {
  const deps = await TaskDependency.find({ taskId }).lean();
  if (!deps.length) return [];
  const blockerIds = deps.map((d) => d.dependsOnTaskId);
  const blockers = await OsTask.find({
    _id: { $in: blockerIds },
    status: { $ne: "completed" },
    recordStatus: "active",
  })
    .select("title status")
    .lean();
  return blockers;
}

export async function createTask(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("tasks:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  await migrateTaskStatuses();

  const title = str(formData, "title");
  if (!title) return { error: "Title is required" };
  const projectId = str(formData, "projectId");
  const project = projectId ? await Project.findById(projectId) : null;
  if (projectId && !project) return { error: "Project not found" };
  if (project && !(await canViewProject(gate.staff, project))) {
    return { error: "You do not have access to this project" };
  }

  const assigneeId = str(formData, "assignedToId");
  if (!assigneeId) return { error: "Assignee is required" };
  const assignee = await resolveAssignee(assigneeId, projectId || null);
  if ("error" in assignee) return { error: assignee.error };

  const statusRaw = (str(formData, "status") || "todo") as TaskStatus;
  const status = TASK_STATUSES.includes(statusRaw) ? statusRaw : "todo";
  const priorityRaw = (str(formData, "priority") || "medium") as TaskPriority;
  const priority = TASK_PRIORITIES.includes(priorityRaw) ? priorityRaw : "medium";

  const ownerSide = str(formData, "ownerSide") === "client" ? "client" : "editco";
  const visibleToClient =
    bool(formData, "visibleToClient") || ownerSide === "client";
  const clientActionRequired =
    bool(formData, "clientActionRequired") || ownerSide === "client";

  const task = await OsTask.create({
    title,
    description: str(formData, "description"),
    status,
    priority,
    assignee: assignee.assignee,
    assignedToId: assignee.assignedToId,
    createdById: gate.staff.userId,
    dueDate: optDate(formData, "dueDate"),
    startDate: optDate(formData, "startDate"),
    plannedStartTime: optDate(formData, "plannedStartTime"),
    plannedEndTime: optDate(formData, "plannedEndTime"),
    ownerSide,
    visibleToClient,
    clientActionRequired,
    projectId: project?._id,
    conversionUuid: project?.conversionUuid || str(formData, "conversionUuid"),
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  await logActivity({
    title: "Task created",
    detail: title,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    actorName: gate.staff.name,
    actionType: "TASK_CREATED",
    conversionUuid: task.conversionUuid,
    projectId: projectId || undefined,
    entityType: "task",
    entityId: task._id.toString(),
  });

  await logActivity({
    title: "Task assigned",
    detail: `${assignee.assignee} was assigned “${title}” by ${gate.staff.name}`,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    actorName: gate.staff.name,
    actionType: "TASK_ASSIGNED",
    conversionUuid: task.conversionUuid,
    projectId: projectId || undefined,
    entityType: "task",
    entityId: task._id.toString(),
    metadata: { assignedToId: assigneeId },
  });

  await notifyStaff({
    type: "task",
    title: `Assigned: ${title}`,
    body: `${gate.staff.name} assigned you a task`,
    href: `/admin/os/tasks/${task._id}`,
    conversionUuid: task.conversionUuid,
    recipientEmail: assignee.user.email,
  });

  revalidateTask(task);
  return { success: "Task created" };
}

export async function updateTask(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("tasks:write");
  if (!gate.ok) return { error: gate.error };
  const loaded = await loadTaskForStaff(str(formData, "id"), gate.staff);
  if (!loaded.ok) return { error: loaded.error };
  const { task } = loaded;

  const title = str(formData, "title");
  if (title) task.title = title;
  if (formData.has("description")) task.description = str(formData, "description");

  const priorityRaw = str(formData, "priority") as TaskPriority;
  if (priorityRaw && TASK_PRIORITIES.includes(priorityRaw)) {
    task.priority = priorityRaw;
  }

  const due = optDate(formData, "dueDate");
  if (formData.has("dueDate")) {
    const prev = task.dueDate ? new Date(task.dueDate).toISOString() : "";
    task.dueDate = due;
    await logActivity({
      title: "Task due date changed",
      detail: task.title,
      createdBy: gate.staff.email,
      actorUserId: gate.staff.userId,
      actorName: gate.staff.name,
      actionType: "TASK_DUE_DATE_CHANGED",
      conversionUuid: task.conversionUuid,
      projectId: task.projectId ? String(task.projectId) : undefined,
      entityType: "task",
      entityId: task._id.toString(),
      metadata: { prev, next: due?.toISOString() || "" },
    });
  }

  if (formData.has("startDate")) task.startDate = optDate(formData, "startDate");
  if (formData.has("plannedStartTime")) {
    task.plannedStartTime = optDate(formData, "plannedStartTime");
  }
  if (formData.has("plannedEndTime")) {
    task.plannedEndTime = optDate(formData, "plannedEndTime");
  }

  const assigneeId = str(formData, "assignedToId");
  if (assigneeId && String(task.assignedToId || "") !== assigneeId) {
    const assignee = await resolveAssignee(
      assigneeId,
      task.projectId ? String(task.projectId) : null
    );
    if ("error" in assignee) return { error: assignee.error };
    const prevId = task.assignedToId ? String(task.assignedToId) : "";
    task.assignedToId = assignee.assignedToId;
    task.assignee = assignee.assignee;
    await logActivity({
      title: "Task reassigned",
      detail: `${assignee.assignee} was assigned “${task.title}” by ${gate.staff.name}`,
      createdBy: gate.staff.email,
      actorUserId: gate.staff.userId,
      actorName: gate.staff.name,
      actionType: "TASK_REASSIGNED",
      conversionUuid: task.conversionUuid,
      projectId: task.projectId ? String(task.projectId) : undefined,
      entityType: "task",
      entityId: task._id.toString(),
      metadata: { prevId, assignedToId: assigneeId },
    });
    await notifyStaff({
      type: "task",
      title: `Reassigned: ${task.title}`,
      body: `${gate.staff.name} reassigned a task to you`,
      href: `/admin/os/tasks/${task._id}`,
      conversionUuid: task.conversionUuid,
      recipientEmail: assignee.user.email,
    });
  }

  task.updatedBy = gate.staff.email;
  await task.save();
  revalidateTask(task);
  return { success: "Task updated" };
}

async function applyStatusChange(
  gate: { staff: StaffContext },
  task: InstanceType<typeof OsTask>,
  status: TaskStatus,
  opts?: { overrideDeps?: boolean }
): Promise<ActionState> {
  const prev = (task.status as TaskStatus) || "todo";
  if (!TASK_STATUSES.includes(status)) return { error: "Invalid status" };
  if (!canTransitionTask(prev, status)) {
    return { error: `Cannot change status from ${prev} to ${status}` };
  }

  if (status === "in_progress") {
    const blockers = await incompleteBlockers(String(task._id));
    if (blockers.length && !opts?.overrideDeps) {
      return {
        error: `Blocked by incomplete dependencies: ${blockers.map((b) => b.title).join(", ")}`,
      };
    }
    if (blockers.length && opts?.overrideDeps) {
      await logActivity({
        title: "Dependency override",
        detail: `${gate.staff.name} manually started “${task.title}” while dependency “${blockers.map((b) => b.title).join(", ")}” was incomplete`,
        createdBy: gate.staff.email,
        actorUserId: gate.staff.userId,
        actorName: gate.staff.name,
        actionType: "TASK_STARTED",
        conversionUuid: task.conversionUuid,
        projectId: task.projectId ? String(task.projectId) : undefined,
        entityType: "task",
        entityId: task._id.toString(),
        metadata: { override: true, blockers: blockers.map((b) => String(b._id)) },
      });
    }
  }

  task.status = status;
  task.updatedBy = gate.staff.email;
  if (status === "completed") {
    task.completedAt = new Date();
    if (!task.actualEndTime) task.actualEndTime = new Date();
  }
  await task.save();

  await logActivity({
    title: "Task status changed",
    detail: `${prev} → ${status}`,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    actorName: gate.staff.name,
    actionType: "TASK_STATUS_CHANGED",
    conversionUuid: task.conversionUuid,
    projectId: task.projectId ? String(task.projectId) : undefined,
    entityType: "task",
    entityId: task._id.toString(),
    metadata: { prev, status },
  });

  if (status === "completed") {
    const dependents = await TaskDependency.find({
      dependsOnTaskId: task._id,
    }).lean();
    for (const dep of dependents) {
      const dependent = await OsTask.findById(dep.taskId);
      if (!dependent?.assignedToId) continue;
      const assignee = await StaffUser.findById(dependent.assignedToId);
      if (!assignee) continue;
      await notifyStaff({
        type: "task",
        title: `Unblocked: ${dependent.title}`,
        body: `Dependency “${task.title}” was completed`,
        href: `/admin/os/tasks/${dependent._id}`,
        conversionUuid: dependent.conversionUuid,
        recipientEmail: assignee.email,
      });
    }
  }

  revalidateTask(task);
  return { success: "Task updated" };
}

/** Plain form action (tasks list page). */
export async function updateTaskStatus(formData: FormData): Promise<void> {
  const gate = await requireStaff("tasks:write");
  if (!gate.ok) return;
  const loaded = await loadTaskForStaff(str(formData, "id"), gate.staff);
  if (!loaded.ok) return;
  const status = str(formData, "status") as TaskStatus;
  const overrideDeps = str(formData, "overrideDeps") === "true";
  await applyStatusChange(gate, loaded.task, status, { overrideDeps });
}

export async function updateTaskStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("tasks:write");
  if (!gate.ok) return { error: gate.error };
  const loaded = await loadTaskForStaff(str(formData, "id"), gate.staff);
  if (!loaded.ok) return { error: loaded.error };
  const status = str(formData, "status") as TaskStatus;
  const overrideDeps = str(formData, "overrideDeps") === "true";
  return applyStatusChange(gate, loaded.task, status, { overrideDeps });
}

export async function updateTaskVisibility(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("tasks:write");
  if (!gate.ok) return { error: gate.error };
  const loaded = await loadTaskForStaff(str(formData, "id"), gate.staff);
  if (!loaded.ok) return { error: loaded.error };
  const { task } = loaded;

  task.visibleToClient = bool(formData, "visibleToClient");
  task.clientActionRequired = bool(formData, "clientActionRequired");
  task.updatedBy = gate.staff.email;
  await task.save();

  revalidateTask(task);
  return { success: "Visibility updated" };
}

export async function startTask(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("tasks:write");
  if (!gate.ok) return { error: gate.error };
  const loaded = await loadTaskForStaff(str(formData, "id"), gate.staff);
  if (!loaded.ok) return { error: loaded.error };
  const { task } = loaded;

  const open = await TaskWorkSession.findOne({
    taskId: task._id,
    endedAt: null,
  });
  if (open) return { error: "Task already has an open work session" };

  const overrideDeps = str(formData, "overrideDeps") === "true";
  if (task.status !== "in_progress") {
    const result = await applyStatusChange(gate, task, "in_progress", {
      overrideDeps,
    });
    if (result.error) return result;
  }

  if (!task.actualStartTime) {
    task.actualStartTime = new Date();
    await task.save();
  }

  await TaskWorkSession.create({
    taskId: task._id,
    userId: gate.staff.userId,
    startedAt: new Date(),
  });

  await logActivity({
    title: "Task started",
    detail: task.title,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    actorName: gate.staff.name,
    actionType: "TASK_STARTED",
    conversionUuid: task.conversionUuid,
    projectId: task.projectId ? String(task.projectId) : undefined,
    entityType: "task",
    entityId: task._id.toString(),
  });

  revalidateTask(task);
  return { success: "Task started" };
}

export async function pauseTask(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("tasks:write");
  if (!gate.ok) return { error: gate.error };
  const loaded = await loadTaskForStaff(str(formData, "id"), gate.staff);
  if (!loaded.ok) return { error: loaded.error };
  const { task } = loaded;

  const open = await TaskWorkSession.findOne({
    taskId: task._id,
    endedAt: null,
  });
  if (!open) return { error: "No active work session" };
  const endedAt = new Date();
  open.endedAt = endedAt;
  open.durationMs = endedAt.getTime() - new Date(open.startedAt).getTime();
  await open.save();

  await logActivity({
    title: "Task paused",
    detail: task.title,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    actorName: gate.staff.name,
    actionType: "TASK_PAUSED",
    conversionUuid: task.conversionUuid,
    projectId: task.projectId ? String(task.projectId) : undefined,
    entityType: "task",
    entityId: task._id.toString(),
  });

  revalidateTask(task);
  return { success: "Task paused" };
}

export async function completeTask(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("tasks:write");
  if (!gate.ok) return { error: gate.error };
  const loaded = await loadTaskForStaff(str(formData, "id"), gate.staff);
  if (!loaded.ok) return { error: loaded.error };
  const { task } = loaded;

  const open = await TaskWorkSession.findOne({
    taskId: task._id,
    endedAt: null,
  });
  if (open) {
    const endedAt = new Date();
    open.endedAt = endedAt;
    open.durationMs = endedAt.getTime() - new Date(open.startedAt).getTime();
    await open.save();
  }

  const result = await applyStatusChange(gate, task, "completed");
  if (result.error) return result;

  await logActivity({
    title: "Task completed",
    detail: task.title,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    actorName: gate.staff.name,
    actionType: "TASK_COMPLETED",
    conversionUuid: task.conversionUuid,
    projectId: task.projectId ? String(task.projectId) : undefined,
    entityType: "task",
    entityId: task._id.toString(),
  });

  revalidateTask(task);
  return { success: "Task completed" };
}

export async function addTaskComment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("tasks:write");
  if (!gate.ok) return { error: gate.error };
  const loaded = await loadTaskForStaff(str(formData, "taskId"), gate.staff);
  if (!loaded.ok) return { error: loaded.error };
  const { task } = loaded;
  const message = str(formData, "message");
  if (!message) return { error: "Message is required" };

  await TaskComment.create({
    taskId: task._id,
    userId: gate.staff.userId,
    message,
  });

  await logActivity({
    title: "Task comment added",
    detail: `“${task.title}”: ${message.slice(0, 120)}`,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    actorName: gate.staff.name,
    actionType: "TASK_COMMENT_ADDED",
    conversionUuid: task.conversionUuid,
    projectId: task.projectId ? String(task.projectId) : undefined,
    entityType: "task",
    entityId: task._id.toString(),
  });

  // Mention by @email
  const mentions = message.match(/@[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  for (const raw of mentions) {
    const email = raw.slice(1).toLowerCase();
    await notifyStaff({
      type: "task",
      title: `Mentioned on ${task.title}`,
      body: `${gate.staff.name}: ${message.slice(0, 160)}`,
      href: `/admin/os/tasks/${task._id}`,
      conversionUuid: task.conversionUuid,
      recipientEmail: email,
    });
  }

  if (task.assignedToId && String(task.assignedToId) !== gate.staff.userId) {
    const assignee = await StaffUser.findById(task.assignedToId);
    if (assignee) {
      await notifyStaff({
        type: "task",
        title: `Comment on ${task.title}`,
        body: `${gate.staff.name}: ${message.slice(0, 160)}`,
        href: `/admin/os/tasks/${task._id}`,
        conversionUuid: task.conversionUuid,
        recipientEmail: assignee.email,
      });
    }
  }

  revalidateTask(task);
  return { success: "Comment added" };
}

export async function addTaskDependency(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("tasks:write");
  if (!gate.ok) return { error: gate.error };
  const loaded = await loadTaskForStaff(str(formData, "taskId"), gate.staff);
  if (!loaded.ok) return { error: loaded.error };
  const { task } = loaded;
  const dependsOnTaskId = str(formData, "dependsOnTaskId");
  if (!dependsOnTaskId) return { error: "Select a dependency" };

  const blocker = await OsTask.findById(dependsOnTaskId);
  if (!blocker || blocker.recordStatus !== "active") {
    return { error: "Dependency task not found" };
  }
  if (
    task.projectId &&
    blocker.projectId &&
    String(task.projectId) !== String(blocker.projectId)
  ) {
    return { error: "Dependencies must be within the same project" };
  }

  if (await wouldCreateDependencyCycle(String(task._id), dependsOnTaskId)) {
    return { error: "Circular dependency is not allowed" };
  }

  try {
    await TaskDependency.create({
      taskId: task._id,
      dependsOnTaskId,
      dependencyType: "blocks",
      createdBy: gate.staff.email,
    });
  } catch {
    return { error: "Dependency already exists" };
  }

  await logActivity({
    title: "Task dependency added",
    detail: `“${task.title}” depends on “${blocker.title}”`,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    actorName: gate.staff.name,
    actionType: "TASK_DEPENDENCY_ADDED",
    conversionUuid: task.conversionUuid,
    projectId: task.projectId ? String(task.projectId) : undefined,
    entityType: "task",
    entityId: task._id.toString(),
  });

  revalidateTask(task);
  return { success: "Dependency added" };
}

export async function removeTaskDependency(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("tasks:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const dep = await TaskDependency.findById(str(formData, "dependencyId"));
  if (!dep) return { error: "Dependency not found" };
  const loaded = await loadTaskForStaff(String(dep.taskId), gate.staff);
  if (!loaded.ok) return { error: loaded.error };

  await dep.deleteOne();
  await logActivity({
    title: "Task dependency removed",
    detail: loaded.task.title,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    actorName: gate.staff.name,
    actionType: "TASK_DEPENDENCY_REMOVED",
    conversionUuid: loaded.task.conversionUuid,
    projectId: loaded.task.projectId
      ? String(loaded.task.projectId)
      : undefined,
    entityType: "task",
    entityId: String(loaded.task._id),
  });

  revalidateTask(loaded.task);
  return { success: "Dependency removed" };
}

export async function archiveTask(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("tasks:write");
  if (!gate.ok) return { error: gate.error };
  const loaded = await loadTaskForStaff(str(formData, "id"), gate.staff);
  if (!loaded.ok) return { error: loaded.error };
  loaded.task.recordStatus = "archived";
  loaded.task.updatedBy = gate.staff.email;
  await loaded.task.save();
  revalidateTask(loaded.task);
  return { success: "Task archived" };
}

export { listProjectMemberIds };
