"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSalesAction } from "@/lib/sales/guard";
import { logSalesActivity } from "@/lib/sales/activity";
import type { ActionState } from "@/actions/auth";

const schema = z.object({
  remarks: z.string().min(2, "Add a short remark"),
});

export async function submitDailyWorkStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("perf.daily_work_status");
  if (!gate.ok) return { error: gate.error };

  const parsed = schema.safeParse({ remarks: formData.get("remarks") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await logSalesActivity({
    type: "daily_work_status",
    title: "Daily work status submitted",
    detail: parsed.data.remarks,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
  });

  revalidatePath("/sales/employee/work-status");
  return { success: "Submitted." };
}
