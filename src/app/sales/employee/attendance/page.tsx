export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { SalesAttendance } from "@/models/sales/SalesAttendance";
import { checkInSalesAttendance, checkOutSalesAttendance } from "@/actions/sales/attendance";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsBadge, OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { SALES_ATTENDANCE_STATUS_LABELS } from "@/lib/sales/constants";
import { formatDate, formatDateTime } from "@/lib/utils";

export default async function SalesAttendancePage() {
  const staff = await requireSalesPage("workforce.attendance_sync");
  const today = new Date().toISOString().slice(0, 10);
  const [todayRecord, history] = await Promise.all([
    SalesAttendance.findOne({ employeeId: staff.employeeId, date: today }).lean(),
    SalesAttendance.find({ employeeId: staff.employeeId }).sort({ date: -1 }).limit(30).lean(),
  ]);

  return (
    <OsPage
      title="Attendance"
      subtitle="Self check-in/out for now — connect an HR/biometric system to automate this without changing anything downstream."
    >
      <section className="mb-6 rounded-xl border border-[var(--dash-border)] bg-white p-5">
        <h2 className="mb-3 font-inter text-[15px] font-semibold tracking-[-0.01em] text-[#111111]">
          Today
        </h2>
        <p className="mb-4 font-inter text-sm text-[#6b7280]">
          {todayRecord?.checkInAt
            ? `Checked in ${formatDateTime(todayRecord.checkInAt)}`
            : "Not checked in yet."}
          {todayRecord?.checkOutAt
            ? ` · Checked out ${formatDateTime(todayRecord.checkOutAt)}`
            : ""}
        </p>
        <div className="flex flex-wrap gap-3">
          <OsActionForm action={checkInSalesAttendance} submitLabel="Check in" showSubmit className="inline">
            {null}
          </OsActionForm>
          <OsActionForm action={checkOutSalesAttendance} submitLabel="Check out" showSubmit className="inline">
            {null}
          </OsActionForm>
        </div>
      </section>

      <OsTable>
        <thead>
          <tr><Th>Date</Th><Th>Status</Th><Th>Check in</Th><Th>Check out</Th></tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={String(h._id)}>
              <Td>{formatDate(h.date)}</Td>
              <Td><OsBadge tone={h.status === "present" ? "ok" : h.status === "absent" ? "bad" : "warn"}>{SALES_ATTENDANCE_STATUS_LABELS[h.status as keyof typeof SALES_ATTENDANCE_STATUS_LABELS]}</OsBadge></Td>
              <Td>{h.checkInAt ? formatDateTime(h.checkInAt) : "—"}</Td>
              <Td>{h.checkOutAt ? formatDateTime(h.checkOutAt) : "—"}</Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {history.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No attendance history yet.</p> : null}
    </OsPage>
  );
}
