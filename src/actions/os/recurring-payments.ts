"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity, notifyStaff } from "@/lib/os/activity";
import { num, optDate, str } from "@/lib/os/form";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import {
  RecurringPayment,
  RECURRING_PAYMENT_FREQUENCIES,
  type RecurringPaymentFrequency,
} from "@/models/os/RecurringPayment";
import type { ActionState } from "@/actions/auth";

function revalidateRecurring() {
  revalidatePath("/admin/os", "layout");
  revalidatePath("/admin/os/recurring-payments");
}

function advanceDueDate(from: Date, frequency: RecurringPaymentFrequency): Date {
  const next = new Date(from);
  if (frequency === "weekly") next.setDate(next.getDate() + 7);
  else if (frequency === "monthly") next.setMonth(next.getMonth() + 1);
  else if (frequency === "quarterly") next.setMonth(next.getMonth() + 3);
  else next.setFullYear(next.getFullYear() + 1);
  return next;
}

async function alertFinanceAboutRecurring(input: {
  title: string;
  body: string;
  createdBy: string;
  entityId: string;
}) {
  await notifyStaff({
    type: "recurring_payment",
    title: input.title,
    body: input.body,
    href: "/admin/os/recurring-payments",
    recipientRole: "finance",
  });
  await notifyStaff({
    type: "recurring_payment",
    title: input.title,
    body: input.body,
    href: "/admin/os/recurring-payments",
    recipientRole: "super_admin",
  });
  await logActivity({
    title: input.title,
    detail: input.body,
    createdBy: input.createdBy,
    entityType: "recurring_payment",
    entityId: input.entityId,
  });
}

export async function createRecurringPayment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("payments:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const title = str(formData, "title");
  const amount = num(formData, "amount");
  const nextDueAt = optDate(formData, "nextDueAt");
  const frequency = (str(formData, "frequency") ||
    "monthly") as RecurringPaymentFrequency;

  if (!title) return { error: "Title is required" };
  if (amount <= 0) return { error: "Amount must be greater than 0" };
  if (!nextDueAt) return { error: "Next due date is required" };
  if (!RECURRING_PAYMENT_FREQUENCIES.includes(frequency)) {
    return { error: "Invalid frequency" };
  }

  const row = await RecurringPayment.create({
    title,
    payee: str(formData, "payee"),
    amount,
    frequency,
    nextDueAt,
    notes: str(formData, "notes"),
    status: "active",
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  await alertFinanceAboutRecurring({
    title: "Recurring payment reminder set",
    body: `${title} · ${formatCurrencyINR(amount)} · ${frequency} · next ${formatDate(nextDueAt)}`,
    createdBy: gate.staff.email,
    entityId: String(row._id),
  });

  revalidateRecurring();
  return { success: "Recurring payment saved — finance alert sent" };
}

export async function updateRecurringPayment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("payments:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const row = await RecurringPayment.findById(str(formData, "id"));
  if (!row || row.recordStatus !== "active") {
    return { error: "Recurring payment not found" };
  }

  const title = str(formData, "title") || row.title;
  const amount = num(formData, "amount") || row.amount;
  const nextDueAt = optDate(formData, "nextDueAt") || row.nextDueAt;
  const frequency = (str(formData, "frequency") ||
    row.frequency) as RecurringPaymentFrequency;
  const status = str(formData, "status") || row.status;

  if (!RECURRING_PAYMENT_FREQUENCIES.includes(frequency)) {
    return { error: "Invalid frequency" };
  }

  row.title = title;
  row.payee = str(formData, "payee");
  row.amount = amount;
  row.frequency = frequency;
  row.nextDueAt = nextDueAt;
  row.notes = str(formData, "notes");
  if (status === "active" || status === "paused" || status === "ended") {
    row.status = status;
  }
  row.updatedBy = gate.staff.email;
  await row.save();

  revalidateRecurring();
  return { success: "Recurring payment updated" };
}

export async function markRecurringPaymentPaid(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("payments:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const row = await RecurringPayment.findById(str(formData, "id"));
  if (!row || row.recordStatus !== "active") {
    return { error: "Recurring payment not found" };
  }
  if (row.status !== "active") {
    return { error: "Only active recurring payments can be marked paid" };
  }

  const paidAt = optDate(formData, "paidAt") || new Date();
  const from = row.nextDueAt && row.nextDueAt > paidAt ? row.nextDueAt : paidAt;
  row.lastPaidAt = paidAt;
  row.nextDueAt = advanceDueDate(from, row.frequency as RecurringPaymentFrequency);
  row.updatedBy = gate.staff.email;
  await row.save();

  await alertFinanceAboutRecurring({
    title: "Recurring payment marked paid",
    body: `${row.title} · ${formatCurrencyINR(row.amount)} · next due ${formatDate(row.nextDueAt)}`,
    createdBy: gate.staff.email,
    entityId: String(row._id),
  });

  revalidateRecurring();
  return { success: "Marked paid — next due date advanced" };
}

export async function archiveRecurringPayment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("payments:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const row = await RecurringPayment.findById(str(formData, "id"));
  if (!row || row.recordStatus !== "active") {
    return { error: "Recurring payment not found" };
  }
  row.recordStatus = "archived";
  row.status = "ended";
  row.updatedBy = gate.staff.email;
  await row.save();

  revalidateRecurring();
  return { success: "Recurring payment deleted" };
}

export async function sendRecurringPaymentReminders(
  _prev: ActionState,
  _formData?: FormData
): Promise<ActionState> {
  const gate = await requireStaff("payments:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 86400000);
  const due = await RecurringPayment.find({
    recordStatus: "active",
    status: "active",
    nextDueAt: { $lte: in7 },
  })
    .sort({ nextDueAt: 1 })
    .lean();

  if (due.length === 0) {
    return { success: "No recurring payments due in the next 7 days" };
  }

  const lines = due
    .map(
      (r) =>
        `${r.title}: ${formatCurrencyINR(r.amount)} due ${formatDate(r.nextDueAt)}`
    )
    .join(" · ");

  await alertFinanceAboutRecurring({
    title: `Recurring payment reminders (${due.length})`,
    body: lines,
    createdBy: gate.staff.email,
    entityId: String(due[0]._id),
  });

  await RecurringPayment.updateMany(
    { _id: { $in: due.map((r) => r._id) } },
    { $set: { lastRemindedAt: now, updatedBy: gate.staff.email } }
  );

  revalidateRecurring();
  return { success: `Sent ${due.length} reminder(s) to finance` };
}
