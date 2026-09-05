import { connectDB } from "@/lib/db";
import { SalesActivityEvent } from "@/models/sales/SalesActivityEvent";
import { SalesAuditLog } from "@/models/sales/SalesAuditLog";
import { SalesNotification } from "@/models/sales/SalesNotification";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { StaffUser } from "@/models/os/StaffUser";
import { sendNotificationEmail } from "@/lib/mail";

/** Creates the in-app notification and emails the employee — the one place every Sales CRM notification should flow through. */
export async function notifySalesEmployee(input: {
  employeeId: string;
  type: string;
  title: string;
  body?: string;
  href?: string;
}) {
  await connectDB();
  await SalesNotification.create({
    recipientEmployeeId: input.employeeId,
    type: input.type,
    title: input.title,
    body: input.body || "",
    href: input.href || "",
  });

  const employee = await SalesEmployee.findById(input.employeeId).lean();
  if (!employee) return;
  const staff = await StaffUser.findById(employee.staffUserId).select("email").lean();
  if (!staff?.email) return;

  await sendNotificationEmail({
    to: staff.email,
    title: input.title,
    body: input.body,
    href: input.href,
    eyebrow: "Sales CRM",
    ctaLabel: "Open in Sales CRM →",
  });
}

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
