export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesTask } from "@/models/sales/SalesTask";
import { SalesFollowUp } from "@/models/sales/SalesFollowUp";
import { OsPage, OsStat } from "@/components/os/ui";

export default async function SalesProductivityPage() {
  const staff = await requireSalesPage("perf.productivity");
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const [tasks, followUps] = await Promise.all([
    SalesTask.find({ ownerEmployeeId: staff.employeeId }).lean(),
    SalesFollowUp.find({ ownerEmployeeId: staff.employeeId }).lean(),
  ]);

  const assigned = tasks.length + followUps.length;
  const completed = tasks.filter((t) => t.status === "completed").length + followUps.filter((f) => f.status === "completed").length;
  const overdueTasks = tasks.filter((t) => t.status !== "completed" && t.dueDate && new Date(t.dueDate) < now).length;
  const overdueFollowUps = followUps.filter((f) => f.status === "pending" && new Date(f.dueAt) < now).length;
  const pending = assigned - completed;
  const completionPct = assigned ? Math.round((completed / assigned) * 100) : 0;

  const weeklyTasks = tasks.filter((t) => t.createdAt && new Date(t.createdAt) >= weekStart).length;

  return (
    <OsPage
      title="Productivity Tracking"
      subtitle="Assigned vs completed — a transparent count, not a synthetic score."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OsStat label="Assigned" value={String(assigned)} />
        <OsStat label="Completed" value={String(completed)} />
        <OsStat label="Completion %" value={`${completionPct}%`} />
        <OsStat label="Pending" value={String(pending)} />
        <OsStat label="Overdue tasks" value={String(overdueTasks)} />
        <OsStat label="Overdue follow-ups" value={String(overdueFollowUps)} />
        <OsStat label="This week's tasks" value={String(weeklyTasks)} />
      </div>
    </OsPage>
  );
}
