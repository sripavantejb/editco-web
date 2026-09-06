"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity, notifyStaff, writeAudit } from "@/lib/os/activity";
import { num, optDate, str } from "@/lib/os/form";
import { displayInvoiceStatus } from "@/lib/os/money";
import { Invoice } from "@/models/os/Invoice";
import { Payment } from "@/models/os/Payment";
import type { ActionState } from "@/actions/auth";

export async function recordPayment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("payments:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const invoice = await Invoice.findById(str(formData, "invoiceId"));
  if (!invoice || invoice.recordStatus !== "active") {
    return { error: "Invoice not found" };
  }
  if (invoice.status === "draft" || invoice.status === "cancelled") {
    return { error: "Cannot pay a draft or cancelled invoice" };
  }
  const amount = num(formData, "amount");
  if (amount <= 0) return { error: "Amount must be greater than 0" };

  const payment = await Payment.create({
    conversionUuid: invoice.conversionUuid,
    invoiceId: invoice._id,
    projectId: invoice.projectId,
    vendorId: invoice.vendorId,
    amount,
    paidAt: optDate(formData, "paidAt") || new Date(),
    method: str(formData, "method") || "bank",
    reference: str(formData, "reference"),
    notes: str(formData, "notes"),
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  const prevPaid = invoice.amountPaid;
  invoice.amountPaid = (invoice.amountPaid || 0) + amount;
  invoice.paymentDate = payment.paidAt;
  invoice.paymentReference = payment.reference;
  invoice.status = displayInvoiceStatus({
    status: "issued",
    dueDate: invoice.dueDate,
    amountPaid: invoice.amountPaid,
    total: invoice.total,
  });
  invoice.updatedBy = gate.staff.email;
  await invoice.save();

  await writeAudit({
    entityType: "invoice",
    entityId: invoice._id.toString(),
    conversionUuid: invoice.conversionUuid,
    field: "amountPaid",
    oldValue: String(prevPaid),
    newValue: String(invoice.amountPaid),
    reason: str(formData, "notes") || "Payment recorded",
    createdBy: gate.staff.email,
  });

  await logActivity({
    title: "Payment recorded",
    detail: `₹${amount} on ${invoice.invoiceNumber}`,
    createdBy: gate.staff.email,
    conversionUuid: invoice.conversionUuid,
    projectId: invoice.projectId?.toString(),
    entityType: "payment",
    entityId: payment._id.toString(),
  });

  await notifyStaff({
    type: "invoice",
    title: "Payment received",
    body: `₹${amount} against ${invoice.invoiceNumber}`,
    href: `/admin/os/invoices/${invoice._id}`,
    conversionUuid: invoice.conversionUuid,
    recipientRole: "finance",
  });

  revalidatePath("/admin/os", "layout");
  return { success: "Payment recorded" };
}

export async function archivePayment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("payments:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const payment = await Payment.findById(str(formData, "id"));
  if (!payment || payment.recordStatus !== "active") {
    return { error: "Payment not found" };
  }

  const invoice = await Invoice.findById(payment.invoiceId);
  if (invoice && invoice.recordStatus === "active") {
    const prevPaid = invoice.amountPaid || 0;
    invoice.amountPaid = Math.max(0, prevPaid - (payment.amount || 0));
    invoice.status = displayInvoiceStatus({
      status: invoice.status === "draft" ? "draft" : "issued",
      dueDate: invoice.dueDate,
      amountPaid: invoice.amountPaid,
      total: invoice.total,
    });
    invoice.updatedBy = gate.staff.email;
    await invoice.save();
    await writeAudit({
      entityType: "invoice",
      entityId: invoice._id.toString(),
      conversionUuid: invoice.conversionUuid,
      field: "amountPaid",
      oldValue: String(prevPaid),
      newValue: String(invoice.amountPaid),
      reason: "Payment deleted",
      createdBy: gate.staff.email,
    });
  }

  payment.recordStatus = "archived";
  payment.updatedBy = gate.staff.email;
  await payment.save();

  await logActivity({
    title: "Payment deleted",
    detail: `₹${payment.amount}`,
    createdBy: gate.staff.email,
    conversionUuid: payment.conversionUuid,
    projectId: payment.projectId?.toString(),
    entityType: "payment",
    entityId: payment._id.toString(),
  });

  revalidatePath("/admin/os", "layout");
  revalidatePath("/admin/os/payments");
  return { success: "Payment deleted" };
}
