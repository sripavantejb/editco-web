export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function LegacyEmployeeAnalyticsRedirect() {
  redirect("/sales/admin/analytics/conversion");
}
