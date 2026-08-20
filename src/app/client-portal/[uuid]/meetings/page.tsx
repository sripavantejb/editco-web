export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { resolvePortalByUuid } from "@/lib/os/resolve-portal";
import { Meeting } from "@/models/os/Meeting";
import { formatDateTime } from "@/lib/utils";
import { PortalCard, PortalPageHeader } from "@/components/os/portal/ui";

export default async function ClientMeetingsPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const portal = await resolvePortalByUuid(uuid);
  if (!portal) notFound();
  const meetings = await Meeting.find({
    conversionUuid: portal.conversion.conversionUuid,
    recordStatus: "active",
    visibleToClient: true,
  })
    .sort({ startsAt: -1 })
    .lean();

  return (
    <main className="px-4 py-10 sm:px-8">
      <PortalPageHeader
        title="Meetings"
        subtitle="Notes from sessions shared with you."
      />
      <ul className="space-y-4">
        {meetings.map((m) => (
          <li key={String(m._id)}>
            <PortalCard className="font-inter text-sm">
              <p className="text-lg text-[var(--dash-text)]">{m.title}</p>
              <p className="text-[var(--dash-muted)]">
                {formatDateTime(m.startsAt)}
              </p>
              {m.discussion ? <p className="mt-2">{m.discussion}</p> : null}
              {m.decisions ? (
                <p className="mt-2 text-[var(--dash-muted)]">
                  Decisions: {m.decisions}
                </p>
              ) : null}
              {m.actionItems ? (
                <p className="mt-2 text-[var(--dash-muted)]">
                  Actions: {m.actionItems}
                </p>
              ) : null}
            </PortalCard>
          </li>
        ))}
      </ul>
      {meetings.length === 0 ? (
        <p className="font-inter text-sm text-[var(--dash-muted)]">
          No meeting notes yet.
        </p>
      ) : null}
    </main>
  );
}
