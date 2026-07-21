export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

/** Referrals list is now part of Overview — keep this route for old links. */
export default function AdminReferralsRedirect() {
  redirect("/admin");
}
