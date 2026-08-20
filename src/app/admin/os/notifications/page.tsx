export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { OsNotification } from "@/models/os/Notification";
import { markAllNotificationsRead, markNotificationRead } from "@/actions/os/notifications";
import { OsPage } from "@/components/os/ui";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export default async function NotificationsPage() {
  const staff = await requireOsPage("notifications:read");
  const items = await OsNotification.find({ recipientEmail: staff.email })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <OsPage
      title="Notifications"
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={
        <form action={markAllNotificationsRead}>
          <button className="text-sm text-[var(--dash-accent)]" type="submit">
            Mark all read
          </button>
        </form>
      }
    >
      {items.length === 0 ? (
        <p className="font-inter text-sm text-[var(--dash-muted)]">
          No notifications yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={String(n._id)}
              className={`rounded-xl border border-[var(--dash-border)] px-4 py-3 font-inter text-sm ${
                n.readAt ? "opacity-60" : ""
              }`}
            >
              <p className="text-[var(--dash-text)]">{n.title}</p>
              <p className="text-[var(--dash-muted)]">{n.body}</p>
              <p className="text-[var(--dash-faint)]">
                {formatDateTime(n.createdAt)}
              </p>
              <div className="mt-2 flex gap-3">
                {n.href ? (
                  <Link href={n.href} className="text-[var(--dash-accent)]">
                    Open
                  </Link>
                ) : null}
                {!n.readAt ? (
                  <form action={markNotificationRead}>
                    <input type="hidden" name="id" value={String(n._id)} />
                    <button type="submit" className="text-xs">
                      Mark read
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </OsPage>
  );
}
