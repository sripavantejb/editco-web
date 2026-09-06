"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/referral/AdminSidebar";
import {
  PortalSidebarCollapseProvider,
  portalMainPadClass,
  usePortalSidebarCollapse,
} from "@/components/portal/PortalSidebarCollapse";

function AdminShellInner({
  email,
  role,
  permissions,
  children,
}: {
  email: string;
  role?: import("@/lib/os/constants").StaffRole;
  permissions?: string[];
  children: React.ReactNode;
}) {
  const { collapsed } = usePortalSidebarCollapse();

  return (
    <>
      <Suspense fallback={null}>
        <AdminSidebar email={email} role={role} permissions={permissions} />
      </Suspense>
      <div className={`transition-[padding] duration-200 ease-out ${portalMainPadClass(collapsed)}`}>
        {children}
      </div>
    </>
  );
}

/** Instant shell — no Framer Motion page lag on every navigation. */
export function AdminShell({
  email,
  role,
  permissions,
  children,
}: {
  email: string | null;
  role?: import("@/lib/os/constants").StaffRole;
  permissions?: string[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin =
    pathname?.startsWith("/admin/login") || pathname?.startsWith("/admin/sales");
  const showNav = Boolean(email) && !isLogin;

  return (
    <div className="admin-theme min-h-screen">
      {showNav && email ? (
        <PortalSidebarCollapseProvider>
          <AdminShellInner email={email} role={role} permissions={permissions}>
            {children}
          </AdminShellInner>
        </PortalSidebarCollapseProvider>
      ) : (
        children
      )}
    </div>
  );
}
