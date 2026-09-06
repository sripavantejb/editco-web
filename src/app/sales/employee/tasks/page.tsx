export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesTask } from "@/models/sales/SalesTask";
import { createSalesTask, deleteSalesTask, updateSalesTaskStatus } from "@/actions/sales/tasks";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsSlideOver } from "@/components/os/OsSlideOver";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import { OsSelect } from "@/components/os/OsSelect";
import { Field, OsBadge, OsPage, OsTable, Td, Th, osInputClass, osTextareaClass } from "@/components/os/ui";
import { SALES_LEAD_PRIORITIES } from "@/lib/sales/constants";
import { formatDate } from "@/lib/utils";

async function updateTaskStatusForm(formData: FormData) {
  "use server";
  await updateSalesTaskStatus({}, formData);
}

const STATUS_TONE = { todo: "neutral", in_progress: "accent", completed: "ok", overdue: "bad" } as const;

export default async function SalesTasksPage() {
  const staff = await requireSalesPage("tasks.management");
  const tasks = await SalesTask.find({ ownerEmployeeId: staff.employeeId }).sort({ dueDate: 1 }).lean();
  const now = new Date();

  const priorityOptions = SALES_LEAD_PRIORITIES.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }));

  return (
    <OsPage
      title="Task Management"
      subtitle="Everything you need to get done, with due dates and priority."
      actions={
        <OsSlideOver triggerLabel="Add task" title="Add task">
          <OsActionForm action={createSalesTask} submitLabel="Add task" className="grid gap-3">
            <Field label="Title">
              <input name="title" required className={osInputClass()} />
            </Field>
            <Field label="Description">
              <textarea name="description" className={osTextareaClass()} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Priority">
                <OsSelect name="priority" options={priorityOptions} defaultValue="medium" />
              </Field>
              <Field label="Due date">
                <input name="dueDate" type="date" className={osInputClass()} />
              </Field>
            </div>
          </OsActionForm>
        </OsSlideOver>
      }
    >
      <OsTable>
        <thead>
          <tr><Th>Task</Th><Th>Priority</Th><Th>Due</Th><Th>Status</Th><Th>Update</Th><Th>{null}</Th></tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const overdue = t.status !== "completed" && t.dueDate && new Date(t.dueDate) < now;
            const status = overdue ? "overdue" : t.status;
            return (
              <tr key={String(t._id)}>
                <Td>{t.title}</Td>
                <Td className="capitalize">{t.priority}</Td>
                <Td>{t.dueDate ? formatDate(t.dueDate) : "—"}</Td>
                <Td><OsBadge tone={STATUS_TONE[status as keyof typeof STATUS_TONE]}>{status.replace("_", " ")}</OsBadge></Td>
                <Td>
                  <form action={updateTaskStatusForm} className="flex flex-wrap gap-1">
                    <input type="hidden" name="taskId" value={String(t._id)} />
                    {(["todo", "in_progress", "completed"] as const).filter((s) => s !== t.status).map((s) => (
                      <button
                        key={s}
                        type="submit"
                        name="status"
                        value={s}
                        className="inline-flex h-7 items-center rounded-lg border border-[#e5e7eb] bg-white px-2 font-inter text-[11px] font-medium text-[#6b7280] hover:border-[#111111] hover:text-[#111111]"
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </form>
                </Td>
                <Td>
                  <RowDeleteButton
                    action={deleteSalesTask}
                    id={String(t._id)}
                    confirmMessage="Delete this task?"
                    label="Delete task"
                  />
                </Td>
              </tr>
            );
          })}
        </tbody>
      </OsTable>
      {tasks.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No tasks yet.</p> : null}
    </OsPage>
  );
}
