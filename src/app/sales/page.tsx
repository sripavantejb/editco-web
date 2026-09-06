export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { getStaffLandingPath } from "@/lib/sales/page";

export default async function SalesRootPage() {
  const session = await getAdminSession();
  if (!session) redirect("/sales/login");
  redirect(await getStaffLandingPath(session.email));
}
