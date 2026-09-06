export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function LegacyEmployeeLiveStatusRedirect() {
  redirect("/sales/admin/live-status");
}
