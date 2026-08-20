"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity } from "@/lib/os/activity";
import { str } from "@/lib/os/form";
import {
  createPortalToken,
  hashPortalToken,
  tokenHint,
} from "@/lib/os/portal-token";
import { PortalAccess } from "@/models/os/PortalAccess";
import { Vendor } from "@/models/os/Vendor";
import { OsTask } from "@/models/os/Task";
import type { ActionState } from "@/actions/auth";
import {
  clientPortalPath,
  resolvePortalByUuid,
} from "@/lib/os/resolve-portal";

export async function generateClientPortal(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState & { url?: string; token?: string }> {
  const gate = await requireStaff("vendors:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const conversionUuid = str(formData, "conversionUuid");
  const vendor = await Vendor.findOne({ conversionUuid });
  if (!vendor) return { error: "Vendor not found" };

  const existing = await PortalAccess.findOne({ conversionUuid });
  // Keep a stable URL forever — reactivation reuses the same conversion UUID path.
  if (existing?.isActive) {
    return {
      success: "Portal already active — link is unchanged.",
      token: existing.token || conversionUuid,
      url: clientPortalPath(conversionUuid),
    };
  }

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
      createdBy: gate.staff.email,
    },
    { upsert: true }
  );

  await logActivity({
    title: existing ? "Client portal re-enabled" : "Client portal generated",
    detail: clientPortalPath(conversionUuid),
    createdBy: gate.staff.email,
    conversionUuid,
    vendorId: vendor._id.toString(),
    entityType: "portal",
  });

  revalidatePath("/admin/os", "layout");
  return {
    success: "Portal link ready — it stays the same for this client.",
    token,
    url: clientPortalPath(conversionUuid),
  };
}

export async function revokeClientPortal(formData: FormData): Promise<void> {
  const gate = await requireStaff("vendors:write");
  if (!gate.ok) return;
  await connectDB();
  const conversionUuid = str(formData, "conversionUuid");
  await PortalAccess.updateOne(
    { conversionUuid },
    { isActive: false }
  );
  await logActivity({
    title: "Client portal revoked",
    createdBy: gate.staff.email,
    conversionUuid,
    entityType: "portal",
  });
  revalidatePath("/admin/os", "layout");
}

export async function completeClientTask(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const uuid = str(formData, "uuid") || str(formData, "token");
  const taskId = str(formData, "taskId");
  if (!uuid || !taskId) return { error: "Missing task details" };

  const portal = await resolvePortalByUuid(uuid);
  if (!portal) return { error: "Invalid portal link" };

  await connectDB();
  const task = await OsTask.findOne({
    _id: taskId,
    conversionUuid: portal.conversion.conversionUuid,
    recordStatus: "active",
    visibleToClient: true,
    clientActionRequired: true,
  });
  if (!task) return { error: "Task not found" };

  task.status = "completed";
  task.clientActionRequired = false;
  task.updatedBy = `client:${portal.vendor.companyName}`;
  await task.save();

  await logActivity({
    title: "Client task completed",
    detail: task.title,
    createdBy: `client:${portal.vendor.companyName}`,
    conversionUuid: portal.conversion.conversionUuid,
    projectId: task.projectId ? String(task.projectId) : undefined,
    entityType: "task",
    entityId: String(task._id),
  });

  const base = clientPortalPath(portal.conversion.conversionUuid);
  revalidatePath(`${base}/projects`);
  if (task.projectId) {
    revalidatePath(`${base}/projects/${task.projectId}`);
    revalidatePath(`/admin/os/projects/${task.projectId}`);
  }

  return { success: "Task marked complete" };
}
