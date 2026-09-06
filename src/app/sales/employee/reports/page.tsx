export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function LegacyEmployeeReportsRedirect() {
  redirect("/sales/admin/reports");
}
