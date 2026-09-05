export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesAttendance } from "@/models/sales/SalesAttendance";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { StaffUser } from "@/models/os/StaffUser";
import { OsBadge, OsPage, OsStat, OsTable, Td, Th } from "@/components/os/ui";
import { SALES_ATTENDANCE_STATUS_LABELS } from "@/lib/sales/constants";
import { formatDateTime } from "@/lib/utils";

export default async function SalesAttendanceDashboardPage() {
  const staff = await requireSalesPage("workforce.attendance_dashboard");
  const today = new Date().toISOString().slice(0, 10);

  const employees = await SalesEmployee.find({ status: "active" }).lean();
  const staffUsers = await StaffUser.find({ _id: { $in: employees.map((e) => e.staffUserId) } }).select("name").lean();
  const staffById = new Map(staffUsers.map((s) => [String(s._id), s]));

  const records = await SalesAttendance.find({ date: today }).lean();
  const byEmployee = new Map(records.map((r) => [String(r.employeeId), r]));

  const present = records.filter((r) => r.status === "present").length;
  const absent = employees.length - records.length;

  const scope = staff.isSalesAdmin ? employees : employees.filter((e) => String(e._id) === staff.employeeId);

  return (
    <OsPage title="Attendance Dashboard" subtitle="Team attendance for today.">
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <OsStat label="Present" value={String(present)} />
        <OsStat label="Not checked in" value={String(absent)} />
        <OsStat label="Team size" value={String(employees.length)} />
      </div>
      <OsTable>
        <thead>
          <tr><Th>Employee</Th><Th>Status</Th><Th>Check in</Th></tr>
        </thead>
        <tbody>
          {scope.map((e) => {
            const record = byEmployee.get(String(e._id));
            return (
              <tr key={String(e._id)}>
                <Td>{staffById.get(String(e.staffUserId))?.name || "—"}</Td>
                <Td>
                  {record ? (
                    <OsBadge tone="ok">{SALES_ATTENDANCE_STATUS_LABELS[record.status as keyof typeof SALES_ATTENDANCE_STATUS_LABELS]}</OsBadge>
                  ) : (
                    <OsBadge tone="warn">Not checked in</OsBadge>
                  )}
                </Td>
                <Td>{record?.checkInAt ? formatDateTime(record.checkInAt) : "—"}</Td>
              </tr>
            );
          })}
        </tbody>
      </OsTable>
    </OsPage>
  );
}
