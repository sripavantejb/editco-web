"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { ManualRevenue } from "@/models/os/ManualRevenue";
import { Project } from "@/models/os/Project";
import { requireStaff } from "@/lib/os/guard";
import { logActivity } from "@/lib/os/activity";
import { sendFinanceAlert, type FinanceChange } from "@/lib/os/finance-alerts";
import { str } from "@/lib/os/form";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { TRANSACTION_PAYMENT_METHOD_LABELS } from "@/lib/os/transactions";
import type { ActionState } from "@/actions/auth";

const entrySchema = z.object({
  source: z.string().min(1, "Source is required"),
  description: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  receivedAt: z.string().min(1, "Date is required"),
  projectId: z.string().optional(),
  paymentMethod: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type Snapshot = {
  source: string;
  amount: number;
  receivedAt: Date;
  project: string;
  paymentMethod: string;
  reference: string;
  description: string;
  notes: string;
};

const FIELD_LABELS: Record<keyof Snapshot, string> = {
  source: "Source",
  amount: "Amount",
  receivedAt: "Received on",
  project: "Project",
  paymentMethod: "Payment method",
  reference: "Reference",
  description: "Description",
  notes: "Notes",
};

function revalidateFinance() {
  revalidatePath("/admin/os", "layout");
  revalidatePath("/admin/os/revenue");
  revalidatePath("/admin/os/transactions");
}

function methodLabel(m: string) {
  return TRANSACTION_PAYMENT_METHOD_LABELS[m as keyof typeof TRANSACTION_PAYMENT_METHOD_LABELS] || m;
}

function display(field: keyof Snapshot, s: Snapshot) {
  const v = s[field];
  if (field === "amount") return formatCurrencyINR(Number(v));
  if (field === "receivedAt") return formatDate(v as Date);
  if (field === "paymentMethod") return methodLabel(String(v || ""));
  return String(v || "");
}

function lines(s: Snapshot): [string, string][] {
  return (Object.keys(FIELD_LABELS) as (keyof Snapshot)[]).map((f) => [FIELD_LABELS[f], display(f, s)]);
}

function diff(before: Snapshot, after: Snapshot): FinanceChange[] {
  return (Object.keys(FIELD_LABELS) as (keyof Snapshot)[])
    .map((f) => ({ field: FIELD_LABELS[f], from: display(f, before), to: display(f, after) }))
    .filter((c) => c.from !== c.to);
}

async function projectLabel(projectId?: unknown) {
  if (!projectId) return "";
  const p = await Project.findById(projectId).select("name").lean<{ name?: string }>();
  return p?.name || "";
}

async function snapshotOf(row: {
  source: string;
  amount: number;
  receivedAt?: Date | null;
  projectId?: unknown;
  paymentMethod?: string | null;
  reference?: string | null;
  description?: string | null;
  notes?: string | null;
}): Promise<Snapshot> {
  return {
    source: row.source,
    amount: row.amount,
    receivedAt: row.receivedAt || new Date(),
    project: await projectLabel(row.projectId),
    paymentMethod: row.paymentMethod || "",
    reference: row.reference || "",
    description: row.description || "",
    notes: row.notes || "",
  };
}

async function parse(formData: FormData) {
  const parsed = entrySchema.safeParse({
    source: formData.get("source"),
    description: formData.get("description") || undefined,
    amount: formData.get("amount"),
    receivedAt: formData.get("receivedAt"),
    projectId: formData.get("projectId") || undefined,
    paymentMethod: formData.get("paymentMethod") || undefined,
    reference: formData.get("reference") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  let projectId: unknown = undefined;
  let vendorId: unknown = undefined;
  if (parsed.data.projectId) {
    const project = await Project.findById(parsed.data.projectId)
      .select("vendorId recordStatus")
      .lean<{ _id: unknown; vendorId?: unknown; recordStatus?: string }>();
    if (!project || project.recordStatus !== "active") return { error: "Project not found" };
    projectId = project._id;
    vendorId = project.vendorId;
  }

  return {
    fields: {
      source: parsed.data.source,
      description: parsed.data.description || "",
      amount: parsed.data.amount,
      receivedAt: new Date(parsed.data.receivedAt),
      projectId,
      vendorId,
      paymentMethod: parsed.data.paymentMethod || "",
      reference: parsed.data.reference || "",
      notes: parsed.data.notes || "",
    },
  };
}

export async function createManualRevenue(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("finance:read");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const result = await parse(formData);
  if (!result.fields) return { error: result.error };

  const row = await ManualRevenue.create({
    ...result.fields,
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
    history: [{ action: "created", changes: [], by: gate.staff.email, at: new Date() }],
  });

  const snap = await snapshotOf(row);
  const title = `Revenue added: ${snap.source} · ${formatCurrencyINR(snap.amount)}`;
  await logActivity({
    title,
    detail: [snap.project, formatDate(snap.receivedAt)].filter(Boolean).join(" · "),
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    projectId: result.fields.projectId ? String(result.fields.projectId) : undefined,
    entityType: "manual_revenue",
    entityId: String(row._id),
  });
  await sendFinanceAlert({
    title,
    lines: lines(snap),
    actor: gate.staff.email,
    eyebrow: "Revenue",
    href: "/admin/os/revenue",
  });

  revalidateFinance();
  return { success: "Revenue entry added." };
}

export async function updateManualRevenue(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("payments:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const row = await ManualRevenue.findById(str(formData, "id"));
  if (!row || row.recordStatus !== "active") return { error: "Revenue entry not found" };

  const result = await parse(formData);
  if (!result.fields) return { error: result.error };

  const before = await snapshotOf(row);
  const after = await snapshotOf(result.fields);
  const changes = diff(before, after);
  if (changes.length === 0) return { success: "No changes to save" };

  Object.assign(row, result.fields);
  row.updatedBy = gate.staff.email;
  row.history.push({ action: "updated", changes, by: gate.staff.email, at: new Date() });
  await row.save();

  const title = `Revenue edited: ${after.source}`;
  await logActivity({
    title,
    detail: changes.map((c) => `${c.field}: ${c.from || "—"} → ${c.to || "—"}`).join(" · "),
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    entityType: "manual_revenue",
    entityId: String(row._id),
  });
  await sendFinanceAlert({
    title,
    lines: lines(after),
    actor: gate.staff.email,
    changes,
    eyebrow: "Revenue",
    href: "/admin/os/revenue",
  });

  revalidateFinance();
  return { success: "Revenue entry updated" };
}

export async function archiveManualRevenue(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("payments:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const entry = await ManualRevenue.findById(str(formData, "id"));
  if (!entry || entry.recordStatus !== "active") {
    return { error: "Revenue entry not found" };
  }
  entry.recordStatus = "archived";
  entry.updatedBy = gate.staff.email;
  entry.history.push({ action: "deleted", changes: [], by: gate.staff.email, at: new Date() });
  await entry.save();

  const snap = await snapshotOf(entry);
  const title = `Revenue deleted: ${snap.source} · ${formatCurrencyINR(snap.amount)}`;
  await logActivity({
    title,
    detail: [snap.project, formatDate(snap.receivedAt)].filter(Boolean).join(" · "),
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    entityType: "manual_revenue",
    entityId: String(entry._id),
  });
  await sendFinanceAlert({
    title,
    lines: lines(snap),
    actor: gate.staff.email,
    eyebrow: "Revenue",
    href: "/admin/os/revenue",
  });

  revalidateFinance();
  return { success: "Revenue entry deleted" };
}
