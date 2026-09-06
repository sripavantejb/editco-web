export const dynamic = "force-dynamic";

import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesActivityEvent } from "@/models/sales/SalesActivityEvent";
import { OsBadge, OsPage } from "@/components/os/ui";
import { formatDateTime } from "@/lib/utils";

export default async function SalesActivityTrackingPage() {
  const staff = await requireSalesAdminPage();
  const events = await SalesActivityEvent.find({ actorEmployeeId: staff.employeeId }).sort({ createdAt: -1 }).limit(60).lean();

  const counts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <OsPage title="Activity Tracking" subtitle="Legitimate CRM actions you've taken — for productivity, not surveillance.">
      <div className="mb-6 flex flex-wrap gap-2">
        {Object.entries(counts).map(([type, count]) => (
          <OsBadge key={type} tone="neutral">{type.replace(/_/g, " ")}: {count}</OsBadge>
        ))}
      </div>
      <ul className="space-y-2">
        {events.map((e) => (
          <li key={String(e._id)} className="flex items-center justify-between rounded-xl border border-[var(--dash-border)] px-4 py-3 font-inter text-sm">
            <span className="text-[var(--dash-text)]">{e.title}</span>
            <span className="text-[var(--dash-faint)]">{formatDateTime(e.createdAt)}</span>
          </li>
        ))}
        {events.length === 0 ? <li className="font-inter text-sm text-[var(--dash-muted)]">No activity yet.</li> : null}
      </ul>
    </OsPage>
  );
}
