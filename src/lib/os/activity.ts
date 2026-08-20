import { connectDB } from "@/lib/db";
import { ActivityEvent } from "@/models/os/ActivityEvent";
import { OsNotification } from "@/models/os/Notification";
import { AuditLog } from "@/models/os/AuditLog";
import { StaffUser } from "@/models/os/StaffUser";
import type { ActivityActionType, StaffRole } from "@/lib/os/constants";
import type { Types } from "mongoose";

export async function logActivity(input: {
  title: string;
  detail?: string;
  createdBy: string;
  actorUserId?: string;
  actorName?: string;
  actionType?: ActivityActionType | string;
  conversionUuid?: string;
  leadId?: string;
  vendorId?: string;
  projectId?: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  await connectDB();
  const metadata = {
    ...(input.metadata || {}),
    ...(input.actorName ? { actorName: input.actorName } : {}),
  };
  await ActivityEvent.create({
    title: input.title,
    detail: input.detail || "",
    createdBy: input.createdBy,
    actorUserId: input.actorUserId || undefined,
    actionType: input.actionType || "",
    conversionUuid: input.conversionUuid,
    leadId: input.leadId,
    vendorId: input.vendorId,
    projectId: input.projectId,
    entityType: input.entityType,
    entityId: input.entityId || "",
    metadata,
  });
}

export async function notifyStaff(input: {
  type: string;
  title: string;
  body?: string;
  href?: string;
  conversionUuid?: string;
  recipientEmail?: string;
  recipientRole?: string;
}) {
  await connectDB();
  if (input.recipientEmail) {
    await OsNotification.create({
      recipientEmail: input.recipientEmail.toLowerCase(),
      type: input.type,
      title: input.title,
      body: input.body || "",
      href: input.href || "",
      conversionUuid: input.conversionUuid,
    });
    return;
  }
  if (input.recipientRole) {
    const users = await StaffUser.find({
      role: input.recipientRole as StaffRole,
      isActive: true,
    }).lean();
    if (users.length === 0) return;
    await OsNotification.insertMany(
      users.map((u) => ({
        recipientEmail: u.email,
        recipientRole: input.recipientRole,
        type: input.type,
        title: input.title,
        body: input.body || "",
        href: input.href || "",
        conversionUuid: input.conversionUuid,
      }))
    );
    return;
  }
  const users = await StaffUser.find({ isActive: true }).lean();
  if (users.length === 0) return;
  await OsNotification.insertMany(
    users.map((u) => ({
      recipientEmail: u.email,
      type: input.type,
      title: input.title,
      body: input.body || "",
      href: input.href || "",
      conversionUuid: input.conversionUuid,
    }))
  );
}

export async function writeAudit(input: {
  entityType: string;
  entityId: string;
  conversionUuid?: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
  createdBy: string;
}) {
  await connectDB();
  await AuditLog.create(input);
}

export type ResolvedActor = {
  name: string;
  email: string;
  userId?: string;
};

/** Resolve actor display name; includes inactive users for historical accuracy. */
export async function resolveActorNames(
  events: {
    actorUserId?: Types.ObjectId | string | null;
    createdBy?: string;
    metadata?: { actorName?: string } | null;
  }[]
): Promise<Map<string, string>> {
  const ids = [
    ...new Set(
      events
        .map((e) => (e.actorUserId ? String(e.actorUserId) : ""))
        .filter(Boolean)
    ),
  ];
  const emails = [
    ...new Set(
      events.map((e) => (e.createdBy || "").toLowerCase()).filter(Boolean)
    ),
  ];

  await connectDB();
  const byId = new Map<string, string>();
  if (ids.length) {
    const users = await StaffUser.find({ _id: { $in: ids } })
      .select("name email")
      .lean();
    for (const u of users) {
      byId.set(String(u._id), u.name || u.email);
    }
  }
  const byEmail = new Map<string, string>();
  if (emails.length) {
    const users = await StaffUser.find({ email: { $in: emails } })
      .select("name email")
      .lean();
    for (const u of users) {
      byEmail.set(u.email.toLowerCase(), u.name || u.email);
    }
  }

  const result = new Map<string, string>();
  for (const e of events) {
    const key = e.actorUserId
      ? `id:${String(e.actorUserId)}`
      : `email:${(e.createdBy || "").toLowerCase()}`;
    if (result.has(key)) continue;
    const metaName =
      e.metadata && typeof e.metadata === "object"
        ? (e.metadata as { actorName?: string }).actorName
        : undefined;
    const name =
      (e.actorUserId && byId.get(String(e.actorUserId))) ||
      metaName ||
      (e.createdBy && byEmail.get(e.createdBy.toLowerCase())) ||
      e.createdBy ||
      "Unknown";
    result.set(key, name);
  }
  return result;
}

export function actorKey(event: {
  actorUserId?: Types.ObjectId | string | null;
  createdBy?: string;
}) {
  if (event.actorUserId) return `id:${String(event.actorUserId)}`;
  return `email:${(event.createdBy || "").toLowerCase()}`;
}
