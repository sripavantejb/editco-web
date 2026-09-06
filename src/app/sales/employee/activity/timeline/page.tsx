export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function LegacyEmployeeActivityTimelineRedirect() {
  redirect("/sales/admin/activity/timeline");
}
