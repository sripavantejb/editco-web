"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { SalesPermissionOverride } from "@/models/sales/SalesPermissionOverride";
import { requireSalesAdminAction } from "@/lib/sales/guard";
import { logSalesActivity, writeSalesAudit } from "@/lib/sales/activity";
import { defaultModuleMapForRole, SALES_MODULE_KEYS, type SalesModuleKey } from "@/lib/sales/modules";
import type { ActionState } from "@/actions/auth";

const saveSchema = z.object({
  employeeId: z.string().min(1),
  // JSON-stringified Record<SalesModuleKey, boolean> — the full desired state, computed client-side.
  desiredState: z.string().min(1),
});

export async function saveSalesPermissions(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAdminAction();
  if (!gate.ok) return { error: gate.error };

  const parsed = saveSchema.safeParse({
    employeeId: formData.get("employeeId"),
    desiredState: formData.get("desiredState"),
  });
  if (!parsed.success) return { error: "Invalid submission" };

  let desired: Record<string, unknown>;
  try {
    desired = JSON.parse(parsed.data.desiredState);
  } catch {
    return { error: "Invalid submission" };
  }

  await connectDB();
  const employee = await SalesEmployee.findById(parsed.data.employeeId);
  if (!employee) return { error: "Employee not found" };
  if (employee.isSalesAdmin) {
    return { error: "Sales admins always have full access — nothing to configure" };
  }

  const roleDefaults = defaultModuleMapForRole(false);
  const overrides: Record<string, boolean> = {};
  let changedCount = 0;
  for (const key of SALES_MODULE_KEYS) {
    const desiredValue = Boolean(desired[key]);
    if (desiredValue !== roleDefaults[key]) {
      overrides[key] = desiredValue;
      changedCount += 1;
    }
  }

  await SalesPermissionOverride.findOneAndUpdate(
    { salesEmployeeId: employee._id },
    { overrides, updatedBy: gate.employee.email },
    { upsert: true }
  );

  await writeSalesAudit({
    action: "permission_changed",
    entityType: "SalesEmployee",
    entityId: employee._id.toString(),
    field: "modules",
    newValue: `${changedCount} module(s) overridden from role default`,
    actorEmail: gate.employee.email,
  });
  await logSalesActivity({
    type: "permission_changed",
    title: `Permissions updated for employee`,
    detail: `${changedCount} module(s) overridden`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    metadata: { employeeId: employee._id.toString() },
  });

  revalidatePath(`/sales/admin/team/${parsed.data.employeeId}/access`);
  return { success: "Permissions saved." };
}

export type EffectiveModuleState = {
  key: SalesModuleKey;
  value: boolean;
  isOverridden: boolean;
};
