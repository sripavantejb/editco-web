export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesMeeting } from "@/models/sales/SalesMeeting";
import { SalesFollowUp } from "@/models/sales/SalesFollowUp";
import { SalesTask } from "@/models/sales/SalesTask";
import { OsBadge, OsPage } from "@/components/os/ui";
import { formatDateTime } from "@/lib/utils";

export default async function SalesCalendarPage() {
  const staff = await requireSalesPage("tasks.calendar");
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 86400000);

  const [meetings, followUps, tasks] = await Promise.all([
    SalesMeeting.find({ ownerEmployeeId: staff.employeeId, startsAt: { $gte: now, $lte: in30Days } }).lean(),
    SalesFollowUp.find({ ownerEmployeeId: staff.employeeId, status: "pending", dueAt: { $gte: now, $lte: in30Days } }).lean(),
    SalesTask.find({ ownerEmployeeId: staff.employeeId, status: { $ne: "completed" }, dueDate: { $gte: now, $lte: in30Days } }).lean(),
  ]);

  type Item = { at: Date; label: string; kind: "Meeting" | "Follow-up" | "Task" };
  const items: Item[] = [
    ...meetings.map((m) => ({ at: new Date(m.startsAt), label: m.title, kind: "Meeting" as const })),
    ...followUps.map((f) => ({ at: new Date(f.dueAt), label: `${f.type} follow-up`, kind: "Follow-up" as const })),
    ...tasks.map((t) => ({ at: new Date(t.dueDate!), label: t.title, kind: "Task" as const })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());

  const tone = { Meeting: "accent", "Follow-up": "warn", Task: "neutral" } as const;

  return (
    <OsPage title="Sales Calendar" subtitle="Meetings, follow-ups, and task deadlines for the next 30 days.">
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center justify-between rounded-xl border border-[var(--dash-border)] px-4 py-3 font-inter text-sm">
            <span className="flex items-center gap-3">
              <OsBadge tone={tone[item.kind]}>{item.kind}</OsBadge>
              <span className="text-[var(--dash-text)]">{item.label}</span>
            </span>
            <span className="text-[var(--dash-muted)]">{formatDateTime(item.at)}</span>
          </li>
        ))}
        {items.length === 0 ? <li className="font-inter text-sm text-[var(--dash-muted)]">Nothing scheduled in the next 30 days.</li> : null}
      </ul>
    </OsPage>
  );
}
