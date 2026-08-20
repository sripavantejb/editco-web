import type { InvoiceStatus } from "@/lib/os/constants";

export function roundRupees(n: number) {
  return Math.round(n);
}

export function lineSubtotal(qty: number, unitPrice: number) {
  return roundRupees(qty * unitPrice);
}

export function invoiceTotals(input: {
  lineItems: { quantity: number; unitPrice: number }[];
  taxRate: number;
  discount: number;
}) {
  const subtotal = input.lineItems.reduce(
    (sum, item) => sum + lineSubtotal(item.quantity, item.unitPrice),
    0
  );
  const discount = Math.max(0, input.discount || 0);
  const taxable = Math.max(0, subtotal - discount);
  const taxAmount = roundRupees(taxable * (input.taxRate || 0));
  const total = taxable + taxAmount;
  return { subtotal, discount, taxAmount, total };
}

export function displayInvoiceStatus(input: {
  status: InvoiceStatus;
  dueDate?: Date | string | null;
  amountPaid: number;
  total: number;
  now?: Date;
}): InvoiceStatus {
  if (input.status === "draft" || input.status === "cancelled") {
    return input.status;
  }
  if (input.amountPaid >= input.total && input.total > 0) return "paid";
  const now = input.now ?? new Date();
  const due = input.dueDate ? new Date(input.dueDate) : null;
  const overdue = Boolean(due && due.getTime() < now.getTime());
  if (input.amountPaid > 0 && input.amountPaid < input.total) {
    return overdue ? "overdue" : "partially_paid";
  }
  if (overdue) return "overdue";
  return input.amountPaid > 0 ? "partially_paid" : "issued";
}

export function outstandingOf(total: number, amountPaid: number) {
  return Math.max(0, total - amountPaid);
}
