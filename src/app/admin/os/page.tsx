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
import { Referrer } from "@/models/Referrer";
import { SalesCustomer } from "@/models/sales/SalesCustomer";
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
import { DashboardActivityButton } from "@/components/os/DashboardActivityButton";
import { EmailAlertsButton, TeamWorkloadCard } from "@/components/os/TeamWorkloadCard";
import { FollowUp } from "@/models/os/FollowUp";
import { EditcoTrackerRow } from "@/models/os/EditcoTrackerRow";
import {
  EDITCO_TEAM_EMAILS,
  EDITCO_TEAM_NAMES,
  type EditcoTeamName,
} from "@/lib/os/editco-tracker";
import Link from "next/link";
import "@/models/sales/register";

/** HRMS-style title row inside a card — sentence case, not a page section heading. */
function CardTitle({
  title,
  href,
  actionLabel = "View all →",
}: {
  title: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-inter text-[15px] font-semibold tracking-[-0.01em] text-[#111111]">
        {title}
      </h2>
      {href ? (
        <Link
          href={href}
          className="shrink-0 font-inter text-[13px] font-medium text-[#6b7280] transition-colors hover:text-[#111111]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

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
    activeStaff,
    myMemberships,
    salesCustomers,
    referrerCount,
    dueFollowUps,
    trackerRows,
  ] = await Promise.all([
    Lead.find({ recordStatus: "active" }).select("status estimatedValue").lean(),
    Conversion.find({ recordStatus: "active" }).select("_id").lean(),
    Vendor.find({ recordStatus: "active" }).select("companyName accountOwner createdAt").lean(),
    Project.find({ recordStatus: "active" })
      .select("status expectedDelivery primaryPocUserId name")
      .lean(),
    Invoice.find({ recordStatus: "active" })
      .select("status total amountPaid dueDate paymentDate invoiceNumber")
      .lean(),
    Meeting.find({ recordStatus: "active", startsAt: { $gte: now } })
      .sort({ startsAt: 1 })
      .limit(5)
      .select("title startsAt")
      .lean(),
    ActivityEvent.find({}).sort({ createdAt: -1 }).limit(8).select("createdBy actorUserId title detail createdAt metadata").lean(),
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
      .select("title dueDate status projectId")
      .lean(),
    OsTask.find({
      recordStatus: "active",
      assignedToId: staff.userId,
      dueDate: { $gte: todayStart, $lte: todayEnd },
      status: { $nin: ["completed", "cancelled"] },
    })
      .select("_id")
      .lean(),
    OsTask.find({
      recordStatus: "active",
      assignedToId: staff.userId,
      dueDate: { $lt: todayStart },
      status: { $nin: ["completed", "cancelled"] },
    })
      .select("_id")
      .lean(),
    OsTask.find({
      recordStatus: "active",
      assignedToId: staff.userId,
      status: "blocked",
    })
      .select("_id")
      .lean(),
    StaffUser.find({
      isActive: true,
      email: { $in: Object.values(EDITCO_TEAM_EMAILS).map((e) => e.toLowerCase()) },
    })
      .select("name email")
      .lean(),
    ProjectMember.find({ userId: staff.userId }).select("projectId").lean(),
    SalesCustomer.find({ recordStatus: "active" })
      .select("name company customerSince")
      .limit(50)
      .lean(),
    Referrer.countDocuments({}),
    FollowUp.find({
      recordStatus: "active",
      status: "pending",
      dueAt: { $lte: todayEnd },
    })
      .sort({ dueAt: 1 })
      .limit(6)
      .select("notes dueAt assigneeEmail")
      .lean(),
    EditcoTrackerRow.find({})
      .select("poc dependency status")
      .lean(),
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

  const teamEmailSet = new Set(
    Object.values(EDITCO_TEAM_EMAILS).map((e) => e.toLowerCase())
  );
  const teamByEmail = new Map(
    activeStaff
      .filter((u) => teamEmailSet.has((u.email || "").toLowerCase()))
      .map((u) => [(u.email || "").toLowerCase(), u] as const)
  );

  function trackerPocIs(row: { poc?: string }, name: EditcoTeamName) {
    return (row.poc || "").trim().toLowerCase() === name.toLowerCase();
  }

  function trackerDone(status: string) {
    return status === "completed" || status === "not_needed";
  }

  // Team workload bars = Master Tracker POC assignments (POC = person doing the task).
  const workload = EDITCO_TEAM_NAMES.map((displayName) => {
    const email = EDITCO_TEAM_EMAILS[displayName].toLowerCase();
    const u = teamByEmail.get(email);
    const uid = u ? String(u._id) : "";

    const mine = trackerRows.filter((r) => trackerPocIs(r, displayName));
    const open = mine.filter((r) => !trackerDone(String(r.status)));
    const completed = mine.filter((r) => trackerDone(String(r.status))).length;
    const blocked = open.filter((r) => String(r.status) === "blocked").length;
    const active = open.length;
    const total = mine.length;

    return {
      id: uid || email,
      name: displayName,
      email,
      active,
      completed,
      total,
      overdue: 0,
      blocked,
    };
  });

  const overdueInvoices = issued.filter(
    (i) =>
      displayInvoiceStatus({
        status: i.status,
        dueDate: i.dueDate,
        amountPaid: i.amountPaid || 0,
        total: i.total || 0,
      }) === "overdue"
  );

  const totalClients = vendors.length + salesCustomers.length;

  return (
    <OsPage
      title="Dashboard"
      subtitle="Editco operations — sales, delivery, finance, and growth in one place."
      actions={
        <>
          <DashboardActivityButton
            items={activity.map((a) => ({
              id: String(a._id),
              actor: actorNames.get(actorKey(a)) || a.createdBy || "System",
              title: a.title,
              detail: a.detail || undefined,
              at: a.createdAt ? new Date(a.createdAt).toISOString() : undefined,
            }))}
          />
          <OsLink href="/admin/os/leads/new">Add lead</OsLink>
          <OsLink href="/admin/os/notifications">Inbox ({unread})</OsLink>
          {canSeeAll ? (
            <EmailAlertsButton
              overdueInvoices={overdueInvoices.length}
              overdueTasks={overdueTasks.length}
              followUpsDue={dueFollowUps.length}
            />
          ) : null}
        </>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OsStat label="My tasks" value={String(myTasks.length)} />
        <OsStat label="Today" value={String(todayTasks.length)} />
        <OsStat label="Overdue" value={String(overdueTasks.length)} />
        <OsStat label="Blocked" value={String(blockedTasks.length)} />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/referrals" className="block rounded-xl border border-[var(--dash-border)] bg-white p-4 transition-colors hover:border-[#111111]">
          <p className="font-inter text-[11px] uppercase tracking-[0.14em] text-[var(--dash-faint)]">Referrals</p>
          <p className="mt-2 font-archivo text-2xl text-[var(--dash-text)]">{referrerCount}</p>
          <p className="mt-1 font-inter text-xs text-[var(--dash-muted)]">View referrals →</p>
        </Link>
        <Link href="/admin/os/vendors" className="block rounded-xl border border-[var(--dash-border)] bg-white p-4 transition-colors hover:border-[#111111]">
          <p className="font-inter text-[11px] uppercase tracking-[0.14em] text-[var(--dash-faint)]">Total clients</p>
          <p className="mt-2 font-archivo text-2xl text-[var(--dash-text)]">{totalClients}</p>
          <p className="mt-1 font-inter text-xs text-[var(--dash-muted)]">Editco OS clients →</p>
        </Link>
        <OsStat label="Sales CRM customers" value={String(salesCustomers.length)} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <section className="flex max-h-72 flex-col overflow-hidden rounded-xl border border-[var(--dash-border)] bg-white p-5">
          <CardTitle title="My tasks" href="/admin/os/tasks?view=my" />
          <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-3 font-inter text-sm [scrollbar-gutter:stable]">
            {myTasks.map((t) => (
              <li key={String(t._id)} className="flex items-center justify-between gap-3">
                <Link href={`/admin/os/tasks/${t._id}`} className="truncate font-medium text-[#111111]">
                  {t.title}
                </Link>
                <span className="shrink-0 text-[12px] text-[#6b7280]">{t.status}</span>
              </li>
            ))}
            {myTasks.length === 0 ? (
              <li className="text-[#6b7280]">No open tasks assigned to you.</li>
            ) : null}
          </ul>
        </section>
        <section className="flex max-h-72 flex-col overflow-hidden rounded-xl border border-[var(--dash-border)] bg-white p-5">
          <CardTitle title="My projects" href="/admin/os/projects" />
          <ul className="mb-3 space-y-2 font-inter text-sm text-[#6b7280]">
            <li className="flex justify-between">
              Primary POC
              <span className="font-medium text-[#111111]">{ownedProjects.length}</span>
            </li>
            <li className="flex justify-between">
              Working on
              <span className="font-medium text-[#111111]">{workingProjects.length}</span>
            </li>
          </ul>
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-3 font-inter text-sm [scrollbar-gutter:stable]">
            {workingProjects.slice(0, 8).map((p) => (
              <li key={String(p._id)}>
                <Link href={`/admin/os/projects/${p._id}`} className="font-medium text-[#111111]">
                  {p.name || "Untitled project"}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {canSeeAll ? <TeamWorkloadCard people={workload} /> : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <OsStat label="Revenue received" value={received} />
        <OsStat label="Active clients" value={String(vendors.length)} />
        <OsStat label="Active projects" value={String(activeProjects.length)} />
        <OsStat label="Open leads" value={String(openLeads.length)} />
        <OsStat label="Pipeline value" value={pipelineValue} />
        <OsStat label="Outstanding" value={outstanding} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-[var(--dash-border)] bg-white p-5">
          <CardTitle title="Sales pipeline" href="/admin/os/pipeline" />
          <ul className="space-y-2.5 font-inter text-sm text-[#6b7280]">
            {LEAD_PIPELINE.map((st) => (
              <li key={st} className="flex justify-between">
                <span className="capitalize">{st.replace("_", " ")}</span>
                <span className="font-medium text-[#111111]">{salesCounts[st]}</span>
              </li>
            ))}
            <li className="flex justify-between border-t border-[#f3f4f6] pt-2.5 font-medium text-[#111111]">
              Conversion rate <span>{conversionRate}%</span>
            </li>
          </ul>
        </section>
        <section className="rounded-xl border border-[var(--dash-border)] bg-white p-5">
          <CardTitle title="Operations" href="/admin/os/projects?filter=due" actionLabel="Due soon →" />
          <ul className="space-y-2.5 font-inter text-sm text-[#6b7280]">
            <li className="flex justify-between">
              Projects due soon
              <span className="font-medium text-[#111111]">{dueSoon.length}</span>
            </li>
            <li className="flex justify-between">
              Upcoming meetings
              <span className="font-medium text-[#111111]">{meetings.length}</span>
            </li>
            {meetings.slice(0, 3).map((m) => (
              <li key={String(m._id)}>
                <Link href={`/admin/os/meetings/${m._id}`} className="text-[#111111]">
                  {m.title} · {formatDate(m.startsAt)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-[var(--dash-border)] bg-white p-5">
          <CardTitle title="Finance" href="/admin/os/revenue" />
          <ul className="space-y-2.5 font-inter text-sm text-[#6b7280]">
            <li className="flex justify-between">
              Invoiced <span className="font-medium text-[#111111]">{formatCurrencyINR(invoiced)}</span>
            </li>
            <li className="flex justify-between">
              Collected <span className="font-medium text-[#111111]">{formatCurrencyINR(received)}</span>
            </li>
            <li className="flex justify-between">
              Outstanding <span className="font-medium text-[#111111]">{formatCurrencyINR(outstanding)}</span>
            </li>
            <li className="flex justify-between text-red-600">
              Overdue <span className="font-medium">{formatCurrencyINR(overdue)}</span>
            </li>
            <li className="flex justify-between">
              This month{" "}
              <span className="font-medium text-[#111111]">
                {formatCurrencyINR(monthPaid.reduce((s, i) => s + (i.amountPaid || 0), 0))}
              </span>
            </li>
            <li className="flex justify-between">
              This quarter{" "}
              <span className="font-medium text-[#111111]">
                {formatCurrencyINR(quarterPaid.reduce((s, i) => s + (i.amountPaid || 0), 0))}
              </span>
            </li>
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-[var(--dash-border)] bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-inter text-[15px] font-semibold tracking-[-0.01em] text-[#111111]">
            Needs attention
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {canSeeAll ? (
              <EmailAlertsButton
                overdueInvoices={overdueInvoices.length}
                overdueTasks={overdueTasks.length}
                followUpsDue={dueFollowUps.length}
              />
            ) : null}
            <Link
              href="/admin/os/outstanding"
              className="font-inter text-[13px] font-medium text-[#6b7280] transition-colors hover:text-[#111111]"
            >
              Outstanding →
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#f3f4f6] bg-[#f8f9fa] p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-inter text-[13px] font-semibold text-[#111111]">Overdue invoices</p>
              <Link href="/admin/os/outstanding" className="font-inter text-xs text-[#6b7280] hover:text-[#111111]">
                View
              </Link>
            </div>
            <p className="font-archivo text-xl text-[#111111]">{overdueInvoices.length}</p>
            <p className="mt-1 font-inter text-xs text-red-600">{formatCurrencyINR(overdue)}</p>
          </div>
          <div className="rounded-xl border border-[#f3f4f6] bg-[#f8f9fa] p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-inter text-[13px] font-semibold text-[#111111]">Follow-ups due</p>
              <Link href="/admin/os/follow-ups" className="font-inter text-xs text-[#6b7280] hover:text-[#111111]">
                View
              </Link>
            </div>
            <p className="font-archivo text-xl text-[#111111]">{dueFollowUps.length}</p>
            <ul className="mt-2 space-y-1 font-inter text-xs text-[#6b7280]">
              {dueFollowUps.slice(0, 3).map((f) => (
                <li key={String(f._id)} className="truncate">
                  {f.notes || "Follow-up"} · {formatDate(f.dueAt)}
                </li>
              ))}
              {dueFollowUps.length === 0 ? <li>All clear</li> : null}
            </ul>
          </div>
          <div className="rounded-xl border border-[#f3f4f6] bg-[#f8f9fa] p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-inter text-[13px] font-semibold text-[#111111]">Delivery risk</p>
              <Link href="/admin/os/projects?filter=due" className="font-inter text-xs text-[#6b7280] hover:text-[#111111]">
                View
              </Link>
            </div>
            <p className="font-archivo text-xl text-[#111111]">{dueSoon.length}</p>
            <p className="mt-1 font-inter text-xs text-[#6b7280]">
              Projects due in 7 days · {overdueTasks.length} overdue tasks
            </p>
          </div>
        </div>
      </section>
    </OsPage>
  );
}
