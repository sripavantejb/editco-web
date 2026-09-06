export const dynamic = "force-dynamic";

import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { StaffUser } from "@/models/os/StaffUser";
import { OsBadge, OsPage } from "@/components/os/ui";
import { formatDateTime } from "@/lib/utils";

/**
 * Honest "last seen" rather than fake real-time presence — no websocket/live
 * infrastructure is wired up yet. lastLoginAt is the only real signal we have.
 */
export default async function SalesLiveStatusPage() {
  await requireSalesAdminPage();
  const employees = await SalesEmployee.find({ status: "active" }).lean();
  const staffUsers = await StaffUser.find({ _id: { $in: employees.map((e) => e.staffUserId) } })
    .select("name lastLoginAt")
    .lean();
  const staffById = new Map(staffUsers.map((s) => [String(s._id), s]));

  const now = Date.now();

  return (
    <OsPage
      title="Live Employee Status"
      subtitle="Last-seen, not live presence — no real-time infrastructure is connected yet, so this shows the most recent login rather than a fake 'online' badge."
    >
      <ul className="space-y-2">
        {employees.map((e) => {
          const s = staffById.get(String(e.staffUserId));
          const lastLogin = s?.lastLoginAt ? new Date(s.lastLoginAt) : null;
          const recentlyActive = lastLogin && now - lastLogin.getTime() < 30 * 60 * 1000;
          return (
            <li key={String(e._id)} className="flex items-center justify-between rounded-xl border border-[var(--dash-border)] px-4 py-3 font-inter text-sm">
              <span className="text-[var(--dash-text)]">{s?.name || "—"}</span>
              <span className="flex items-center gap-2 text-[var(--dash-muted)]">
                <OsBadge tone={recentlyActive ? "ok" : "neutral"}>{recentlyActive ? "Recently active" : "Away"}</OsBadge>
                {lastLogin ? formatDateTime(lastLogin) : "Never logged in"}
              </span>
            </li>
          );
        })}
      </ul>
    </OsPage>
  );
}
