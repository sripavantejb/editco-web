export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesLead } from "@/models/sales/SalesLead";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { StaffUser } from "@/models/os/StaffUser";
import { assignSalesLead, deleteSalesLead } from "@/actions/sales/leads";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsSelect } from "@/components/os/OsSelect";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import { OsBadge, OsGhostLink, OsPage, OsTable, Td, Th } from "@/components/os/ui";
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
    label:
      staffById.get(String(e.staffUserId))?.name ||
      staffById.get(String(e.staffUserId))?.email ||
      e.employeeCode,
  }));
  const employeeNameById = new Map(
    employees.map((e) => [String(e._id), staffById.get(String(e.staffUserId))?.name || "—"])
  );

  return (
    <OsPage
      title="Leads"
      subtitle="Every lead across the sales team — assign or reassign as needed."
      backHref="/sales/admin"
      backLabel="Dashboard"
      actions={<OsGhostLink href="/sales/admin/leads/assignment">Assignment</OsGhostLink>}
    >
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
            <Th>{null}</Th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={String(lead._id)}>
              <Td className="font-medium text-[#111111]">{lead.contactPerson}</Td>
              <Td>{lead.company || "—"}</Td>
              <Td>
                <OsBadge tone={salesLeadTone(lead.status)}>
                  {SALES_LEAD_STATUS_LABELS[lead.status as SalesLeadStatus]}
                </OsBadge>
              </Td>
              <Td className="capitalize">{lead.priority}</Td>
              <Td>
                {lead.assignedEmployeeId
                  ? employeeNameById.get(String(lead.assignedEmployeeId)) || "—"
                  : "Unassigned"}
              </Td>
              <Td>{formatDate(lead.createdAt)}</Td>
              <Td>
                <OsActionForm
                  action={assignSalesLead}
                  submitLabel="Save"
                  className="flex max-w-[240px] items-center gap-2"
                  showSubmit
                  compact
                >
                  <input type="hidden" name="leadId" value={String(lead._id)} />
                  <OsSelect
                    name="employeeId"
                    options={employeeOptions.map((opt) => ({
                      value: opt.id,
                      label: opt.label || "—",
                    }))}
                    defaultValue={String(lead.assignedEmployeeId || "")}
                    placeholder="Choose…"
                    className="min-w-[120px]"
                  />
                </OsActionForm>
              </Td>
              <Td>
                <RowDeleteButton
                  action={deleteSalesLead}
                  id={String(lead._id)}
                  confirmMessage="Archive this lead?"
                  label="Delete lead"
                />
              </Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {leads.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[#6b7280]">
          No leads yet. Leads created by employees show up here.
        </p>
      ) : null}
      <p className="mt-4 font-inter text-[13px] text-[#6b7280]">
        <Link href="/sales/admin/team" className="font-medium hover:text-[#111111]">
          Manage team →
        </Link>
      </p>
    </OsPage>
  );
}
