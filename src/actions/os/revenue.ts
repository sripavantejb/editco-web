"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { ManualRevenue } from "@/models/os/ManualRevenue";
import { requireStaff } from "@/lib/os/guard";
import { str } from "@/lib/os/form";
import type { ActionState } from "@/actions/auth";

const createSchema = z.object({
  source: z.string().min(1, "Source is required"),
  description: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  receivedAt: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

export async function createManualRevenue(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("finance:read");
  if (!gate.ok) return { error: gate.error };

  const parsed = createSchema.safeParse({
    source: formData.get("source"),
    description: formData.get("description") || undefined,
    amount: formData.get("amount"),
    receivedAt: formData.get("receivedAt"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  await ManualRevenue.create({
    source: parsed.data.source,
    description: parsed.data.description || "",
    amount: parsed.data.amount,
    receivedAt: new Date(parsed.data.receivedAt),
    notes: parsed.data.notes || "",
    createdBy: gate.staff.email,
  });

  revalidatePath("/admin/os/revenue");
  return { success: "Revenue entry added." };
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
  await entry.save();

  revalidatePath("/admin/os/revenue");
  revalidatePath("/admin/os", "layout");
  return { success: "Revenue entry deleted" };
}
