export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import {
  clientPortalPath,
  resolvePortalByToken,
} from "@/lib/os/resolve-portal";

/** Legacy magic-token URLs → stable `/client-portal/{conversionUuid}`. */
export default async function LegacyClientPortalRedirect({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const portal = await resolvePortalByToken(token);
  if (!portal) notFound();
  redirect(clientPortalPath(portal.conversion.conversionUuid));
}
