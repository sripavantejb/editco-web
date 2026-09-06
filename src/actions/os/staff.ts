"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { str } from "@/lib/os/form";
import { STAFF_ROLES, type StaffRole } from "@/lib/os/constants";
import { hashPassword } from "@/lib/os/password";
import { logActivity } from "@/lib/os/activity";
import { StaffUser } from "@/models/os/StaffUser";
import { ServiceCatalog } from "@/models/os/ServiceCatalog";
import type { ActionState } from "@/actions/auth";

export async function createStaffUser(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const email = str(formData, "email").toLowerCase();
  const name = str(formData, "name");
  const password = str(formData, "password");
  const role = str(formData, "role") as StaffRole;
  if (!email.includes("@")) return { error: "Valid email required" };
  if (password.length < 8) return { error: "Password must be at least 8 characters" };
  if (!STAFF_ROLES.includes(role)) return { error: "Invalid role" };
  if (role === "super_admin" && gate.staff.role !== "super_admin") {
    return { error: "Cannot assign super admin" };
  }

  const exists = await StaffUser.findOne({ email });
  if (exists) return { error: "A user with that email already exists" };

  const user = await StaffUser.create({
    email,
    name: name || email.split("@")[0],
    role,
    passwordHash: hashPassword(password),
    isActive: true,
  });

  await logActivity({
    title: "User added",
    detail: `${user.name} (${user.email}) as ${role}`,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    actorName: gate.staff.name,
    actionType: "USER_ADDED",
    entityType: "staff",
    entityId: user._id.toString(),
    metadata: { role, email: user.email },
  });

  revalidatePath("/admin/os/settings/users");
  return { success: "User created" };
}

export async function updateStaffUser(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const user = await StaffUser.findById(str(formData, "id"));
  if (!user) return { error: "User not found" };
  const role = str(formData, "role") as StaffRole;
  if (!STAFF_ROLES.includes(role)) return { error: "Invalid role" };
  if (role === "super_admin" && gate.staff.role !== "super_admin") {
    return { error: "Cannot assign super admin" };
  }

  const prevRole = user.role;
  user.name = str(formData, "name") || user.name;
  user.role = role;
  user.isActive = str(formData, "isActive") !== "false";
  const password = str(formData, "password");
  if (password) {
    if (password.length < 8) return { error: "Password must be at least 8 characters" };
    user.passwordHash = hashPassword(password);
  }
  await user.save();

  if (prevRole !== role) {
    await logActivity({
      title: "User role changed",
      detail: `${user.name}: ${prevRole} → ${role}`,
      createdBy: gate.staff.email,
      actorUserId: gate.staff.userId,
      actorName: gate.staff.name,
      actionType: "USER_ROLE_CHANGED",
      entityType: "staff",
      entityId: user._id.toString(),
      metadata: { prevRole, role },
    });
  }

  revalidatePath("/admin/os/settings/users");
  return { success: "User updated" };
}

/** Revoke login: clear credentials + deactivate (history kept). Also disables Sales CRM profile. */
export async function deleteStaffUser(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const id = str(formData, "id");
  const user = await StaffUser.findById(id);
  if (!user) return { error: "User not found" };
  if (user.email === gate.staff.email) {
    return { error: "You cannot delete your own account" };
  }
  if (user.role === "super_admin") {
    return { error: "Super admin accounts cannot be deleted here" };
  }

  user.isActive = false;
  user.passwordHash = "";
  await user.save();

  // Block Sales Admin / Employee portal access for this login too.
  const { SalesEmployee } = await import("@/models/sales/SalesEmployee");
  await SalesEmployee.updateMany(
    { staffUserId: user._id },
    { $set: { status: "inactive", updatedBy: gate.staff.email } }
  );

  await logActivity({
    title: "User credentials deleted",
    detail: `${user.name} (${user.email}) — login revoked`,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    actorName: gate.staff.name,
    actionType: "USER_CREDENTIALS_DELETED",
    entityType: "staff",
    entityId: user._id.toString(),
    metadata: { email: user.email, role: user.role },
  });

  revalidatePath("/admin/os/settings/users");
  revalidatePath("/sales/admin/team");
  return { success: "Login credentials removed — they can no longer sign in" };
}

export async function createService(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const name = str(formData, "name");
  const slug = str(formData, "slug")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  if (!name || !slug) return { error: "Name is required" };
  await ServiceCatalog.updateOne(
    { slug },
    { name, slug, isActive: true },
    { upsert: true }
  );
  revalidatePath("/admin/os/settings/services");
  return { success: "Service saved" };
}
