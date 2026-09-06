"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SalesTerritory } from "@/models/sales/SalesTerritory";
import { requireSalesAdminAction } from "@/lib/sales/guard";
import type { ActionState } from "@/actions/auth";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  type: z.enum(["city", "state", "region", "country", "custom"]).optional(),
  description: z.string().optional(),
});

export async function createSalesTerritory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAdminAction();
  if (!gate.ok) return { error: gate.error };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    type: formData.get("type") || undefined,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  const existing = await SalesTerritory.findOne({ name: parsed.data.name });
  if (existing) return { error: "A territory with this name already exists" };

  await SalesTerritory.create({
    name: parsed.data.name,
    type: parsed.data.type || "custom",
    description: parsed.data.description || "",
    createdBy: gate.employee.email,
  });

  revalidatePath("/sales/admin/territories");
  return { success: "Territory added." };
}

export async function deleteSalesTerritory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAdminAction();
  if (!gate.ok) return { error: gate.error };

  const id = String(formData.get("id") || "");
  if (!id) return { error: "Invalid territory" };

  await connectDB();
  const deleted = await SalesTerritory.findByIdAndDelete(id);
  if (!deleted) return { error: "Territory not found" };

  revalidatePath("/sales/admin/territories");
  return { success: "Territory removed." };
}
