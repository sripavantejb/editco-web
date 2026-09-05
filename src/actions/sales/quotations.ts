"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SalesQuotation } from "@/models/sales/SalesQuotation";
import { requireSalesAction } from "@/lib/sales/guard";
import { logSalesActivity } from "@/lib/sales/activity";
import { SALES_QUOTATION_STATUSES } from "@/lib/sales/constants";
import type { ActionState } from "@/actions/auth";

const createSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  dealId: z.string().optional(),
  itemName: z.string().min(1, "At least one item is required"),
  itemQuantity: z.string().optional(),
  itemPrice: z.string().optional(),
  discountPercent: z.string().optional(),
  taxPercent: z.string().optional(),
  validUntil: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

export async function createSalesQuotation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("docs.quotations");
  if (!gate.ok) return { error: gate.error };

  const parsed = createSchema.safeParse({
    customerName: formData.get("customerName"),
    dealId: formData.get("dealId") || undefined,
    itemName: formData.get("itemName"),
    itemQuantity: formData.get("itemQuantity") || undefined,
    itemPrice: formData.get("itemPrice") || undefined,
    discountPercent: formData.get("discountPercent") || undefined,
    taxPercent: formData.get("taxPercent") || undefined,
    validUntil: formData.get("validUntil") || undefined,
    terms: formData.get("terms") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  const count = await SalesQuotation.countDocuments({});
  const quotationNumber = `QT-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const quotation = await SalesQuotation.create({
    quotationNumber,
    customerName: parsed.data.customerName,
    dealId: parsed.data.dealId || undefined,
    ownerEmployeeId: gate.employee.employeeId,
    items: [
      {
        name: parsed.data.itemName,
        quantity: Number(parsed.data.itemQuantity || 1),
        price: Number(parsed.data.itemPrice || 0),
      },
    ],
    discountPercent: Number(parsed.data.discountPercent || 0),
    taxPercent: Number(parsed.data.taxPercent ?? 18),
    validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : undefined,
    terms: parsed.data.terms || "",
    notes: parsed.data.notes || "",
    status: "draft",
    createdBy: gate.employee.email,
    updatedBy: gate.employee.email,
  });

  await logSalesActivity({
    type: "quotation_created",
    title: `Quotation ${quotationNumber} created for ${parsed.data.customerName}`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    dealId: parsed.data.dealId,
  });

  revalidatePath("/sales/employee/quotations");
  redirect(`/sales/employee/quotations/${quotation._id.toString()}`);
}

const statusSchema = z.object({
  quotationId: z.string().min(1),
  status: z.enum(SALES_QUOTATION_STATUSES),
});

export async function updateSalesQuotationStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("docs.quotations");
  if (!gate.ok) return { error: gate.error };

  const parsed = statusSchema.safeParse({
    quotationId: formData.get("quotationId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Invalid input" };

  await connectDB();
  const quotation = await SalesQuotation.findById(parsed.data.quotationId);
  if (!quotation) return { error: "Quotation not found" };

  quotation.status = parsed.data.status;
  quotation.updatedBy = gate.employee.email;
  await quotation.save();

  await logSalesActivity({
    type: "quotation_created",
    title: `Quotation ${quotation.quotationNumber} marked ${parsed.data.status}`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
  });

  revalidatePath("/sales/employee/quotations");
  revalidatePath(`/sales/employee/quotations/${parsed.data.quotationId}`);
  return { success: "Quotation updated." };
}

export async function duplicateSalesQuotation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("docs.quotations");
  if (!gate.ok) return { error: gate.error };

  const quotationId = String(formData.get("quotationId") || "");
  await connectDB();
  const original = await SalesQuotation.findById(quotationId).lean();
  if (!original) return { error: "Quotation not found" };

  const count = await SalesQuotation.countDocuments({});
  const quotationNumber = `QT-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const copy = await SalesQuotation.create({
    ...original,
    _id: undefined,
    quotationNumber,
    status: "draft",
    version: (original.version || 1) + 1,
    previousVersionId: original._id,
    createdBy: gate.employee.email,
    updatedBy: gate.employee.email,
  });

  revalidatePath("/sales/employee/quotations");
  redirect(`/sales/employee/quotations/${copy._id.toString()}`);
}
