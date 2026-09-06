"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity, notifyStaff, writeAudit } from "@/lib/os/activity";
import { nextInvoiceNumber, num, optDate, str } from "@/lib/os/form";
import { displayInvoiceStatus, invoiceTotals } from "@/lib/os/money";
import { Conversion } from "@/models/os/Conversion";
import { Invoice } from "@/models/os/Invoice";
import { Payment } from "@/models/os/Payment";
import { Project } from "@/models/os/Project";
import { Vendor } from "@/models/os/Vendor";
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

/**
 * Record money received from a client (no invoice UI needed).
 * Creates a receipt invoice + payment so Received and Revenue Overview both update.
 */
export async function recordClientPayment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  let gate = await requireStaff("payments:write");
  if (!gate.ok) {
    // Client editors can log money without a separate finance permission.
    gate = await requireStaff("vendors:write");
  }
  if (!gate.ok) return { error: gate.error };

  await connectDB();
  const vendor = await Vendor.findById(str(formData, "vendorId"));
  if (!vendor || vendor.recordStatus !== "active") {
    return { error: "Client not found" };
  }

  const amount = num(formData, "amount");
  if (amount <= 0) return { error: "Amount must be greater than 0" };

  const paidAt = optDate(formData, "paidAt") || new Date();
  const method = str(formData, "method") || "bank";
  const reference = str(formData, "reference");
  const notes = str(formData, "notes") || "Client payment";
  const email = gate.staff.email;

  let project = await Project.findOne({
    conversionUuid: vendor.conversionUuid,
    recordStatus: "active",
  }).sort({ createdAt: 1 });

  if (!project) {
    project = await Project.create({
      conversionUuid: vendor.conversionUuid,
      conversionId: vendor.conversionId,
      vendorId: vendor._id,
      name: `${vendor.companyName} · Retainer`,
      service: "",
      description: "Auto-created for client payments",
      budget: amount,
      status: "active",
      createdBy: email,
      updatedBy: email,
    });
  }

  const totals = invoiceTotals({
    lineItems: [{ quantity: 1, unitPrice: amount }],
    taxRate: 0,
    discount: 0,
  });
  const invoice = await Invoice.create({
    conversionUuid: vendor.conversionUuid,
    invoiceUuid: randomUUID(),
    invoiceNumber: await nextInvoiceNumber(),
    projectId: project._id,
    vendorId: vendor._id,
    issueDate: paidAt,
    dueDate: paidAt,
    lineItems: [
      {
        description: notes || "Payment received",
        quantity: 1,
        unitPrice: amount,
      },
    ],
    taxRate: 0,
    ...totals,
    amountPaid: 0,
    status: "issued",
    billToName: vendor.companyName,
    billToEmail: vendor.email || "",
    billToPhone: vendor.phone || "",
    billToAddress: vendor.address || "",
    billToGst: vendor.gstNumber || "",
    documentNote: "Logged from client page",
    createdBy: email,
    updatedBy: email,
  });

  const payment = await Payment.create({
    conversionUuid: vendor.conversionUuid,
    invoiceId: invoice._id,
    projectId: project._id,
    vendorId: vendor._id,
    amount,
    paidAt,
    method,
    reference,
    notes,
    createdBy: email,
    updatedBy: email,
  });

  invoice.amountPaid = amount;
  invoice.paymentDate = paidAt;
  invoice.paymentReference = reference || "";
  invoice.status = displayInvoiceStatus({
    status: "issued",
    dueDate: invoice.dueDate,
    amountPaid: invoice.amountPaid,
    total: invoice.total,
  });
  invoice.updatedBy = email;
  await invoice.save();

  // Keep deal value / total business at least as high as money received.
  const conversion = await Conversion.findOne({
    conversionUuid: vendor.conversionUuid,
  });
  if (conversion) {
    const paidRows = await Invoice.find({
      conversionUuid: vendor.conversionUuid,
      recordStatus: "active",
      status: { $ne: "cancelled" },
    })
      .select("amountPaid")
      .lean();
    const totalReceived = paidRows.reduce((s, i) => s + (i.amountPaid || 0), 0);
    if (totalReceived > (conversion.conversionValue || 0)) {
      conversion.conversionValue = totalReceived;
      conversion.updatedBy = email;
      await conversion.save();
    }
    if (totalReceived > (project.budget || 0)) {
      project.budget = totalReceived;
      project.updatedBy = email;
      await project.save();
    }
  }

  await writeAudit({
    entityType: "invoice",
    entityId: invoice._id.toString(),
    conversionUuid: vendor.conversionUuid,
    field: "amountPaid",
    oldValue: "0",
    newValue: String(amount),
    reason: notes,
    createdBy: email,
  });

  await logActivity({
    title: "Client payment recorded",
    detail: `₹${amount} · ${vendor.companyName}`,
    createdBy: email,
    conversionUuid: vendor.conversionUuid,
    vendorId: vendor._id.toString(),
    projectId: project._id.toString(),
    entityType: "payment",
    entityId: payment._id.toString(),
  });

  await notifyStaff({
    type: "invoice",
    title: "Payment received",
    body: `₹${amount} from ${vendor.companyName}`,
    href: `/admin/os/vendors/${vendor._id}`,
    conversionUuid: vendor.conversionUuid,
    recipientRole: "finance",
  });

  revalidatePath("/admin/os", "layout");
  revalidatePath(`/admin/os/vendors/${vendor._id}`);
  revalidatePath("/admin/os/revenue");
  revalidatePath("/admin/os/payments");
  return { success: `₹${amount} added — Received & Revenue updated` };
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
