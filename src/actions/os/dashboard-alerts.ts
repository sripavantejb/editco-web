"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { notifyStaff } from "@/lib/os/activity";
import { sendNotificationEmail } from "@/lib/mail";
import { Invoice } from "@/models/os/Invoice";
import { OsTask } from "@/models/os/Task";
import { FollowUp } from "@/models/os/FollowUp";
import { StaffUser } from "@/models/os/StaffUser";
import { RecurringPayment } from "@/models/os/RecurringPayment";
import { displayInvoiceStatus, outstandingOf } from "@/lib/os/money";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { SUPER_ADMIN_EMAILS, isSuperAdminEmail } from "@/lib/os/super-admin";
import type { ActionState } from "@/actions/auth";

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

/** Snapshot of critical ops alerts → email super admins + people with overdue work. */
export async function sendOsDashboardAlerts(
  _prev: ActionState,
  _formData?: FormData
): Promise<ActionState> {
  const gate = await requireStaff("dashboard:read");
  if (!gate.ok) return { error: gate.error };

  await connectDB();
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const in7 = new Date(now.getTime() + 7 * 86400000);

  const [invoices, overdueTasks, dueFollowUps, staff, recurringDue] = await Promise.all([
    Invoice.find({ recordStatus: "active" })
      .select("status total amountPaid dueDate invoiceNumber")
      .lean(),
    OsTask.find({
      recordStatus: "active",
      dueDate: { $lt: todayStart },
      status: { $nin: ["completed", "cancelled"] },
    })
      .select("title assignedToId dueDate")
      .lean(),
    FollowUp.find({
      recordStatus: "active",
      status: "pending",
      dueAt: { $lte: todayEnd },
    })
      .select("notes dueAt assigneeEmail")
      .lean(),
    StaffUser.find({ isActive: true }).select("name email").lean(),
    RecurringPayment.find({
      recordStatus: "active",
      status: "active",
      nextDueAt: { $lte: in7 },
    })
      .select("title amount nextDueAt")
      .sort({ nextDueAt: 1 })
      .lean(),
  ]);

  const overdueInvoices = invoices.filter(
    (i) =>
      i.status !== "draft" &&
      i.status !== "cancelled" &&
      displayInvoiceStatus({
        status: i.status,
        dueDate: i.dueDate,
        amountPaid: i.amountPaid || 0,
        total: i.total || 0,
      }) === "overdue"
  );
  const overdueAmount = overdueInvoices.reduce(
    (s, i) => s + outstandingOf(i.total || 0, i.amountPaid || 0),
    0
  );

  const bodyLines = [
    `Date: ${dayKey()}`,
    `Overdue invoices: ${overdueInvoices.length} (${formatCurrencyINR(overdueAmount)})`,
    `Overdue tasks: ${overdueTasks.length}`,
    `Follow-ups due: ${dueFollowUps.length}`,
    `Recurring payments due (7d): ${recurringDue.length}`,
    "",
    overdueInvoices.length
      ? `Top overdue invoices: ${overdueInvoices
          .slice(0, 5)
          .map((i) => i.invoiceNumber || "Invoice")
          .join(", ")}`
      : "No overdue invoices.",
    overdueTasks.length
      ? `Top overdue tasks: ${overdueTasks
          .slice(0, 5)
          .map((t) => t.title)
          .join(", ")}`
      : "No overdue tasks.",
    recurringDue.length
      ? `Recurring due: ${recurringDue
          .slice(0, 5)
          .map(
            (r) =>
              `${r.title} (${formatCurrencyINR(r.amount)} · ${formatDate(r.nextDueAt)})`
          )
          .join(", ")}`
      : "No recurring payments due soon.",
  ];

  const digestBody = bodyLines.join("<br/>");
  const title = `Editco alerts · ${dayKey()}`;
  const href = "/admin/os";

  // Super admins always get the digest.
  await Promise.all(
    SUPER_ADMIN_EMAILS.map((email) =>
      sendNotificationEmail({
        to: email,
        title,
        body: digestBody,
        href,
        eyebrow: "Ops alert",
        ctaLabel: "Open dashboard →",
      })
    )
  );

  if (recurringDue.length > 0) {
    await notifyStaff({
      type: "recurring_payment",
      title: `Recurring payments due (${recurringDue.length})`,
      body: recurringDue
        .slice(0, 8)
        .map(
          (r) =>
            `${r.title}: ${formatCurrencyINR(r.amount)} · ${formatDate(r.nextDueAt)}`
        )
        .join(" · "),
      href: "/admin/os/recurring-payments",
      recipientRole: "finance",
    });
  }

  // People with overdue tasks get a personal nudge.
  const byAssignee = new Map<string, string[]>();
  for (const t of overdueTasks) {
    if (!t.assignedToId) continue;
    const id = String(t.assignedToId);
    const list = byAssignee.get(id) || [];
    list.push(t.title);
    byAssignee.set(id, list);
  }

  for (const [userId, titles] of byAssignee) {
    const user = staff.find((s) => String(s._id) === userId);
    if (!user?.email) continue;
    if (isSuperAdminEmail(user.email)) continue;
    await notifyStaff({
      type: "task_overdue_alert",
      title: `You have ${titles.length} overdue task${titles.length === 1 ? "" : "s"}`,
      body: titles.slice(0, 6).join(" · "),
      href: "/admin/os/tasks?view=my",
      recipientEmail: user.email,
    });
  }

  // Follow-up assignees
  const followEmails = [
    ...new Set(
      dueFollowUps
        .map((f) => (f.assigneeEmail || "").toLowerCase())
        .filter(Boolean)
    ),
  ];
  for (const email of followEmails) {
    if (isSuperAdminEmail(email)) continue;
    const mine = dueFollowUps.filter(
      (f) => (f.assigneeEmail || "").toLowerCase() === email
    );
    await notifyStaff({
      type: "followup_due_alert",
      title: `${mine.length} follow-up${mine.length === 1 ? "" : "s"} due`,
      body: mine
        .slice(0, 5)
        .map((f) => f.notes || "Follow-up")
        .join(" · "),
      href: "/admin/os/follow-ups",
      recipientEmail: email,
    });
  }

  revalidatePath("/admin/os");
  revalidatePath("/admin/os/notifications");
  return {
    success: `Alerts emailed to ${SUPER_ADMIN_EMAILS.length} admins` +
      (byAssignee.size || followEmails.length
        ? ` + ${byAssignee.size + followEmails.length} assignees`
        : "") +
      ".",
  };
}

/** Nudge one teammate about their open / overdue load. */
export async function nudgeStaffWorkload(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("dashboard:read");
  if (!gate.ok) return { error: gate.error };

  const email = String(formData.get("email") || "")
    .toLowerCase()
    .trim();
  const name = String(formData.get("name") || email);
  const active = Number(formData.get("active") || 0);
  const overdue = Number(formData.get("overdue") || 0);
  if (!email) return { error: "Missing teammate email" };

  await notifyStaff({
    type: "workload_nudge",
    title: `Workload check-in from ${gate.staff.name}`,
    body: `You currently have ${active} active task${active === 1 ? "" : "s"}${
      overdue ? ` (${overdue} overdue)` : ""
    }. Please update statuses or ask for help if blocked.`,
    href: "/admin/os/tasks?view=my",
    recipientEmail: email,
  });

  return { success: `Nudge sent to ${name}.` };
}
