"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AdminSidebar } from "@/components/referral/AdminSidebar";

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
  const isLogin = pathname?.startsWith("/admin/login");
  const showNav = Boolean(email) && !isLogin;

  return (
    <div className="admin-theme min-h-screen">
      {showNav && email ? (
        <>
          <Suspense fallback={null}>
            <AdminSidebar email={email} role={role} permissions={permissions} />
          </Suspense>
          <div className="lg:pl-[260px]">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </div>
        </>
      ) : (
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
