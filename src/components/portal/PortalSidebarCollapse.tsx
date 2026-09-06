"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "editco-portal-sidebar-collapsed";

type Ctx = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
};

const PortalSidebarCollapseContext = createContext<Ctx | null>(null);

export function PortalSidebarCollapseProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setCollapsedState(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <PortalSidebarCollapseContext.Provider value={{ collapsed: ready ? collapsed : false, toggle, setCollapsed }}>
      {children}
    </PortalSidebarCollapseContext.Provider>
  );
}

export function usePortalSidebarCollapse() {
  const ctx = useContext(PortalSidebarCollapseContext);
  if (!ctx) {
    return {
      collapsed: false,
      toggle: () => undefined,
      setCollapsed: () => undefined,
    };
  }
  return ctx;
}

/** HRMS-style circular chevron on the sidebar edge. */
export function SidebarCollapseToggle({ className }: { className?: string }) {
  const { collapsed, toggle } = usePortalSidebarCollapse();

  return (
    <button
      type="button"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      onClick={toggle}
      className={cn(
        "absolute top-[52px] -right-3 z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] shadow-sm transition hover:border-[#111111] hover:text-[#111111] lg:inline-flex",
        className
      )}
    >
      {collapsed ? (
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
      ) : (
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.25} />
      )}
    </button>
  );
}

export function portalSidebarWidthClass(collapsed: boolean) {
  return collapsed ? "w-[72px]" : "w-[260px]";
}

export function portalMainPadClass(collapsed: boolean) {
  return collapsed ? "lg:pl-[72px]" : "lg:pl-[260px]";
}
