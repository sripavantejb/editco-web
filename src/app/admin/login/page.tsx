export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { getStaffLandingPath } from "@/lib/sales/page";
import { PortalLoginForm } from "@/components/portal/PortalLoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const session = await getAdminSession();
  if (session) {
    redirect(await getStaffLandingPath(session.email, { portal: "os", next: params.next }));
  }

  return (
    <main className="admin-theme flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111111] font-inter text-sm font-semibold text-white">
            EC
          </span>
          <div>
            <p className="font-inter text-sm font-semibold text-[#111111]">Editco</p>
            <p className="font-inter text-xs text-[#6b7280]">Super Admin</p>
          </div>
        </div>

        <h1 className="font-inter text-3xl font-semibold tracking-tight text-[#111111]">
          Platform sign in
        </h1>
        <p className="mt-2 font-inter text-sm text-[#6b7280]">
          Super Admin access only — not for sales staff.
        </p>

        <div className="mt-8 rounded-xl border border-[#e5e7eb] bg-white p-6">
          <PortalLoginForm portal="os" next={params.next} submitLabel="Sign in" />
        </div>
      </div>
    </main>
  );
}
