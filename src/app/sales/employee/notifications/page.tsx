export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesNotification } from "@/models/sales/SalesNotification";
import { markSalesNotificationRead, markAllSalesNotificationsRead } from "@/actions/sales/notifications";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsBadge, OsPage } from "@/components/os/ui";
import { formatDateTime } from "@/lib/utils";

export default async function SalesNotificationsPage() {
  const staff = await requireSalesPage("admin.notifications");
  const notifications = await SalesNotification.find({ recipientEmployeeId: staff.employeeId }).sort({ createdAt: -1 }).limit(50).lean();
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <OsPage
      title="Notifications"
      subtitle={`${unread} unread.`}
      actions={
        unread > 0 ? (
          <OsActionForm action={markAllSalesNotificationsRead} submitLabel="Mark all read" showSubmit className="inline">{null}</OsActionForm>
        ) : undefined
      }
    >
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li key={String(n._id)} className={`flex items-center justify-between rounded-xl border px-4 py-3 font-inter text-sm ${n.readAt ? "border-[var(--dash-border)]" : "border-[var(--dash-accent)]"}`}>
            <div>
              <p className="text-[var(--dash-text)]">{n.title}</p>
              {n.body ? <p className="text-[var(--dash-muted)]">{n.body}</p> : null}
              <p className="text-[var(--dash-faint)]">{formatDateTime(n.createdAt)}</p>
            </div>
            {!n.readAt ? (
              <OsActionForm action={markSalesNotificationRead} submitLabel="Mark read" showSubmit className="inline">
                <input type="hidden" name="notificationId" value={String(n._id)} />
              </OsActionForm>
            ) : (
              <OsBadge tone="neutral">Read</OsBadge>
            )}
          </li>
        ))}
        {notifications.length === 0 ? <li className="font-inter text-sm text-[var(--dash-muted)]">No notifications yet.</li> : null}
      </ul>
    </OsPage>
  );
}
