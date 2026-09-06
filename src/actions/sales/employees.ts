"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { StaffUser } from "@/models/os/StaffUser";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { hashPassword } from "@/lib/os/password";
import { requireSalesAdminAction } from "@/lib/sales/guard";
import { logSalesActivity, writeSalesAudit } from "@/lib/sales/activity";
import { SALES_EMPLOYEE_STATUSES } from "@/lib/sales/constants";
import type { ActionState } from "@/actions/auth";

const createSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  department: z.string().optional(),
  team: z.string().optional(),
  territory: z.string().optional(),
  phone: z.string().optional(),
});

export async function createSalesEmployeeCore(
  formData: FormData,
  actorEmail: string,
  actorLabel: string,
  isSalesAdmin: boolean,
  codePrefix: "SA" | "SE"
): Promise<ActionState> {
  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") || "",
    department: formData.get("department") || undefined,
    team: formData.get("team") || undefined,
    territory: formData.get("territory") || undefined,
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  const email = parsed.data.email.toLowerCase().trim();

  let staff = await StaffUser.findOne({ email });
  if (!staff) {
    staff = await StaffUser.create({
      email,
      name: parsed.data.name.trim(),
      role: "sales",
      isActive: true,
      passwordHash: hashPassword(parsed.data.password || "sales@123"),
    });
  }

  const existing = await SalesEmployee.findOne({ staffUserId: staff._id });
  if (existing) return { error: "This person is already in the Sales CRM" };

  const count = await SalesEmployee.countDocuments({ isSalesAdmin });
  const employee = await SalesEmployee.create({
    staffUserId: staff._id,
    employeeCode: `${codePrefix}-${String(count + 1).padStart(4, "0")}`,
    isSalesAdmin,
    department: parsed.data.department?.trim() || "Sales",
    team: parsed.data.team?.trim() || "",
    territory: parsed.data.territory?.trim() || "",
    phone: parsed.data.phone?.trim() || "",
    status: "active",
    createdBy: actorEmail,
    updatedBy: actorEmail,
  });

  await logSalesActivity({
    type: "employee_created",
    title: `${parsed.data.name} added to the Sales CRM${isSalesAdmin ? " as Sales Admin" : ""} by ${actorLabel}`,
    actorName: actorLabel,
    metadata: { employeeId: employee._id.toString() },
  });
  await writeSalesAudit({
    action: "employee_created",
    entityType: "SalesEmployee",
    entityId: employee._id.toString(),
    newValue: email,
    actorEmail,
  });

  return { success: `${parsed.data.name} added.` };
}

/** Sales Admin creates a Sales Employee only — never another Sales Admin. */
export async function createSalesEmployee(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAdminAction();
  if (!gate.ok) return { error: gate.error };

  const result = await createSalesEmployeeCore(formData, gate.employee.email, gate.employee.name, false, "SE");
  if (!result.error) revalidatePath("/sales/admin/team");
  return result;
}

const statusSchema = z.object({
  employeeId: z.string().min(1),
  status: z.enum(SALES_EMPLOYEE_STATUSES),
});

export async function updateSalesEmployeeStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAdminAction();
  if (!gate.ok) return { error: gate.error };

  const parsed = statusSchema.safeParse({
    employeeId: formData.get("employeeId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  const employee = await SalesEmployee.findById(parsed.data.employeeId);
  if (!employee) return { error: "Employee not found" };

  const oldStatus = employee.status;
  employee.status = parsed.data.status;
  employee.updatedBy = gate.employee.email;
  await employee.save();

  await writeSalesAudit({
    action: "employee_status_changed",
    entityType: "SalesEmployee",
    entityId: employee._id.toString(),
    field: "status",
    oldValue: oldStatus,
    newValue: parsed.data.status,
    actorEmail: gate.employee.email,
  });

  revalidatePath("/sales/admin/team");
  revalidatePath(`/sales/admin/team/${parsed.data.employeeId}`);
  return { success: "Status updated." };
}

export async function deleteSalesEmployee(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAdminAction();
  if (!gate.ok) return { error: gate.error };

  const employeeId = String(formData.get("employeeId") || formData.get("id") || "");
  if (!employeeId) return { error: "Invalid employee" };

  await connectDB();
  const employee = await SalesEmployee.findById(employeeId);
  if (!employee) return { error: "Employee not found" };
  if (String(employee._id) === gate.employee.employeeId) {
    return { error: "You can't delete your own account" };
  }

  await StaffUser.updateOne({ _id: employee.staffUserId }, { $set: { isActive: false } });
  await SalesEmployee.deleteOne({ _id: employee._id });

  await writeSalesAudit({
    action: "employee_deleted",
    entityType: "SalesEmployee",
    entityId: employeeId,
    oldValue: employee.employeeCode,
    actorEmail: gate.employee.email,
  });

  revalidatePath("/sales/admin/team");
  return { success: "Employee removed." };
}
