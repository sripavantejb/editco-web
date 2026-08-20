export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { Lead } from "@/models/os/Lead";
import { Conversion } from "@/models/os/Conversion";
import { Vendor } from "@/models/os/Vendor";
import { Project } from "@/models/os/Project";
import { Invoice } from "@/models/os/Invoice";
import { Meeting } from "@/models/os/Meeting";
import { ActivityEvent } from "@/models/os/ActivityEvent";
import { OsNotification } from "@/models/os/Notification";
import { OsTask } from "@/models/os/Task";
import { StaffUser } from "@/models/os/StaffUser";
import { ProjectMember } from "@/models/os/ProjectMember";
import {
  ACTIVE_PROJECT_STATUSES,
  LEAD_PIPELINE,
  normalizeProjectStatus,
} from "@/lib/os/constants";
import { displayInvoiceStatus, outstandingOf } from "@/lib/os/money";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { OsPage, OsStat, OsLink } from "@/components/os/ui";
import { resolveActorNames, actorKey } from "@/lib/os/activity";
import { staffCanManageAllProjects } from "@/lib/os/project-access";
import { migrateTaskStatuses } from "@/actions/os/tasks";
import Link from "next/link";

export default async function OsDashboardPage() {
  const staff = await requireOsPage("dashboard:read");
  await migrateTaskStatuses();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
  const quarterStart = new Date(now.getFullYear(), quarterMonth, 1);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const canSeeAll = staffCanManageAllProjects(staff);

  const [
    leads,
    conversions,
    vendors,
    projects,
    invoices,
    meetings,
    activity,
    unread,
    myTasks,
    todayTasks,
    overdueTasks,
    blockedTasks,
    allOpenTasks,
    activeStaff,
    myMemberships,
  ] = await Promise.all([
    Lead.find({ recordStatus: "active" }).lean(),
    Conversion.find({ recordStatus: "active" }).lean(),
    Vendor.find({ recordStatus: "active" }).lean(),
    Project.find({ recordStatus: "active" }).lean(),
    Invoice.find({ recordStatus: "active" }).lean(),
    Meeting.find({ recordStatus: "active", startsAt: { $gte: now } })
      .sort({ startsAt: 1 })
      .limit(5)
      .lean(),
    ActivityEvent.find({}).sort({ createdAt: -1 }).limit(8).lean(),
    OsNotification.countDocuments({
      recipientEmail: staff.email,
      readAt: { $exists: false },
    }),
    OsTask.find({
      recordStatus: "active",
      assignedToId: staff.userId,
      status: { $nin: ["completed", "cancelled"] },
    })
      .sort({ dueDate: 1 })
      .limit(8)
      .lean(),
    OsTask.find({
      recordStatus: "active",
      assignedToId: staff.userId,
      dueDate: { $gte: todayStart, $lte: todayEnd },
      status: { $nin: ["completed", "cancelled"] },
    }).lean(),
    OsTask.find({
      recordStatus: "active",
      assignedToId: staff.userId,
      dueDate: { $lt: todayStart },
      status: { $nin: ["completed", "cancelled"] },
    }).lean(),
    OsTask.find({
      recordStatus: "active",
      assignedToId: staff.userId,
      status: "blocked",
    }).lean(),
    OsTask.find({
      recordStatus: "active",
      status: { $nin: ["completed", "cancelled"] },
    })
      .select("assignedToId dueDate status")
      .lean(),
    StaffUser.find({ isActive: true }).select("name email").lean(),
    ProjectMember.find({ userId: staff.userId }).select("projectId").lean(),
  ]);

  const actorNames = await resolveActorNames(activity);

  const openLeads = leads.filter((l) => !["converted", "lost"].includes(l.status));
  const pipelineValue = openLeads.reduce((s, l) => s + (l.estimatedValue || 0), 0);
  const activeProjects = projects.filter((p) =>
    ACTIVE_PROJECT_STATUSES.includes(normalizeProjectStatus(p.status))
  );
  const dueSoon = activeProjects.filter((p) => {
    if (!p.expectedDelivery) return false;
    const d = new Date(p.expectedDelivery);
    const in7 = new Date(now.getTime() + 7 * 86400000);
    return d <= in7 && d >= now;
  });
  const issued = invoices.filter((i) => i.status !== "draft" && i.status !== "cancelled");
  const invoiced = issued.reduce((s, i) => s + (i.total || 0), 0);
  const received = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const outstanding = outstandingOf(invoiced, received);
  const overdue = issued
    .filter(
      (i) =>
        displayInvoiceStatus({
          status: i.status,
          dueDate: i.dueDate,
          amountPaid: i.amountPaid || 0,
          total: i.total || 0,
        }) === "overdue"
    )
    .reduce((s, i) => s + outstandingOf(i.total || 0, i.amountPaid || 0), 0);

  const monthPaid = invoices.filter(
    (i) => i.paymentDate && new Date(i.paymentDate) >= monthStart
  );
  const quarterPaid = invoices.filter(
    (i) => i.paymentDate && new Date(i.paymentDate) >= quarterStart
  );

  const salesCounts = Object.fromEntries(
    LEAD_PIPELINE.map((st) => [st, leads.filter((l) => l.status === st).length])
  );
  const conversionRate =
    leads.length === 0 ? 0 : Math.round((conversions.length / leads.length) * 100);

  const ownedProjects = projects.filter(
    (p) => p.primaryPocUserId && String(p.primaryPocUserId) === staff.userId
  );
  const memberProjectIds = new Set(myMemberships.map((m) => String(m.projectId)));
  const workingProjects = projects.filter(
    (p) =>
      memberProjectIds.has(String(p._id)) ||
      (p.primaryPocUserId && String(p.primaryPocUserId) === staff.userId)
  );

  const workload = activeStaff.map((u) => {
    const uid = String(u._id);
    const assigned = allOpenTasks.filter(
      (t) => t.assignedToId && String(t.assignedToId) === uid
    );
    const overdueCount = assigned.filter(
      (t) => t.dueDate && new Date(t.dueDate) < todayStart
    ).length;
    return {
      id: uid,
      name: u.name || u.email,
      active: assigned.length,
      overdue: overdueCount,
    };
  });

  return (
    <OsPage
      title="Dashboard"
      subtitle="Editco operations — sales, delivery, finance, and growth in one place."
      actions={
        <>
          <OsLink href="/admin/os/leads/new">Add lead</OsLink>
          <OsLink href="/admin/os/notifications">Inbox ({unread})</OsLink>
        </>
      }
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OsStat label="My tasks" value={String(myTasks.length)} />
        <OsStat label="Today" value={String(todayTasks.length)} />
        <OsStat label="Overdue" value={String(overdueTasks.length)} />
        <OsStat label="Blocked" value={String(blockedTasks.length)} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-archivo text-sm uppercase tracking-wide">My tasks</h2>
            <Link href="/admin/os/tasks?view=my" className="text-sm text-[var(--dash-accent)]">
              View all
            </Link>
          </div>
          <ul className="space-y-2 font-inter text-sm">
            {myTasks.map((t) => (
              <li key={String(t._id)}>
                <Link href={`/admin/os/tasks/${t._id}`} className="text-[var(--dash-text)]">
                  {t.title}
                </Link>
                <span className="ml-2 text-[var(--dash-muted)]">{t.status}</span>
              </li>
            ))}
            {myTasks.length === 0 ? (
              <li className="text-[var(--dash-muted)]">No open tasks assigned to you.</li>
            ) : null}
          </ul>
        </section>
        <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
          <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide">My projects</h2>
          <ul className="space-y-2 font-inter text-sm text-[var(--dash-muted)]">
            <li className="flex justify-between">
              Primary POC
              <span className="text-[var(--dash-text)]">{ownedProjects.length}</span>
            </li>
            <li className="flex justify-between">
              Working on
              <span className="text-[var(--dash-text)]">{workingProjects.length}</span>
            </li>
          </ul>
          <ul className="mt-3 space-y-1 font-inter text-sm">
            {workingProjects.slice(0, 5).map((p) => (
              <li key={String(p._id)}>
                <Link href={`/admin/os/projects/${p._id}`} className="text-[var(--dash-accent)]">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {canSeeAll ? (
        <section className="mb-8 rounded-[20px] border border-[var(--dash-border)] p-5">
          <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide">
            Team workload
          </h2>
          <ul className="space-y-2 font-inter text-sm">
            {workload.map((w) => (
              <li key={w.id} className="flex justify-between text-[var(--dash-muted)]">
                <span className="text-[var(--dash-text)]">{w.name}</span>
                <span>
                  {w.active} active
                  {w.overdue ? ` · ${w.overdue} overdue` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <OsStat label="Revenue received" value={received} />
        <OsStat label="Active clients" value={String(vendors.length)} />
        <OsStat label="Active projects" value={String(activeProjects.length)} />
        <OsStat label="Open leads" value={String(openLeads.length)} />
        <OsStat label="Pipeline value" value={pipelineValue} />
        <OsStat label="Outstanding" value={outstanding} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
          <h2 className="font-archivo text-sm uppercase tracking-wide">Sales</h2>
          <ul className="mt-3 space-y-2 font-inter text-sm text-[var(--dash-muted)]">
            {LEAD_PIPELINE.map((st) => (
              <li key={st} className="flex justify-between">
                <span className="capitalize">{st.replace("_", " ")}</span>
                <span className="text-[var(--dash-text)]">{salesCounts[st]}</span>
              </li>
            ))}
            <li className="flex justify-between pt-2 text-[var(--dash-text)]">
              Conversion rate <span>{conversionRate}%</span>
            </li>
          </ul>
        </section>
        <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
          <h2 className="font-archivo text-sm uppercase tracking-wide">Operations</h2>
          <ul className="mt-3 space-y-2 font-inter text-sm text-[var(--dash-muted)]">
            <li className="flex justify-between">
              Projects due soon
              <Link href="/admin/os/projects?filter=due" className="text-[var(--dash-accent)]">
                {dueSoon.length}
              </Link>
            </li>
            <li>Upcoming meetings: {meetings.length}</li>
            {meetings.map((m) => (
              <li key={String(m._id)}>
                <Link href={`/admin/os/meetings/${m._id}`} className="text-[var(--dash-text)]">
                  {m.title} · {formatDate(m.startsAt)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
          <h2 className="font-archivo text-sm uppercase tracking-wide">Finance</h2>
          <ul className="mt-3 space-y-2 font-inter text-sm text-[var(--dash-muted)]">
            <li className="flex justify-between">
              Invoiced <span>{formatCurrencyINR(invoiced)}</span>
            </li>
            <li className="flex justify-between">
              Collected <span>{formatCurrencyINR(received)}</span>
            </li>
            <li className="flex justify-between">
              Outstanding <span>{formatCurrencyINR(outstanding)}</span>
            </li>
            <li className="flex justify-between text-red-300">
              Overdue <span>{formatCurrencyINR(overdue)}</span>
            </li>
            <li className="flex justify-between">
              This month{" "}
              <span>
                {formatCurrencyINR(
                  monthPaid.reduce((s, i) => s + (i.amountPaid || 0), 0)
                )}
              </span>
            </li>
            <li className="flex justify-between">
              This quarter{" "}
              <span>
                {formatCurrencyINR(
                  quarterPaid.reduce((s, i) => s + (i.amountPaid || 0), 0)
                )}
              </span>
            </li>
          </ul>
        </section>
      </div>
      <section className="mt-8">
        <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide">
          Latest activity
        </h2>
        <ul className="space-y-2">
          {activity.map((a) => (
            <li
              key={String(a._id)}
              className="rounded-xl border border-[var(--dash-border)] px-4 py-3 font-inter text-sm"
            >
              <span className="font-medium text-[var(--dash-text)]">
                {actorNames.get(actorKey(a)) || a.createdBy}
              </span>
              <span className="ml-2 text-[var(--dash-text)]">{a.title}</span>
              <span className="ml-2 text-[var(--dash-faint)]">{a.detail}</span>
            </li>
          ))}
        </ul>
      </section>
    </OsPage>
  );
}
