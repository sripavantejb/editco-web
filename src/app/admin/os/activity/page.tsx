export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { ActivityEvent } from "@/models/os/ActivityEvent";
import { Conversion } from "@/models/os/Conversion";
import { resolveActorNames, actorKey } from "@/lib/os/activity";
import { ActivityTimeline } from "@/components/os/ActivityTimeline";
import { OsPage } from "@/components/os/ui";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

export default async function ActivityPage() {
  await requireOsPage("activity:read");
  const events = await ActivityEvent.find({}).sort({ createdAt: -1 }).limit(100).lean();
  const conversions = await Conversion.find({
    conversionUuid: { $in: events.map((e) => e.conversionUuid).filter(Boolean) },
  }).lean();
  const codeBy = Object.fromEntries(conversions.map((c) => [c.conversionUuid, c.publicCode]));
  const actorNames = await resolveActorNames(events);

  return (
    <OsPage
      title="Activity"
      subtitle="Operational history across leads, conversions, and delivery."
      backHref="/admin/os"
      backLabel="Back to dashboard"
    >
      <div className="mb-8">
        <ActivityTimeline events={events} actorNames={actorNames} />
      </div>
      <ol className="space-y-3 border-t border-[var(--dash-border)] pt-6">
        {events.map((e) => (
          <li
            key={String(e._id)}
            className="border-l border-[var(--dash-border)] pl-4 font-inter text-sm"
          >
            <p className="text-[var(--dash-text)]">
              <span className="font-medium">
                {actorNames.get(actorKey(e)) || e.createdBy}
              </span>{" "}
              — {e.title}
            </p>
            <p className="text-[var(--dash-muted)]">
              {formatDateTime(e.createdAt)}
              {e.detail ? ` · ${e.detail}` : ""}
              {e.conversionUuid && codeBy[e.conversionUuid] ? (
                <>
                  {" · "}
                  <Link
                    href={`/admin/os/c/${codeBy[e.conversionUuid]}`}
                    className="text-[var(--dash-accent)]"
                  >
                    {codeBy[e.conversionUuid]}
                  </Link>
                </>
              ) : null}
            </p>
          </li>
        ))}
      </ol>
    </OsPage>
  );
}
