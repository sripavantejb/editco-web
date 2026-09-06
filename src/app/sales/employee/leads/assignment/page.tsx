export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function LegacyEmployeeLeadAssignmentRedirect() {
  redirect("/sales/admin/leads/assignment");
}
