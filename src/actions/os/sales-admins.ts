"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/os/guard";
import { createSalesEmployeeCore } from "@/actions/sales/employees";
import type { ActionState } from "@/actions/auth";

/**
 * Super Admin only (Editco OS). Creates the credentials for a Sales Admin —
 * the person who will then run the Sales CRM's own team, at /sales/admin,
 * creating Sales Employees under them. Sales Admins themselves cannot create
 * other Sales Admins (see createSalesEmployee in actions/sales/employees.ts).
 */
export async function createSalesAdminAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };

  const result = await createSalesEmployeeCore(formData, gate.staff.email, gate.staff.name, true, "SA");
  if (!result.error) revalidatePath("/admin/os/settings/sales-admins");
  return result;
}
