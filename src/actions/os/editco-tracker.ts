"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import {
  EditcoTrackerRow,
  EditcoTrackerCheckIn,
} from "@/models/os/EditcoTrackerRow";
import {
  EDITCO_TRACKER_KINDS,
  EDITCO_TRACKER_KIND_LABELS,
  EDITCO_TRACKER_PRIORITIES,
  EDITCO_TRACKER_PRIORITY_LABELS,
  EDITCO_TRACKER_STATUSES,
  EDITCO_TRACKER_STATUS_LABELS,
  EDITCO_TEAM_EMAILS,
  EDITCO_TEAM_NAMES,
  type EditcoTrackerKind,
  type EditcoTrackerPriority,
  type EditcoTrackerStatus,
} from "@/lib/os/editco-tracker";
import { requireStaff } from "@/lib/os/guard";
import {
  notifyTrackerPeople,
  parseIstDateTime,
  trackerEmailFor,
} from "@/lib/os/editco-tracker-server";
import type { ActionState } from "@/actions/auth";

function formatIst(d: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

/** POC, dependencies, and whoever created the row — everyone who should hear about changes. */
function involvedEmails(row: { poc?: string | null; dependency?: string[] | null; createdBy?: string | null }) {
  return [
    trackerEmailFor(row.poc || ""),
    ...((row.dependency as string[]) || []).map(trackerEmailFor),
    row.createdBy || "",
  ];
}

function rowLabel(row: { projectName: string; taskName: string }) {
  return `${row.projectName} · ${row.taskName}`;
}

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function revalidateEditcoTracker() {
  revalidatePath("/admin/os/editco");
  revalidatePath("/admin/os", "layout");
}

function pushHistory(
  row: {
    history?: Array<{
      at: Date;
      byEmail: string;
      byName: string;
      field: string;
      from: string;
      to: string;
    }>;
  },
  entry: { byEmail: string; byName: string; field: string; from: string; to: string }
) {
  if (!row.history) row.history = [];
  row.history.unshift({
    at: new Date(),
    byEmail: entry.byEmail,
    byName: entry.byName,
    field: entry.field,
    from: entry.from,
    to: entry.to,
  });
  // Keep last 40 events per row
  if (row.history.length > 40) row.history = row.history.slice(0, 40);
}

const createSchema = z.object({
  date: z.string().min(1, "Date is required"),
  projectName: z.string().min(1, "Project name is required"),
  taskName: z.string().min(1, "Task name is required"),
  dependency: z.array(z.string()).optional(),
  poc: z.string().optional(),
  status: z.enum(EDITCO_TRACKER_STATUSES).optional(),
  remarks: z.string().optional(),
  priority: z.enum(EDITCO_TRACKER_PRIORITIES).optional(),
  kind: z.enum(EDITCO_TRACKER_KINDS).optional(),
  deadline: z.string().optional(),
});

export async function createEditcoTrackerRow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };

  const parsed = createSchema.safeParse({
    date: formData.get("date"),
    projectName: formData.get("projectName"),
    taskName: formData.get("taskName"),
    dependency: formData.getAll("dependency").filter(Boolean),
    poc: formData.get("poc") || undefined,
    status: formData.get("status") || undefined,
    remarks: formData.get("remarks") || undefined,
    priority: formData.get("priority") || undefined,
    kind: formData.get("kind") || undefined,
    deadline: formData.get("deadline") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  const dependency = parsed.data.dependency ?? [];
  const poc = parsed.data.poc || "";
  const status = parsed.data.status || "not_yet_started";
  const kind = parsed.data.kind || "deadline";
  const priority = parsed.data.priority || "medium";
  const deadline = kind === "deadline" ? parseIstDateTime(parsed.data.deadline) : undefined;
  await EditcoTrackerRow.create({
    date: new Date(parsed.data.date),
    projectName: parsed.data.projectName,
    taskName: parsed.data.taskName,
    dependency,
    poc,
    status,
    remarks: parsed.data.remarks || "",
    priority,
    kind,
    deadline,
    completedAt: status === "completed" ? new Date() : undefined,
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
    history: [
      {
        at: new Date(),
        byEmail: gate.staff.email,
        byName: gate.staff.name,
        field: "created",
        from: "",
        to: `${parsed.data.projectName} · ${parsed.data.taskName}`,
      },
    ],
  });

  const details = [
    EDITCO_TRACKER_KIND_LABELS[kind],
    `Priority: ${EDITCO_TRACKER_PRIORITY_LABELS[priority]}`,
    deadline ? `Due ${formatIst(deadline)}` : "",
    `Added by ${gate.staff.name || gate.staff.email}`,
  ]
    .filter(Boolean)
    .join(" · ");
  const label = rowLabel(parsed.data);
  if (poc) {
    await notifyTrackerPeople({
      emails: [trackerEmailFor(poc)],
      actorEmail: gate.staff.email,
      title: `Assigned to you: ${label}`,
      body: details,
    });
  }
  const depOnly = dependency.filter((n) => n !== poc);
  if (depOnly.length) {
    await notifyTrackerPeople({
      emails: depOnly.map(trackerEmailFor),
      actorEmail: gate.staff.email,
      title: `You're a dependency on: ${label}`,
      body: details,
    });
  }

  revalidateEditcoTracker();
  return { success: "Row added." };
}

const fieldSchema = z.object({
  rowId: z.string().min(1),
  field: z.enum([
    "status",
    "poc",
    "dependency",
    "remarks",
    "projectName",
    "taskName",
    "priority",
    "kind",
    "deadline",
  ]),
  value: z.string().optional(),
  values: z.array(z.string()).optional(),
});

export async function updateEditcoTrackerField(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };

  const parsed = fieldSchema.safeParse({
    rowId: formData.get("rowId"),
    field: formData.get("field"),
    value: formData.get("value") ?? undefined,
    values: formData.getAll("values").map(String).filter(Boolean),
  });
  if (!parsed.success) return { error: "Invalid input" };

  await connectDB();
  const row = await EditcoTrackerRow.findById(parsed.data.rowId);
  if (!row) return { error: "Row not found" };

  const { field } = parsed.data;
  let from = "";
  let to = "";
  const actor = gate.staff.name || gate.staff.email;
  const notices: { emails: string[]; title: string; body: string }[] = [];

  if (field === "status") {
    const next = parsed.data.value as EditcoTrackerStatus;
    if (!EDITCO_TRACKER_STATUSES.includes(next)) return { error: "Invalid status" };
    from = EDITCO_TRACKER_STATUS_LABELS[row.status as EditcoTrackerStatus] || row.status;
    to = EDITCO_TRACKER_STATUS_LABELS[next];
    row.status = next;
    row.completedAt = next === "completed" ? new Date() : undefined;
    if (from !== to) {
      notices.push({
        emails: involvedEmails(row),
        title:
          next === "completed"
            ? `Completed: ${rowLabel(row)}`
            : `Status ${to}: ${rowLabel(row)}`,
        body: `${actor} changed status ${from} → ${to}`,
      });
    }
  } else if (field === "poc") {
    const next = parsed.data.value || "";
    if (next && !(EDITCO_TEAM_NAMES as readonly string[]).includes(next)) {
      return { error: "Invalid POC" };
    }
    from = row.poc || "—";
    to = next || "—";
    const prevPoc = row.poc || "";
    row.poc = next;
    if (next && next !== prevPoc) {
      notices.push({
        emails: [trackerEmailFor(next)],
        title: `Assigned to you: ${rowLabel(row)}`,
        body: `${actor} made you the POC${row.deadline ? ` · due ${formatIst(row.deadline)}` : ""}`,
      });
    }
    if (prevPoc && prevPoc !== next) {
      notices.push({
        emails: [trackerEmailFor(prevPoc)],
        title: `Reassigned: ${rowLabel(row)}`,
        body: `${actor} moved POC from ${prevPoc} to ${next || "nobody"}`,
      });
    }
  } else if (field === "dependency") {
    const next = (parsed.data.values || []).filter((n) =>
      (EDITCO_TEAM_NAMES as readonly string[]).includes(n)
    );
    const prev = (row.dependency as string[]) || [];
    from = prev.join(", ") || "—";
    to = next.join(", ") || "—";
    row.dependency = next;
    const added = next.filter((n) => !prev.includes(n));
    if (added.length) {
      notices.push({
        emails: added.map(trackerEmailFor),
        title: `You're a dependency on: ${rowLabel(row)}`,
        body: `Added by ${actor}`,
      });
    }
  } else if (field === "priority") {
    const next = parsed.data.value as EditcoTrackerPriority;
    if (!EDITCO_TRACKER_PRIORITIES.includes(next)) return { error: "Invalid priority" };
    const prev = (row.priority || "medium") as EditcoTrackerPriority;
    from = EDITCO_TRACKER_PRIORITY_LABELS[prev];
    to = EDITCO_TRACKER_PRIORITY_LABELS[next];
    row.priority = next;
    if (from !== to && (next === "urgent" || next === "high")) {
      notices.push({
        emails: involvedEmails(row),
        title: `Priority ${to}: ${rowLabel(row)}`,
        body: `${actor} changed priority ${from} → ${to}`,
      });
    }
  } else if (field === "kind") {
    const next = parsed.data.value as EditcoTrackerKind;
    if (!EDITCO_TRACKER_KINDS.includes(next)) return { error: "Invalid type" };
    from = EDITCO_TRACKER_KIND_LABELS[(row.kind || "deadline") as EditcoTrackerKind];
    to = EDITCO_TRACKER_KIND_LABELS[next];
    row.kind = next;
    if (next === "daily") row.deadline = undefined;
  } else if (field === "deadline") {
    const next = parseIstDateTime(parsed.data.value);
    from = row.deadline ? formatIst(row.deadline) : "—";
    to = next ? formatIst(next) : "—";
    row.deadline = next;
    if (from !== to && next) {
      notices.push({
        emails: involvedEmails(row),
        title: `Deadline set: ${rowLabel(row)}`,
        body: `${actor} set the deadline to ${to} (was ${from})`,
      });
    }
  } else if (field === "remarks") {
    from = row.remarks || "—";
    to = parsed.data.value || "—";
    row.remarks = parsed.data.value || "";
  } else if (field === "projectName") {
    const next = (parsed.data.value || "").trim();
    if (!next) return { error: "Project name required" };
    from = row.projectName;
    to = next;
    row.projectName = next;
  } else if (field === "taskName") {
    const next = (parsed.data.value || "").trim();
    if (!next) return { error: "Task name required" };
    from = row.taskName;
    to = next;
    row.taskName = next;
  }

  if (from !== to) {
    pushHistory(row, {
      byEmail: gate.staff.email,
      byName: gate.staff.name,
      field,
      from,
      to,
    });
  }
  row.updatedBy = gate.staff.email;
  await row.save();

  for (const n of notices) {
    await notifyTrackerPeople({ ...n, actorEmail: gate.staff.email });
  }

  revalidateEditcoTracker();
  return { success: "Updated." };
}

export async function deleteEditcoTrackerRow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };

  const rowId = String(formData.get("rowId") || "");
  if (!rowId) return { error: "Invalid row" };

  await connectDB();
  const row = await EditcoTrackerRow.findByIdAndDelete(rowId);
  if (row) {
    await notifyTrackerPeople({
      emails: involvedEmails(row),
      actorEmail: gate.staff.email,
      title: `Deleted: ${rowLabel(row)}`,
      body: `Removed from Master Tracker by ${gate.staff.name || gate.staff.email}`,
    });
  }

  revalidateEditcoTracker();
  return { success: "Row deleted." };
}

export async function sendTrackerRemindersNow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };
  const slot = formData.get("slot") === "evening" ? "evening" : "morning";
  const { runDailyReminders } = await import("@/lib/os/reminders");
  const result = await runDailyReminders(slot, { force: true });
  return {
    success: result.sent
      ? `Sent ${slot} reminders to ${result.sent} ${result.sent === 1 ? "person" : "people"}`
      : "Nothing due — no reminders needed",
  };
}

/** Idempotent daily clock-in when opening Master Tracker. */
export async function ensureEditcoTrackerCheckIn(): Promise<{
  checkedInAt: string;
  isNew: boolean;
} | null> {
  const gate = await requireStaff("*");
  if (!gate.ok) return null;

  await connectDB();
  const key = dayKey();
  const existing = await EditcoTrackerCheckIn.findOne({
    email: gate.staff.email,
    dayKey: key,
  }).lean();

  if (existing) {
    return { checkedInAt: new Date(existing.checkedInAt).toISOString(), isNew: false };
  }

  const created = await EditcoTrackerCheckIn.create({
    email: gate.staff.email,
    dayKey: key,
    checkedInAt: new Date(),
    name: gate.staff.name,
  });

  return { checkedInAt: created.checkedInAt.toISOString(), isNew: true };
}

export async function getTodayEditcoCheckIns() {
  const gate = await requireStaff("*");
  if (!gate.ok) return [];
  await connectDB();
  const rows = await EditcoTrackerCheckIn.find({ dayKey: dayKey() })
    .sort({ checkedInAt: 1 })
    .select("email name checkedInAt")
    .lean();

  const byEmail = new Map(
    rows.map((r) => [String(r.email).toLowerCase(), r] as const)
  );

  // Always show the full tracker team so missing people are visible as "not yet".
  const team = EDITCO_TEAM_NAMES.map((name) => {
    const email = EDITCO_TEAM_EMAILS[name].toLowerCase();
    const hit = byEmail.get(email);
    return {
      email,
      name,
      checkedInAt: hit?.checkedInAt ? new Date(hit.checkedInAt).toISOString() : null,
    };
  });

  // Include any other staff who checked in (beyond the core three).
  for (const r of rows) {
    const email = String(r.email).toLowerCase();
    if (team.some((t) => t.email === email)) continue;
    team.push({
      email,
      name: r.name || email,
      checkedInAt: r.checkedInAt ? new Date(r.checkedInAt).toISOString() : null,
    });
  }

  return team;
}
