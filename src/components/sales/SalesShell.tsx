"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function SalesShell({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="admin-theme min-h-screen">
      <Suspense fallback={null}>{sidebar}</Suspense>
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
    </div>
  );
}
