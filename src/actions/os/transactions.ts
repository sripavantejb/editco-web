"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity } from "@/lib/os/activity";
import { optDate, num, str } from "@/lib/os/form";
import { sendNotificationEmail } from "@/lib/mail";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { Transaction } from "@/models/os/Transaction";
import {
  TRANSACTION_ALERT_EMAILS,
  TRANSACTION_PAYMENT_METHODS,
  TRANSACTION_PAYMENT_METHOD_LABELS,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_LABELS,
  type TransactionPaymentMethod,
  type TransactionType,
} from "@/lib/os/transactions";
import type { ActionState } from "@/actions/auth";

type TxFields = {
  type: TransactionType;
  title: string;
  category: string;
  amount: number;
  date: Date;
  party: string;
  paymentMethod: TransactionPaymentMethod;
  reference: string;
  notes: string;
};

type TxChange = { field: string; from: string; to: string };

const FIELD_LABELS: Record<keyof TxFields, string> = {
  type: "Type",
  title: "Title",
  category: "Category",
  amount: "Amount",
  date: "Date",
  party: "Paid to / received from",
  paymentMethod: "Payment method",
  reference: "Reference",
  notes: "Notes",
};

function revalidateFinance() {
  revalidatePath("/admin/os", "layout");
  revalidatePath("/admin/os/transactions");
  revalidatePath("/admin/os/revenue");
}

function parseFields(formData: FormData): { data?: TxFields; error?: string } {
  const type = str(formData, "type") as TransactionType;
  const paymentMethod = (str(formData, "paymentMethod") || "upi") as TransactionPaymentMethod;
  const title = str(formData, "title");
  const amount = num(formData, "amount");
  const date = optDate(formData, "date");

  if (!TRANSACTION_TYPES.includes(type)) return { error: "Choose income or spent" };
  if (!title) return { error: "Title is required" };
  if (amount <= 0) return { error: "Amount must be greater than 0" };
  if (!date) return { error: "Date is required" };
  if (!TRANSACTION_PAYMENT_METHODS.includes(paymentMethod)) {
    return { error: "Invalid payment method" };
  }

  return {
    data: {
      type,
      title,
      category: str(formData, "category"),
      amount,
      date,
      party: str(formData, "party"),
      paymentMethod,
      reference: str(formData, "reference"),
      notes: str(formData, "notes"),
    },
  };
}

function displayValue(field: keyof TxFields, value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  if (field === "amount") return formatCurrencyINR(Number(value));
  if (field === "date") return formatDate(value as Date);
  if (field === "type") return TRANSACTION_TYPE_LABELS[value as TransactionType] || String(value);
  if (field === "paymentMethod") {
    return TRANSACTION_PAYMENT_METHOD_LABELS[value as TransactionPaymentMethod] || String(value);
  }
  return String(value);
}

function diffFields(before: TxFields, after: TxFields): TxChange[] {
  const changes: TxChange[] = [];
  for (const field of Object.keys(FIELD_LABELS) as (keyof TxFields)[]) {
    const from = displayValue(field, before[field]);
    const to = displayValue(field, after[field]);
    if (from !== to) changes.push({ field: FIELD_LABELS[field], from, to });
  }
  return changes;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function summaryLines(tx: TxFields) {
  return [
    ["Type", displayValue("type", tx.type)],
    ["Amount", displayValue("amount", tx.amount)],
    ["Date", displayValue("date", tx.date)],
    ["Category", tx.category],
    [tx.type === "income" ? "Received from" : "Paid to", tx.party],
    ["Payment method", displayValue("paymentMethod", tx.paymentMethod)],
    ["Reference", tx.reference],
    ["Notes", tx.notes],
  ].filter(([, v]) => v) as [string, string][];
}

async function emailTransactionAlert(input: {
  title: string;
  tx: TxFields;
  actor: string;
  changes?: TxChange[];
}) {
  const lines = summaryLines(input.tx)
    .map(([k, v]) => `<strong style="color:#f5f5f5;">${escapeHtml(k)}:</strong> ${escapeHtml(v)}`)
    .join("<br/>");
  const changeLines = input.changes?.length
    ? `<br/><br/><strong style="color:#f5f5f5;">Changes</strong><br/>` +
      input.changes
        .map(
          (c) =>
            `${escapeHtml(c.field)}: ${escapeHtml(c.from || "—")} → ${escapeHtml(c.to || "—")}`
        )
        .join("<br/>")
    : "";
  const body = `${lines}${changeLines}<br/><br/>By ${escapeHtml(input.actor)}`;

  await Promise.all(
    TRANSACTION_ALERT_EMAILS.map((to) =>
      sendNotificationEmail({
        to,
        title: input.title,
        body,
        eyebrow: "Transactions",
        href: "/admin/os/transactions",
        ctaLabel: "Open transactions →",
      })
    )
  );
}

function toFields(row: TxFields): TxFields {
  return {
    type: row.type,
    title: row.title,
    category: row.category || "",
    amount: row.amount,
    date: row.date,
    party: row.party || "",
    paymentMethod: row.paymentMethod,
    reference: row.reference || "",
    notes: row.notes || "",
  };
}

export async function createTransaction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("payments:write");
  if (!gate.ok) return { error: gate.error };

  const parsed = parseFields(formData);
  if (!parsed.data) return { error: parsed.error };
  const data = parsed.data;

  await connectDB();
  const row = await Transaction.create({
    ...data,
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
    history: [{ action: "created", changes: [], by: gate.staff.email, at: new Date() }],
  });

  const label = TRANSACTION_TYPE_LABELS[data.type];
  const title = `${label} added: ${data.title} · ${formatCurrencyINR(data.amount)}`;
  await logActivity({
    title,
    detail: `${data.category || label} · ${formatDate(data.date)}`,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    entityType: "transaction",
    entityId: String(row._id),
  });
  await emailTransactionAlert({ title, tx: data, actor: gate.staff.email });

  revalidateFinance();
  return { success: `${label} entry added` };
}

export async function updateTransaction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("payments:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const row = await Transaction.findById(str(formData, "id"));
  if (!row || row.recordStatus !== "active") return { error: "Transaction not found" };

  const parsed = parseFields(formData);
  if (!parsed.data) return { error: parsed.error };
  const next = parsed.data;

  const before = toFields(row);
  const changes = diffFields(before, next);
  if (changes.length === 0) return { success: "No changes to save" };

  Object.assign(row, next);
  row.updatedBy = gate.staff.email;
  row.history.push({ action: "updated", changes, by: gate.staff.email, at: new Date() });
  await row.save();

  const title = `Transaction edited: ${next.title}`;
  await logActivity({
    title,
    detail: changes.map((c) => `${c.field}: ${c.from || "—"} → ${c.to || "—"}`).join(" · "),
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    entityType: "transaction",
    entityId: String(row._id),
  });
  await emailTransactionAlert({ title, tx: next, actor: gate.staff.email, changes });

  revalidateFinance();
  return { success: "Transaction updated" };
}

export async function archiveTransaction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("payments:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const row = await Transaction.findById(str(formData, "id"));
  if (!row || row.recordStatus !== "active") return { error: "Transaction not found" };

  row.recordStatus = "archived";
  row.updatedBy = gate.staff.email;
  row.history.push({ action: "deleted", changes: [], by: gate.staff.email, at: new Date() });
  await row.save();

  const tx = toFields(row);
  const title = `Transaction deleted: ${tx.title} · ${formatCurrencyINR(tx.amount)}`;
  await logActivity({
    title,
    detail: `${TRANSACTION_TYPE_LABELS[tx.type]} · ${formatDate(tx.date)}`,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    entityType: "transaction",
    entityId: String(row._id),
  });
  await emailTransactionAlert({ title, tx, actor: gate.staff.email });

  revalidateFinance();
  return { success: "Transaction deleted" };
}
