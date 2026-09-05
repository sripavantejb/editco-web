export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesLead } from "@/models/sales/SalesLead";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { StaffUser } from "@/models/os/StaffUser";
import { OsPage, OsStat } from "@/components/os/ui";

export default async function LeadAssignmentPage() {
  const staff = await requireSalesPage("leads.assignment");

  const employees = await SalesEmployee.find({ status: "active" }).lean();
  const staffUsers = await StaffUser.find({ _id: { $in: employees.map((e) => e.staffUserId) } })
    .select("name email")
    .lean();
  const staffById = new Map(staffUsers.map((s) => [String(s._id), s]));

  const leads = await SalesLead.find({ recordStatus: "active", status: { $nin: ["converted", "lost"] } }).lean();
  const unassigned = leads.filter((l) => !l.assignedEmployeeId);

  const workload = employees.map((e) => {
    const count = leads.filter((l) => String(l.assignedEmployeeId) === String(e._id)).length;
    return { id: String(e._id), name: staffById.get(String(e.staffUserId))?.name || "—", count };
  });

  return (
    <OsPage
      title="Lead Assignment"
      subtitle={
        staff.isSalesAdmin
          ? "Team workload at a glance. Reassign leads from All Leads."
          : "Your current open-lead load."
      }
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <OsStat label="Open leads (all)" value={String(leads.length)} />
        <OsStat label="Unassigned" value={String(unassigned.length)} />
        <OsStat
          label="My open leads"
          value={String(leads.filter((l) => String(l.assignedEmployeeId) === staff.employeeId).length)}
        />
      </div>

      {staff.isSalesAdmin ? (
        <section className="rounded-[20px] border border-[var(--dash-border)] p-5">
          <h2 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
            Team workload
          </h2>
          <ul className="space-y-2 font-inter text-sm">
            {workload.map((w) => (
              <li key={w.id} className="flex justify-between text-[var(--dash-muted)]">
                <span className="text-[var(--dash-text)]">{w.name}</span>
                <span>{w.count} open</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </OsPage>
  );
}
