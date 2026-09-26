"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity } from "@/lib/os/activity";
import { optDate, num, str } from "@/lib/os/form";
import { sendFinanceAlert } from "@/lib/os/finance-alerts";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { Transaction } from "@/models/os/Transaction";
import {
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
}) {
  await sendFinanceAlert({
    title: input.title,
    lines: summaryLines(input.tx),
    actor: input.actor,
    eyebrow: "Transactions",
    href: "/admin/os/transactions",
  });
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
