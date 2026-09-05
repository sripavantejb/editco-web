export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesActivityEvent } from "@/models/sales/SalesActivityEvent";
import { OsPage } from "@/components/os/ui";
import { formatDateTime } from "@/lib/utils";

export default async function SalesActivityTimelinePage() {
  const staff = await requireSalesPage("workforce.activity_timeline");
  const events = await SalesActivityEvent.find({ actorEmployeeId: staff.employeeId }).sort({ createdAt: -1 }).limit(100).lean();

  return (
    <OsPage title="Activity Timeline" subtitle="A single chronological feed of everything you've done in the CRM.">
      <ol className="relative space-y-4 border-l border-[var(--dash-border)] pl-6">
        {events.map((e) => (
          <li key={String(e._id)} className="relative">
            <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--dash-accent)]" />
            <p className="font-inter text-sm text-[var(--dash-text)]">{e.title}</p>
            {e.detail ? <p className="font-inter text-xs text-[var(--dash-muted)]">{e.detail}</p> : null}
            <p className="font-inter text-xs text-[var(--dash-faint)]">{formatDateTime(e.createdAt)}</p>
          </li>
        ))}
        {events.length === 0 ? <li className="font-inter text-sm text-[var(--dash-muted)]">No activity yet.</li> : null}
      </ol>
    </OsPage>
  );
}
