"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AdminSidebar } from "@/components/referral/AdminSidebar";

export function AdminShell({
  email,
  egaOnly = false,
  showMainAdmin = false,
  theme = "admin",
  children,
}: {
  email: string | null;
  egaOnly?: boolean;
  showMainAdmin?: boolean;
  theme?: "admin" | "ega";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname?.startsWith("/admin/login");
  const showNav = Boolean(email) && !isLogin;
  const themeClass = theme === "ega" ? "admin-ega-theme" : "admin-theme";

  return (
    <div className={`${themeClass} min-h-screen`}>
      {showNav && email ? (
        <>
          <AdminSidebar
            email={email}
            egaOnly={egaOnly}
            showMainAdmin={showMainAdmin}
          />
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
