import { connectDB } from "@/lib/db";
import { SalesActivityEvent } from "@/models/sales/SalesActivityEvent";
import { SalesAuditLog } from "@/models/sales/SalesAuditLog";

export async function logSalesActivity(input: {
  type: string;
  title: string;
  detail?: string;
  actorEmployeeId?: string;
  actorName?: string;
  leadId?: string;
  dealId?: string;
  customerId?: string;
  metadata?: Record<string, unknown>;
}) {
  await connectDB();
  await SalesActivityEvent.create({
    type: input.type,
    title: input.title,
    detail: input.detail || "",
    actorEmployeeId: input.actorEmployeeId || undefined,
    actorName: input.actorName || "",
    leadId: input.leadId || undefined,
    dealId: input.dealId || undefined,
    customerId: input.customerId || undefined,
    metadata: input.metadata || {},
  });
}

export async function writeSalesAudit(input: {
  action: string;
  entityType: string;
  entityId: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  actorEmail: string;
}) {
  await connectDB();
  await SalesAuditLog.create({
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    field: input.field || "",
    oldValue: input.oldValue || "",
    newValue: input.newValue || "",
    reason: input.reason || "",
    actorEmail: input.actorEmail,
  });
}
