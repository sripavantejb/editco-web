export const dynamic = "force-dynamic";

import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesTask } from "@/models/sales/SalesTask";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { StaffUser } from "@/models/os/StaffUser";
import { assignSalesTask, deleteSalesTask } from "@/actions/sales/tasks";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsSlideOver } from "@/components/os/OsSlideOver";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import { OsSelect } from "@/components/os/OsSelect";
import {
  Field,
  OsBadge,
  OsPage,
  OsTable,
  Td,
  Th,
  osInputClass,
  osTextareaClass,
} from "@/components/os/ui";
import { SALES_LEAD_PRIORITIES } from "@/lib/sales/constants";
import { formatDate } from "@/lib/utils";

const STATUS_TONE = {
  todo: "neutral",
  in_progress: "accent",
  completed: "ok",
  overdue: "bad",
} as const;
const PRIORITY_OPTIONS = SALES_LEAD_PRIORITIES.map((p) => ({
  value: p,
  label: p.charAt(0).toUpperCase() + p.slice(1),
}));

export default async function SalesAdminTasksPage() {
  await requireSalesAdminPage();

  const employees = await SalesEmployee.find({ status: "active", isSalesAdmin: false }).lean();
  const staffUsers = await StaffUser.find({
    _id: { $in: employees.map((e) => e.staffUserId) },
  })
    .select("name")
    .lean();
  const staffById = new Map(staffUsers.map((s) => [String(s._id), s]));
  const employeeOptions = employees.map((e) => ({
    value: String(e._id),
    label: staffById.get(String(e.staffUserId))?.name || e.employeeCode || "—",
  }));
  const nameForEmployeeId = (id: unknown) =>
    employeeOptions.find((o) => o.value === String(id))?.label || "—";

  const tasks = await SalesTask.find({}).sort({ createdAt: -1 }).limit(100).lean();
  const now = new Date();

  return (
    <OsPage
      title="Tasks"
      subtitle="Assign work to an employee — it shows on their Task Management page."
      backHref="/sales/admin"
      backLabel="Dashboard"
      actions={
        <OsSlideOver triggerLabel="Assign task" title="Assign task">
          <OsActionForm action={assignSalesTask} submitLabel="Assign" className="grid gap-3">
            <Field label="Employee">
              <OsSelect
                name="employeeId"
                options={employeeOptions}
                defaultValue=""
                placeholder="Choose…"
                required
              />
            </Field>
            <Field label="Title">
              <input name="title" required className={osInputClass()} />
            </Field>
            <Field label="Description">
              <textarea name="description" className={osTextareaClass()} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Priority">
                <OsSelect name="priority" options={PRIORITY_OPTIONS} defaultValue="medium" />
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
          <tr>
            <Th>Task</Th>
            <Th>Assigned to</Th>
            <Th>Priority</Th>
            <Th>Due</Th>
            <Th>Status</Th>
            <Th>{null}</Th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const overdue = t.status !== "completed" && t.dueDate && new Date(t.dueDate) < now;
            const status = overdue ? "overdue" : t.status;
            return (
              <tr key={String(t._id)}>
                <Td>{t.title}</Td>
                <Td>{nameForEmployeeId(t.ownerEmployeeId)}</Td>
                <Td className="capitalize">{t.priority}</Td>
                <Td>{t.dueDate ? formatDate(t.dueDate) : "—"}</Td>
                <Td>
                  <OsBadge tone={STATUS_TONE[status as keyof typeof STATUS_TONE]}>
                    {String(status).replace("_", " ")}
                  </OsBadge>
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
      {tasks.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[#6b7280]">No tasks assigned yet.</p>
      ) : null}
    </OsPage>
  );
}
