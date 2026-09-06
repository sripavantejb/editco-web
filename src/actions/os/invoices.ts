"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity, writeAudit } from "@/lib/os/activity";
import { nextInvoiceNumber, num, optDate, str } from "@/lib/os/form";
import { DEFAULT_TAX_RATE, type InvoiceStatus } from "@/lib/os/constants";
import { invoiceTotals, displayInvoiceStatus } from "@/lib/os/money";
import { Invoice } from "@/models/os/Invoice";
import { Project } from "@/models/os/Project";
import { Vendor } from "@/models/os/Vendor";
import { PortalAccess } from "@/models/os/PortalAccess";
import {
  createPortalToken,
  hashPortalToken,
  tokenHint,
} from "@/lib/os/portal-token";
import { sendInvoicePortalEmail } from "@/lib/email";
import { clientPortalPath } from "@/lib/os/resolve-portal";
import type { ActionState } from "@/actions/auth";

function parseLineItems(formData: FormData) {
  const descriptions = formData.getAll("itemDescription").map(String);
  const quantities = formData.getAll("itemQty").map(String);
  const prices = formData.getAll("itemPrice").map(String);
  return descriptions
    .map((description, i) => ({
      description: description.trim(),
      quantity: Number(quantities[i] || 1) || 1,
      unitPrice: Number(prices[i] || 0) || 0,
    }))
    .filter((item) => item.description);
}

function parseBillTo(formData: FormData) {
  return {
    billToName: str(formData, "billToName"),
    billToAddress: str(formData, "billToAddress"),
    billToEmail: str(formData, "billToEmail"),
    billToPhone: str(formData, "billToPhone"),
    billToGst: str(formData, "billToGst"),
  };
}

async function ensurePortalActive(
  conversionUuid: string,
  createdBy: string
): Promise<void> {
  const existing = await PortalAccess.findOne({ conversionUuid });
  if (existing?.isActive) return;

  const token =
    existing?.token && existing.token.length > 0
      ? existing.token
      : createPortalToken();

  await PortalAccess.findOneAndUpdate(
    { conversionUuid },
    {
      conversionUuid,
      token,
      tokenHash: hashPortalToken(token),
      tokenHint: tokenHint(token),
      isActive: true,
      createdBy,
    },
    { upsert: true }
  );
}

export async function createInvoice(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("invoices:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const project = await Project.findById(str(formData, "projectId"));
  if (!project) return { error: "Project not found" };
  const lineItems = parseLineItems(formData);
  if (lineItems.length === 0) return { error: "Add at least one line item" };
  const taxRate = num(formData, "taxRate") || DEFAULT_TAX_RATE;
  const discount = num(formData, "discount");
  const totals = invoiceTotals({ lineItems, taxRate, discount });
  const status = (str(formData, "status") || "draft") as InvoiceStatus;
  const billTo = parseBillTo(formData);

  const invoice = await Invoice.create({
    conversionUuid: project.conversionUuid,
    invoiceUuid: randomUUID(),
    invoiceNumber: await nextInvoiceNumber(),
    projectId: project._id,
    vendorId: project.vendorId,
    issueDate: optDate(formData, "issueDate") || new Date(),
    dueDate: optDate(formData, "dueDate"),
    lineItems,
    taxRate,
    ...totals,
    status: status === "issued" ? "issued" : "draft",
    documentNote: str(formData, "documentNote"),
    ...billTo,
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  await logActivity({
    title: "Invoice generated",
    detail: `${invoice.invoiceNumber} · ₹${totals.total}`,
    createdBy: gate.staff.email,
    conversionUuid: project.conversionUuid,
    projectId: project._id.toString(),
    entityType: "invoice",
    entityId: invoice._id.toString(),
  });

  revalidatePath("/admin/os", "layout");
  redirect(`/admin/os/invoices/${invoice._id}`);
}

export async function updateInvoice(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("invoices:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const invoice = await Invoice.findById(str(formData, "id"));
  if (!invoice) return { error: "Invoice not found" };
  if (invoice.status === "cancelled") return { error: "Invoice is cancelled" };

  const lineItems = parseLineItems(formData);
  if (lineItems.length === 0) return { error: "Add at least one line item" };
  const taxRate = num(formData, "taxRate") || invoice.taxRate;
  const discount = num(formData, "discount");
  const totals = invoiceTotals({ lineItems, taxRate, discount });
  const reason = str(formData, "reason");
  const billTo = parseBillTo(formData);

  if (invoice.total !== totals.total) {
    if (!reason) {
      return { error: "A reason is required when changing invoice amount" };
    }
    await writeAudit({
      entityType: "invoice",
      entityId: invoice._id.toString(),
      conversionUuid: invoice.conversionUuid,
      field: "total",
      oldValue: String(invoice.total),
      newValue: String(totals.total),
      reason,
      createdBy: gate.staff.email,
    });
  }

  invoice.lineItems = lineItems;
  invoice.taxRate = taxRate;
  invoice.discount = discount;
  invoice.subtotal = totals.subtotal;
  invoice.taxAmount = totals.taxAmount;
  invoice.total = totals.total;
  invoice.dueDate = optDate(formData, "dueDate") || invoice.dueDate;
  invoice.issueDate = optDate(formData, "issueDate") || invoice.issueDate;
  invoice.documentNote = str(formData, "documentNote");
  invoice.billToName = billTo.billToName;
  invoice.billToAddress = billTo.billToAddress;
  invoice.billToEmail = billTo.billToEmail;
  invoice.billToPhone = billTo.billToPhone;
  invoice.billToGst = billTo.billToGst;
  const nextStatus = str(formData, "status") as InvoiceStatus;
  if (nextStatus === "issued" || nextStatus === "draft" || nextStatus === "cancelled") {
    invoice.status = nextStatus;
  } else {
    invoice.status = displayInvoiceStatus({
      status: invoice.status === "draft" ? "issued" : invoice.status,
      dueDate: invoice.dueDate,
      amountPaid: invoice.amountPaid,
      total: invoice.total,
    });
  }
  invoice.updatedBy = gate.staff.email;
  await invoice.save();

  revalidatePath("/admin/os", "layout");
  return { success: "Invoice saved" };
}

export async function shareInvoiceByEmail(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("invoices:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const invoice = await Invoice.findById(str(formData, "id"));
  if (!invoice || invoice.recordStatus !== "active") {
    return { error: "Invoice not found" };
  }
  if (invoice.status === "cancelled") {
    return { error: "Cannot share a cancelled invoice" };
  }

  const vendor = await Vendor.findById(invoice.vendorId).lean();
  const to =
    str(formData, "email") ||
    invoice.billToEmail ||
    vendor?.email ||
    "";
  if (!to) return { error: "No client email on file" };

  if (invoice.status === "draft") {
    invoice.status = "issued";
    invoice.updatedBy = gate.staff.email;
    await invoice.save();
  }

  await ensurePortalActive(invoice.conversionUuid, gate.staff.email);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const portalUrl = `${appUrl}${clientPortalPath(
    invoice.conversionUuid,
    `/invoices/${invoice._id}`
  )}`;

  const result = await sendInvoicePortalEmail({
    to,
    clientName: invoice.billToName || vendor?.companyName || "there",
    invoiceNumber: invoice.invoiceNumber,
    total: invoice.total,
    portalUrl,
  });
  if (!result.ok) return { error: "Failed to send email" };

  await logActivity({
    title: "Invoice shared by email",
    detail: `${invoice.invoiceNumber} → ${to}`,
    createdBy: gate.staff.email,
    conversionUuid: invoice.conversionUuid,
    projectId: invoice.projectId?.toString(),
    entityType: "invoice",
    entityId: invoice._id.toString(),
  });

  revalidatePath("/admin/os", "layout");
  revalidatePath(clientPortalPath(invoice.conversionUuid, "/invoices"));
  return { success: `Invoice link sent to ${to}` };
}

export async function archiveInvoice(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("invoices:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const invoice = await Invoice.findById(str(formData, "id"));
  if (!invoice || invoice.recordStatus !== "active") {
    return { error: "Invoice not found" };
  }
  invoice.recordStatus = "archived";
  invoice.updatedBy = gate.staff.email;
  await invoice.save();
  await logActivity({
    title: "Invoice deleted",
    detail: invoice.invoiceNumber,
    createdBy: gate.staff.email,
    conversionUuid: invoice.conversionUuid,
    projectId: invoice.projectId?.toString(),
    entityType: "invoice",
    entityId: invoice._id.toString(),
  });
  revalidatePath("/admin/os", "layout");
  revalidatePath("/admin/os/invoices");
  return { success: "Invoice deleted" };
}
