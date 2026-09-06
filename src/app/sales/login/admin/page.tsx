export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

/** Old URL — Sales Admin login now lives at /admin/sales. */
export default async function LegacySalesAdminLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ? `?next=${encodeURIComponent(params.next)}` : "";
  redirect(`/admin/sales${next}`);
}
