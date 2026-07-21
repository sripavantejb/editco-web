"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AdminNav } from "@/components/referral/AdminNav";

export function AdminShell({
  email,
  children,
}: {
  email: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname?.startsWith("/admin/login");
  const showNav = Boolean(email) && !isLogin;

  return (
    <div className="admin-theme min-h-screen">
      {showNav && email && <AdminNav email={email} />}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
