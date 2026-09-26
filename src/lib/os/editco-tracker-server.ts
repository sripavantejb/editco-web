import { connectDB } from "@/lib/db";
import { EditcoTrackerRow } from "@/models/os/EditcoTrackerRow";
import { notifyStaff } from "@/lib/os/activity";
import { EDITCO_TEAM_EMAILS, type EditcoTeamName } from "@/lib/os/editco-tracker";

const IST_OFFSET_MS = 330 * 60 * 1000;

/** Midnight today in India, as a UTC instant — the team works on IST regardless of server zone. */
export function istDayStart(now = new Date()) {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET_MS);
}

/** `datetime-local` values carry no zone; the team enters them in IST. */
export function parseIstDateTime(raw: string | null | undefined) {
  const s = (raw || "").trim();
  if (!s) return undefined;
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(s);
  const d = new Date(hasZone ? s : `${s.length === 16 ? `${s}:00` : s}+05:30`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function trackerEmailFor(name: string) {
  return EDITCO_TEAM_EMAILS[name as EditcoTeamName] || "";
}

/** In-app + email notification to tracker teammates, skipping whoever made the change. */
export async function notifyTrackerPeople(input: {
  emails: string[];
  actorEmail: string;
  title: string;
  body: string;
}) {
  const actor = input.actorEmail.toLowerCase();
  const unique = [...new Set(input.emails.map((e) => e.toLowerCase()).filter(Boolean))].filter(
    (e) => e !== actor
  );
  await Promise.all(
    unique.map((email) =>
      notifyStaff({
        type: "editco_tracker",
        title: input.title,
        body: input.body,
        href: "/admin/os/editco",
        recipientEmail: email,
      })
    )
  );
}

/** Daily tasks completed on an earlier IST day reopen for today. */
export async function reopenStaleDailyTrackerRows() {
  await connectDB();
  const todayStart = istDayStart();
  const stale = await EditcoTrackerRow.find({
    kind: "daily",
    status: "completed",
    $or: [{ completedAt: { $lt: todayStart } }, { completedAt: { $exists: false } }],
  });
  for (const row of stale) {
    row.history.unshift({
      at: new Date(),
      byEmail: "system",
      byName: "System",
      field: "status",
      from: "Completed",
      to: "Not Yet started (new day)",
    });
    if (row.history.length > 40) row.history = row.history.slice(0, 40);
    row.status = "not_yet_started";
    row.completedAt = undefined;
    await row.save();
  }
}
