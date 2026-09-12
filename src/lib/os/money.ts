import type { InvoiceStatus } from "@/lib/os/constants";

export function roundRupees(n: number) {
  return Math.round(n);
}

export function lineSubtotal(qty: number, unitPrice: number) {
  return roundRupees(qty * unitPrice);
}

export function invoiceTotals(input: {
  lineItems: {
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
  }[];
  taxRate: number;
  discount: number;
  isInterState?: boolean;
}) {
  let subtotal = 0;
  let totalLineDiscount = 0;

  for (const item of input.lineItems) {
    const gross = (item.quantity || 0) * (item.unitPrice || 0);
    const discPercent = Math.max(0, Math.min(100, item.discountPercent || 0));
    const discAmount = (gross * discPercent) / 100;
    subtotal += gross;
    totalLineDiscount += discAmount;
  }

  const overallDiscount = Math.max(0, input.discount || 0);
  const totalDiscount = roundRupees(totalLineDiscount + overallDiscount);
  const taxable = Math.max(0, roundRupees(subtotal - totalDiscount));
  const rate = Math.max(0, input.taxRate || 0);

  const isInterState = Boolean(input.isInterState);
  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (isInterState) {
    igstRate = rate;
    igstAmount = roundRupees(taxable * igstRate);
  } else {
    cgstRate = rate / 2;
    sgstRate = rate / 2;
    cgstAmount = roundRupees(taxable * cgstRate);
    sgstAmount = roundRupees(taxable * sgstRate);
  }

  const taxAmount = isInterState ? igstAmount : cgstAmount + sgstAmount;
  const rawTotal = taxable + taxAmount;
  const total = roundRupees(rawTotal);
  const rounding = total - rawTotal;

  return {
    subtotal: roundRupees(subtotal),
    discount: totalDiscount,
    taxable,
    taxAmount,
    cgstRate,
    sgstRate,
    igstRate,
    cgstAmount,
    sgstAmount,
    igstAmount,
    rounding,
    total,
  };
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
