import { formatDateTime, formatTime } from "@/lib/utils";
import { actorKey } from "@/lib/os/activity";

export type TimelineEvent = {
  _id: { toString(): string };
  title: string;
  detail?: string;
  createdAt: Date | string;
  createdBy?: string;
  actorUserId?: { toString(): string } | string | null;
  actionType?: string;
  metadata?: { actorName?: string } | null;
};

export function ActivityTimeline({
  events,
  actorNames,
}: {
  events: TimelineEvent[];
  actorNames: Map<string, string>;
}) {
  if (!events.length) {
    return (
      <p className="font-inter text-sm text-[var(--dash-muted)]">No activity yet.</p>
    );
  }

  const groups = new Map<string, TimelineEvent[]>();
  for (const e of events) {
    const d = new Date(e.createdAt);
    const key = d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const list = groups.get(key) || [];
    list.push(e);
    groups.set(key, list);
  }

  return (
    <div className="space-y-8">
      {[...groups.entries()].map(([day, dayEvents]) => (
        <section key={day}>
          <h3 className="mb-3 font-archivo text-[11px] uppercase tracking-[0.08em] text-[var(--dash-muted)]">
            {day}
          </h3>
          <ul className="space-y-3 border-l border-[var(--dash-border)] pl-4">
            {dayEvents.map((e) => {
              const name =
                actorNames.get(
                  actorKey({
                    actorUserId: e.actorUserId
                      ? String(e.actorUserId)
                      : null,
                    createdBy: e.createdBy,
                  })
                ) ||
                (e.metadata && e.metadata.actorName) ||
                e.createdBy ||
                "Unknown";
              const time = formatTime(e.createdAt);
              return (
                <li key={String(e._id)} className="relative">
                  <span className="absolute -left-[1.35rem] top-1.5 h-2 w-2 rounded-full bg-[var(--dash-accent)]" />
                  <p className="font-inter text-xs text-[var(--dash-muted)]">
                    {time}
                  </p>
                  <p className="font-inter text-sm text-[var(--dash-text)]">
                    <span className="font-medium">{name}</span>{" "}
                    {e.title.toLowerCase().startsWith(name.toLowerCase())
                      ? e.detail || ""
                      : e.detail
                        ? `${e.title.toLowerCase()}${e.detail ? ` — ${e.detail}` : ""}`
                        : e.title.toLowerCase()}
                  </p>
                  <p className="sr-only">{formatDateTime(e.createdAt)}</p>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
