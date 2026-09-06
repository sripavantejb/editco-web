export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { getStaffLandingPath } from "@/lib/sales/page";
import { PortalLoginForm } from "@/components/portal/PortalLoginForm";

export default async function SalesAdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const session = await getAdminSession();
  if (session) {
    redirect(
      await getStaffLandingPath(session.email, {
        portal: "sales_admin",
        next: params.next,
      })
    );
  }

  return (
    <main className="admin-theme flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111111] font-inter text-sm font-semibold text-white">
            EC
          </span>
          <div>
            <p className="font-inter text-sm font-semibold text-[#111111]">Editco Sales</p>
            <p className="font-inter text-xs text-[#6b7280]">Admin portal</p>
          </div>
        </div>

        <h1 className="font-inter text-3xl font-semibold tracking-tight text-[#111111]">
          Sales Admin sign in
        </h1>
        <p className="mt-2 font-inter text-sm text-[#6b7280]">
          For sales managers and admins only — not for employees.
        </p>

        <div className="mt-8 rounded-xl border border-[#e5e7eb] bg-white p-6">
          <PortalLoginForm
            portal="sales_admin"
            next={params.next}
            submitLabel="Sign in to Sales Admin"
          />
        </div>
      </div>
    </main>
  );
}
