"use client";

import { Suspense, type ReactNode } from "react";
import {
  PortalSidebarCollapseProvider,
  portalMainPadClass,
  usePortalSidebarCollapse,
} from "@/components/portal/PortalSidebarCollapse";

function SalesShellInner({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  const { collapsed } = usePortalSidebarCollapse();

  return (
    <>
      <Suspense fallback={null}>{sidebar}</Suspense>
      <div className={`transition-[padding] duration-200 ease-out ${portalMainPadClass(collapsed)}`}>
        {children}
      </div>
    </>
  );
}

/** Instant shell — no Framer Motion page lag on every navigation. */
export function SalesShell({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return (
    <div className="admin-theme min-h-screen">
      <PortalSidebarCollapseProvider>
        <SalesShellInner sidebar={sidebar}>{children}</SalesShellInner>
      </PortalSidebarCollapseProvider>
    </div>
  );
}
