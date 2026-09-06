export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

/**
 * Public entry for sales staff from the site hamburger.
 * Admins use direct URLs (/sales/login/admin, /admin/login) — not listed here.
 */
export default function SalesLoginChooserPage() {
  redirect("/sales/login/employee");
}
