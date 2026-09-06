"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import {
  EditcoTrackerRow,
  EditcoTrackerCheckIn,
} from "@/models/os/EditcoTrackerRow";
import {
  EDITCO_TRACKER_STATUSES,
  EDITCO_TRACKER_STATUS_LABELS,
  EDITCO_TEAM_EMAILS,
  EDITCO_TEAM_NAMES,
  type EditcoTeamName,
  type EditcoTrackerStatus,
} from "@/lib/os/editco-tracker";
import { requireStaff } from "@/lib/os/guard";
import { notifyStaff } from "@/lib/os/activity";
import type { ActionState } from "@/actions/auth";

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
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  const dependency = parsed.data.dependency ?? [];
  const poc = parsed.data.poc || "";
  const status = parsed.data.status || "not_yet_started";
  await EditcoTrackerRow.create({
    date: new Date(parsed.data.date),
    projectName: parsed.data.projectName,
    taskName: parsed.data.taskName,
    dependency,
    poc,
    status,
    remarks: parsed.data.remarks || "",
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

  const notifyNames = new Set<string>();
  if (poc) notifyNames.add(poc);
  for (const name of dependency) notifyNames.add(name);
  await Promise.all(
    [...notifyNames].map((name) => {
      const email = EDITCO_TEAM_EMAILS[name as EditcoTeamName];
      if (!email) return Promise.resolve();
      const isPoc = name === poc;
      return notifyStaff({
        type: "editco_tracker",
        title: isPoc
          ? `You're the POC on "${parsed.data.projectName}"`
          : `You're a dependency on "${parsed.data.projectName}"`,
        body: parsed.data.taskName,
        href: "/admin/os/editco",
        recipientEmail: email,
      });
    })
  );

  revalidateEditcoTracker();
  return { success: "Row added." };
}

const statusSchema = z.object({
  rowId: z.string().min(1),
  status: z.enum(EDITCO_TRACKER_STATUSES),
});

export async function updateEditcoTrackerRowStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };

  const parsed = statusSchema.safeParse({
    rowId: formData.get("rowId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Invalid input" };

  await connectDB();
  const row = await EditcoTrackerRow.findById(parsed.data.rowId);
  if (!row) return { error: "Row not found" };

  const from = EDITCO_TRACKER_STATUS_LABELS[row.status as EditcoTrackerStatus] || row.status;
  const to = EDITCO_TRACKER_STATUS_LABELS[parsed.data.status];
  pushHistory(row, {
    byEmail: gate.staff.email,
    byName: gate.staff.name,
    field: "status",
    from,
    to,
  });
  row.status = parsed.data.status;
  row.updatedBy = gate.staff.email;
  await row.save();

  revalidateEditcoTracker();
  return { success: "Status updated." };
}

const fieldSchema = z.object({
  rowId: z.string().min(1),
  field: z.enum(["status", "poc", "dependency", "remarks", "projectName", "taskName"]),
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

  if (field === "status") {
    const next = parsed.data.value as EditcoTrackerStatus;
    if (!EDITCO_TRACKER_STATUSES.includes(next)) return { error: "Invalid status" };
    from = EDITCO_TRACKER_STATUS_LABELS[row.status as EditcoTrackerStatus] || row.status;
    to = EDITCO_TRACKER_STATUS_LABELS[next];
    row.status = next;
  } else if (field === "poc") {
    const next = parsed.data.value || "";
    if (next && !(EDITCO_TEAM_NAMES as readonly string[]).includes(next)) {
      return { error: "Invalid POC" };
    }
    from = row.poc || "—";
    to = next || "—";
    row.poc = next;
  } else if (field === "dependency") {
    const next = (parsed.data.values || []).filter((n) =>
      (EDITCO_TEAM_NAMES as readonly string[]).includes(n)
    );
    from = (row.dependency as string[]).join(", ") || "—";
    to = next.join(", ") || "—";
    row.dependency = next;
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

  revalidateEditcoTracker();
  return { success: "Updated." };
}

export async function deleteEditcoTrackerRow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };

  const rowId = String(formData.get("rowId") || "");
  if (!rowId) return { error: "Invalid row" };

  await connectDB();
  await EditcoTrackerRow.findByIdAndDelete(rowId);

  revalidateEditcoTracker();
  return { success: "Row deleted." };
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
