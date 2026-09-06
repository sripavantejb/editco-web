"use client";

import { createTask } from "@/actions/os/tasks";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsSlideOver } from "@/components/os/OsSlideOver";
import { Field, osInputClass } from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import { OsDateInput } from "@/components/os/OsDateInput";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
} from "@/lib/os/constants";

export function AddTaskDrawer({
  projects,
  staffUsers,
}: {
  projects: { id: string; name: string }[];
  staffUsers: { id: string; label: string }[];
}) {
  return (
    <OsSlideOver
      triggerLabel="Add task"
      title="Add task"
      subtitle="Assign work with project, owner, priority, and due date."
      wide
    >
      <OsActionForm action={createTask} submitLabel="Add task" className="grid gap-3">
        <Field label="Project">
          <OsSelect
            name="projectId"
            required
            defaultValue=""
            placeholder="Select project"
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
          />
        </Field>
        <Field label="Title">
          <input
            name="title"
            required
            placeholder="What needs to be done?"
            className={osInputClass()}
          />
        </Field>
        <Field label="Assign to">
          <OsSelect
            name="assignedToId"
            required
            defaultValue=""
            placeholder="Select assignee"
            options={staffUsers.map((u) => ({ value: u.id, label: u.label }))}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Priority">
            <OsSelect
              name="priority"
              defaultValue="medium"
              options={TASK_PRIORITIES.map((p) => ({
                value: p,
                label: TASK_PRIORITY_LABELS[p],
              }))}
            />
          </Field>
          <Field label="Due date">
            <OsDateInput name="dueDate" />
          </Field>
        </div>
        <p className="font-inter text-xs text-[#6b7280]">
          Assignee must be a member of the selected project.
        </p>
      </OsActionForm>
    </OsSlideOver>
  );
}
