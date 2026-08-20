import Link from "next/link";
import { OsBadge } from "@/components/os/ui";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/os/constants";
import { formatDate } from "@/lib/utils";
import {
  exceededPlanned,
  formatDurationMs,
  plannedDurationMs,
} from "@/lib/os/task-timing";

function statusTone(status: TaskStatus): "neutral" | "accent" | "warn" | "ok" | "bad" {
  switch (status) {
    case "completed":
      return "ok";
    case "blocked":
      return "bad";
    case "in_progress":
      return "accent";
    case "on_hold":
      return "warn";
    default:
      return "neutral";
  }
}

function priorityTone(p: TaskPriority): "neutral" | "accent" | "warn" | "ok" | "bad" {
  switch (p) {
    case "urgent":
      return "bad";
    case "high":
      return "warn";
    case "low":
      return "neutral";
    default:
      return "accent";
  }
}

export function TaskCard({
  task,
  projectName,
  assigneeName,
  dependencyCount = 0,
  commentCount = 0,
  actualDurationMs = 0,
}: {
  task: {
    _id: { toString(): string };
    title: string;
    status: string;
    priority?: string;
    dueDate?: Date | string | null;
    plannedStartTime?: Date | string | null;
    plannedEndTime?: Date | string | null;
    actualStartTime?: Date | string | null;
    actualEndTime?: Date | string | null;
  };
  projectName?: string;
  assigneeName?: string;
  dependencyCount?: number;
  commentCount?: number;
  actualDurationMs?: number;
}) {
  const status = (task.status as TaskStatus) || "todo";
  const priority = (task.priority as TaskPriority) || "medium";
  const planned = plannedDurationMs(task.plannedStartTime, task.plannedEndTime);
  const over = exceededPlanned(
    actualDurationMs,
    task.plannedStartTime,
    task.plannedEndTime
  );

  return (
    <Link
      href={`/admin/os/tasks/${task._id}`}
      className="block rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-card)] p-4 transition hover:border-[var(--dash-accent)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-archivo text-base text-[var(--dash-text)]">{task.title}</h3>
        <div className="flex gap-2">
          <OsBadge tone={priorityTone(priority)}>
            {TASK_PRIORITY_LABELS[priority] || priority}
          </OsBadge>
          <OsBadge tone={statusTone(status)}>
            {TASK_STATUS_LABELS[status] || status}
          </OsBadge>
        </div>
      </div>
      <dl className="mt-3 space-y-1 font-inter text-sm text-[var(--dash-muted)]">
        {projectName ? (
          <div>
            <span className="text-[var(--dash-text)]/70">Project:</span> {projectName}
          </div>
        ) : null}
        {assigneeName ? (
          <div>
            <span className="text-[var(--dash-text)]/70">Assignee:</span> {assigneeName}
          </div>
        ) : null}
        {task.dueDate ? (
          <div>
            <span className="text-[var(--dash-text)]/70">Due:</span>{" "}
            {formatDate(task.dueDate)}
          </div>
        ) : null}
        {planned != null ? (
          <div>
            <span className="text-[var(--dash-text)]/70">Planned:</span>{" "}
            {formatDurationMs(planned)}
            {actualDurationMs > 0 ? (
              <>
                {" · "}
                <span className={over ? "text-red-500" : ""}>
                  Actual: {formatDurationMs(actualDurationMs)}
                  {over ? " (over)" : ""}
                </span>
              </>
            ) : null}
          </div>
        ) : actualDurationMs > 0 ? (
          <div>
            <span className="text-[var(--dash-text)]/70">Actual:</span>{" "}
            {formatDurationMs(actualDurationMs)}
          </div>
        ) : null}
        {(dependencyCount > 0 || commentCount > 0) && (
          <div>
            {dependencyCount > 0 ? `${dependencyCount} dependenc${dependencyCount === 1 ? "y" : "ies"}` : null}
            {dependencyCount > 0 && commentCount > 0 ? " · " : null}
            {commentCount > 0 ? `${commentCount} comment${commentCount === 1 ? "" : "s"}` : null}
          </div>
        )}
      </dl>
    </Link>
  );
}
