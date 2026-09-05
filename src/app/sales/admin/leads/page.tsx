export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesLead } from "@/models/sales/SalesLead";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { StaffUser } from "@/models/os/StaffUser";
import { assignSalesLead } from "@/actions/sales/leads";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsSelect } from "@/components/os/OsSelect";
import { OsBadge, OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { SALES_LEAD_STATUS_LABELS, type SalesLeadStatus } from "@/lib/sales/constants";
import { salesLeadTone } from "@/lib/sales/tone";
import { formatDate } from "@/lib/utils";

export default async function SalesAdminLeadsPage() {
  await requireSalesAdminPage();

  const leads = await SalesLead.find({ recordStatus: "active" }).sort({ createdAt: -1 }).lean();
  const employees = await SalesEmployee.find({ status: "active" }).lean();
  const staffUsers = await StaffUser.find({ _id: { $in: employees.map((e) => e.staffUserId) } })
    .select("name email")
    .lean();
  const staffById = new Map(staffUsers.map((s) => [String(s._id), s]));
  const employeeOptions = employees.map((e) => ({
    id: String(e._id),
    label: staffById.get(String(e.staffUserId))?.name || staffById.get(String(e.staffUserId))?.email || e.employeeCode,
  }));
  const employeeNameById = new Map(employees.map((e) => [String(e._id), staffById.get(String(e.staffUserId))?.name || "—"]));

  return (
    <OsPage title="All Leads" subtitle="Every lead across the sales team — assign or reassign as needed." backHref="/sales/admin" backLabel="Back to dashboard">
      <OsTable>
        <thead>
          <tr>
            <Th>Lead</Th>
            <Th>Company</Th>
            <Th>Status</Th>
            <Th>Priority</Th>
            <Th>Assigned to</Th>
            <Th>Created</Th>
            <Th>Reassign</Th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={String(lead._id)}>
              <Td>{lead.contactPerson}</Td>
              <Td>{lead.company || "—"}</Td>
              <Td>
                <OsBadge tone={salesLeadTone(lead.status)}>
                  {SALES_LEAD_STATUS_LABELS[lead.status as SalesLeadStatus]}
                </OsBadge>
              </Td>
              <Td className="capitalize">{lead.priority}</Td>
              <Td>{lead.assignedEmployeeId ? employeeNameById.get(String(lead.assignedEmployeeId)) || "—" : "Unassigned"}</Td>
              <Td>{formatDate(lead.createdAt)}</Td>
              <Td>
                <OsActionForm action={assignSalesLead} submitLabel="Assign" className="flex items-center gap-2" showSubmit>
                  <input type="hidden" name="leadId" value={String(lead._id)} />
                  <OsSelect
                    name="employeeId"
                    options={employeeOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
                    defaultValue={String(lead.assignedEmployeeId || "")}
                    placeholder="Choose…"
                    className="min-w-[140px]"
                  />
                </OsActionForm>
              </Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {leads.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">
          No leads yet. Leads created by employees will show up here.
        </p>
      ) : null}
      <p className="mt-4 font-inter text-xs text-[var(--dash-faint)]">
        <Link href="/sales/admin/team">Manage team & permissions</Link>
      </p>
    </OsPage>
  );
}
