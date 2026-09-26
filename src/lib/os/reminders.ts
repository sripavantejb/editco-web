import { connectDB } from "@/lib/db";
import { sendMail, buildNotificationEmail } from "@/lib/mail";
import { formatCurrencyINR } from "@/lib/utils";
import { EditcoTrackerRow } from "@/models/os/EditcoTrackerRow";
import { OsTask } from "@/models/os/Task";
import { StaffUser } from "@/models/os/StaffUser";
import { RecurringPayment } from "@/models/os/RecurringPayment";
import { ReminderLog } from "@/models/os/ReminderLog";
import {
  EDITCO_TEAM_EMAILS,
  EDITCO_TEAM_NAMES,
  EDITCO_TRACKER_PRIORITY_LABELS,
  EDITCO_TRACKER_PRIORITY_RANK,
  isEditcoTrackerDone,
  type EditcoTrackerPriority,
} from "@/lib/os/editco-tracker";
import { istDayStart, reopenStaleDailyTrackerRows } from "@/lib/os/editco-tracker-server";
import { TRANSACTION_ALERT_EMAILS } from "@/lib/os/transactions";

export type ReminderSlot = "morning" | "evening";

const DAY_MS = 86400000;

type Section = { heading: string; items: string[] };

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function istTime(d: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

function istDate(d: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

function istDayKey(d = new Date()) {
  return new Date(istDayStart(d).getTime() + 330 * 60000).toISOString().slice(0, 10);
}

function renderSections(sections: Section[]) {
  return sections
    .filter((s) => s.items.length)
    .map(
      (s) =>
        `<strong style="color:#f5f5f5;">${escapeHtml(s.heading)} (${s.items.length})</strong><br/>` +
        s.items.map((i) => `• ${escapeHtml(i)}`).join("<br/>")
    )
    .join("<br/><br/>");
}

type Digest = { name: string; sections: Section[] };

function addSection(map: Map<string, Digest>, email: string, name: string, section: Section) {
  if (!email || section.items.length === 0) return;
  const key = email.toLowerCase();
  const d = map.get(key) || { name, sections: [] };
  const existing = d.sections.find((s) => s.heading === section.heading);
  if (existing) existing.items.push(...section.items);
  else d.sections.push({ heading: section.heading, items: [...section.items] });
  map.set(key, d);
}

/**
 * Morning: the day's plan. Evening (6 PM IST): what's still open before end of day.
 * Each person only gets items they own (tracker POC / dependency, assigned OS tasks);
 * founders + finance also get recurring payments coming due.
 */
export async function runDailyReminders(slot: ReminderSlot, opts: { force?: boolean } = {}) {
  await connectDB();
  await reopenStaleDailyTrackerRows();

  const now = new Date();
  const todayStart = istDayStart(now);
  const todayEnd = new Date(todayStart.getTime() + DAY_MS);
  const tomorrowEnd = new Date(todayStart.getTime() + 2 * DAY_MS);
  const soonEnd = new Date(todayStart.getTime() + 3 * DAY_MS);
  const digests = new Map<string, Digest>();

  const trackerRows = await EditcoTrackerRow.find({}).lean();
  const byPriority = (a: { priority?: string }, b: { priority?: string }) =>
    EDITCO_TRACKER_PRIORITY_RANK[(a.priority || "medium") as EditcoTrackerPriority] -
    EDITCO_TRACKER_PRIORITY_RANK[(b.priority || "medium") as EditcoTrackerPriority];
  const openRows = trackerRows.filter((r) => !isEditcoTrackerDone(String(r.status))).sort(byPriority);

  const label = (r: (typeof trackerRows)[number]) => {
    const pr = (r.priority || "medium") as EditcoTrackerPriority;
    const tag = pr === "urgent" || pr === "high" ? ` [${EDITCO_TRACKER_PRIORITY_LABELS[pr]}]` : "";
    return `${r.projectName} — ${r.taskName}${tag}`;
  };

  for (const name of EDITCO_TEAM_NAMES) {
    const email = EDITCO_TEAM_EMAILS[name];
    const mine = openRows.filter((r) => r.poc === name);
    const asDep = openRows.filter(
      (r) => r.poc !== name && ((r.dependency as string[]) || []).includes(name)
    );

    const daily = mine.filter((r) => r.kind === "daily");
    const deadlineRows = mine.filter((r) => r.kind !== "daily");
    const overdue = deadlineRows.filter((r) => r.deadline && new Date(r.deadline) < now);
    const dueToday = deadlineRows.filter(
      (r) => r.deadline && new Date(r.deadline) >= now && new Date(r.deadline) < todayEnd
    );
    const dueTomorrow = deadlineRows.filter(
      (r) => r.deadline && new Date(r.deadline) >= todayEnd && new Date(r.deadline) < tomorrowEnd
    );
    const upcoming = deadlineRows.filter(
      (r) => r.deadline && new Date(r.deadline) >= tomorrowEnd && new Date(r.deadline) < soonEnd
    );
    const noDeadline = deadlineRows.filter((r) => !r.deadline);

    addSection(digests, email, name, {
      heading: "Overdue",
      items: overdue.map((r) => `${label(r)} · was due ${istDate(r.deadline!)} ${istTime(r.deadline!)}`),
    });
    addSection(digests, email, name, {
      heading: "Due today",
      items: dueToday.map((r) => `${label(r)} · by ${istTime(r.deadline!)}`),
    });
    addSection(digests, email, name, {
      heading: slot === "morning" ? "Daily tasks for today" : "Daily tasks not done yet",
      items: daily.map(label),
    });
    addSection(digests, email, name, {
      heading: "Due tomorrow",
      items: dueTomorrow.map((r) => `${label(r)} · ${istTime(r.deadline!)}`),
    });
    if (slot === "morning") {
      addSection(digests, email, name, {
        heading: "Coming up in 3 days",
        items: upcoming.map((r) => `${label(r)} · ${istDate(r.deadline!)}`),
      });
      addSection(digests, email, name, {
        heading: "Open without a deadline",
        items: noDeadline.map(label),
      });
      addSection(digests, email, name, {
        heading: "Waiting on you (dependency)",
        items: asDep.map((r) => `${label(r)} · POC ${r.poc || "—"}`),
      });
    }
  }

  const tasks = await OsTask.find({
    recordStatus: "active",
    status: { $nin: ["completed", "cancelled"] },
    assignedToId: { $exists: true, $ne: null },
    dueDate: { $lt: slot === "morning" ? soonEnd : tomorrowEnd },
  })
    .select("title dueDate assignedToId")
    .lean();
  const assigneeIds = [...new Set(tasks.map((t) => String(t.assignedToId)))];
  const assignees = assigneeIds.length
    ? await StaffUser.find({ _id: { $in: assigneeIds }, isActive: true }).select("name email").lean()
    : [];
  const userById = new Map(assignees.map((u) => [String(u._id), u]));
  for (const t of tasks) {
    const u = userById.get(String(t.assignedToId));
    if (!u || !t.dueDate) continue;
    const due = new Date(t.dueDate);
    const heading =
      due < todayStart ? "Overdue tasks" : due < todayEnd ? "Tasks due today" : "Tasks due soon";
    addSection(digests, u.email, u.name || u.email, {
      heading,
      items: [`${t.title} · ${istDate(due)}`],
    });
  }

  const payments = await RecurringPayment.find({
    recordStatus: "active",
    status: "active",
    nextDueAt: { $lt: slot === "morning" ? soonEnd : tomorrowEnd },
  })
    .sort({ nextDueAt: 1 })
    .lean();
  if (payments.length) {
    const financeUsers = await StaffUser.find({ role: "finance", isActive: true }).select("name email").lean();
    const recipients = new Map<string, string>();
    for (const e of TRANSACTION_ALERT_EMAILS) recipients.set(e, e);
    for (const u of financeUsers) recipients.set(u.email.toLowerCase(), u.name || u.email);
    const items = payments.map((p) => {
      const due = new Date(p.nextDueAt);
      const when = due < todayStart ? `OVERDUE since ${istDate(due)}` : `due ${istDate(due)}`;
      return `${p.title}${p.payee ? ` (${p.payee})` : ""} · ${formatCurrencyINR(p.amount)} · ${when}`;
    });
    for (const [email, name] of recipients) {
      addSection(digests, email, name, { heading: "Recurring payments due", items });
    }
  }

  const dayKey = istDayKey(now);
  let sent = 0;
  let skipped = 0;
  for (const [email, digest] of digests) {
    const logKey = `${dayKey}:${slot}:${email}`;
    if (!opts.force) {
      const already = await ReminderLog.findOne({ key: logKey }).lean();
      if (already) {
        skipped++;
        continue;
      }
    }

    const first = digest.name.split(" ")[0] || "there";
    const title =
      slot === "morning"
        ? `Good morning ${first} — your plan for ${istDate(now)}`
        : `6 PM check-in ${first} — finish these before you log off`;
    const intro =
      slot === "morning"
        ? "Here's what's on your plate today."
        : "These are still open. Please complete or update them in Editco before end of day.";
    const body = `${escapeHtml(intro)}<br/><br/>${renderSections(digest.sections)}`;

    await sendMail({
      to: email,
      subject: title,
      text: `${intro}\n\n${digest.sections
        .filter((s) => s.items.length)
        .map((s) => `${s.heading}:\n${s.items.map((i) => `- ${i}`).join("\n")}`)
        .join("\n\n")}`,
      html: buildNotificationEmail({
        title,
        body,
        eyebrow: slot === "morning" ? "Morning reminder" : "Evening reminder",
        href: "/admin/os/editco",
        ctaLabel: "Open Master Tracker →",
      }),
    });
    await ReminderLog.updateOne(
      { key: logKey },
      { $setOnInsert: { key: logKey, email, slot, dayKey } },
      { upsert: true }
    );
    sent++;
  }

  return { slot, dayKey, sent, skipped, recipients: digests.size };
}
