export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function LegacyEmployeeAttendanceDashboardRedirect() {
  redirect("/sales/admin/attendance/dashboard");
}
