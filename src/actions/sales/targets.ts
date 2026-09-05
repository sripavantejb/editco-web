"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SalesTarget } from "@/models/sales/SalesTarget";
import { requireSalesAdminAction } from "@/lib/sales/guard";
import type { ActionState } from "@/actions/auth";

const schema = z.object({
  employeeId: z.string().min(1, "Choose an employee"),
  period: z.enum(["daily", "weekly", "monthly", "quarterly"]),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
  targetValue: z.string().min(1),
});

export async function createSalesTarget(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAdminAction();
  if (!gate.ok) return { error: gate.error };

  const parsed = schema.safeParse({
    employeeId: formData.get("employeeId"),
    period: formData.get("period"),
    periodStart: formData.get("periodStart"),
    periodEnd: formData.get("periodEnd"),
    targetValue: formData.get("targetValue"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  await SalesTarget.create({
    employeeId: parsed.data.employeeId,
    period: parsed.data.period,
    periodStart: new Date(parsed.data.periodStart),
    periodEnd: new Date(parsed.data.periodEnd),
    targetValue: Number(parsed.data.targetValue),
    createdBy: gate.employee.email,
  });

  revalidatePath("/sales/admin/targets");
  revalidatePath("/sales/employee/targets");
  return { success: "Target set." };
}
