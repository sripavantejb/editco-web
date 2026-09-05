export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { getSalesLandingPath } from "@/lib/sales/page";

export default async function SalesRootPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login?next=/sales");
  redirect((await getSalesLandingPath(session.email)) || "/admin/login?next=/sales");
}
