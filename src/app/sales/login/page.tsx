export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

/** Hamburger “Staff” entry — employees only. Admins use /admin/login or /admin/sales. */
export default function SalesLoginChooserPage() {
  redirect("/sales/login/employee");
}
