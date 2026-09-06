export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function LegacyEmployeeActivityRedirect() {
  redirect("/sales/admin/activity");
}
