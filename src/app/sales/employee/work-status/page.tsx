export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesTask } from "@/models/sales/SalesTask";
import { SalesActivityEvent } from "@/models/sales/SalesActivityEvent";
import { submitDailyWorkStatus } from "@/actions/sales/work-status";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, OsBadge, OsPage, osTextareaClass } from "@/components/os/ui";
import { formatDateTime } from "@/lib/utils";

export default async function SalesDailyWorkStatusPage() {
  const staff = await requireSalesPage("perf.daily_work_status");
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [tasks, pastSubmissions] = await Promise.all([
    SalesTask.find({ ownerEmployeeId: staff.employeeId, status: { $ne: "completed" } }).sort({ dueDate: 1 }).limit(20).lean(),
    SalesActivityEvent.find({ actorEmployeeId: staff.employeeId, type: "daily_work_status" }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  const completedToday = await SalesTask.countDocuments({
    ownerEmployeeId: staff.employeeId,
    status: "completed",
    updatedAt: { $gte: todayStart },
  });

  return (
    <OsPage title="Daily Work Status" subtitle="Today's plan, what's done, and a quick remark for your manager.">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
          <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
            Today's plan <OsBadge tone="neutral">{tasks.length} pending</OsBadge>
          </h2>
          <ul className="space-y-2 font-inter text-sm text-[var(--dash-muted)]">
            {tasks.map((t) => (
              <li key={String(t._id)} className="text-[var(--dash-text)]">{t.title}</li>
            ))}
            {tasks.length === 0 ? <li>Nothing pending — nice.</li> : null}
          </ul>
          <p className="mt-3 font-inter text-xs text-[var(--dash-muted)]">Completed today: {completedToday}</p>
        </section>

        <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
          <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Submit remarks</h2>
          <OsActionForm action={submitDailyWorkStatus} submitLabel="Submit">
            <Field label="Remarks">
              <textarea name="remarks" required className={osTextareaClass()} placeholder="What you got done, what's blocked, what's next." />
            </Field>
          </OsActionForm>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">Recent submissions</h2>
        <ul className="space-y-2">
          {pastSubmissions.map((s) => (
            <li key={String(s._id)} className="rounded-xl border border-[var(--dash-border)] px-4 py-3 font-inter text-sm">
              <p className="text-[var(--dash-text)]">{s.detail}</p>
              <p className="mt-1 text-[var(--dash-faint)]">{formatDateTime(s.createdAt)}</p>
            </li>
          ))}
          {pastSubmissions.length === 0 ? <li className="font-inter text-sm text-[var(--dash-muted)]">Nothing submitted yet.</li> : null}
        </ul>
      </section>
    </OsPage>
  );
}
