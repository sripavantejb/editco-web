"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Globe,
  Kanban,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Sparkles,
  User,
  Users,
  Wallet,
} from "lucide-react";

type Props = {
  email: string;
  roleLabel?: string;
  logoutAction: () => Promise<void>;
  showWorkspaces?: boolean;
};

const WORKSPACE_LINKS = [
  {
    href: "/admin/os",
    label: "Admin OS",
    badge: "Operations",
    icon: LayoutDashboard,
    match: (p: string) => p.startsWith("/admin/os"),
  },
  {
    href: "/sales/admin",
    label: "Sales Admin",
    badge: "CRM Admin",
    icon: Building2,
    match: (p: string) => p.startsWith("/sales/admin"),
  },
  {
    href: "/sales/employee",
    label: "Sales Workspace",
    badge: "Employee",
    icon: Users,
    match: (p: string) => p.startsWith("/sales/employee"),
  },
  {
    href: "/admin",
    label: "Super Admin",
    badge: "Growth & EGA",
    icon: Sparkles,
    match: (p: string) =>
      p === "/admin" ||
      p.startsWith("/admin/rewards") ||
      p.startsWith("/admin/jobs") ||
      p.startsWith("/admin/applications") ||
      p.startsWith("/admin/ega") ||
      p.startsWith("/admin/referrals"),
  },
  {
    href: "/track",
    label: "Client Tracker",
    badge: "Live Portal",
    icon: PackageSearch,
    match: (p: string) => p.startsWith("/track"),
  },
];

export function PortalProfileMenu({
  email,
  roleLabel,
  logoutAction,
  showWorkspaces = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() || "";
  const initial = (email?.[0] || "A").toUpperCase();

  useEffect(() => {
    if (!open) return;

    const updatePos = () => {
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const popoverWidth = Math.min(288, window.innerWidth - 24);
      
      let left = rect.left;
      // If opened from right side (like mobile header or right-aligned controls)
      if (left + popoverWidth > window.innerWidth - 12) {
        left = window.innerWidth - popoverWidth - 12;
      }
      // Ensure it never goes off the left edge of the screen
      if (left < 12) {
        left = 12;
      }

      let top = rect.bottom + 8;
      // If it would overflow the bottom of the screen
      if (top + 400 > window.innerHeight) {
        top = Math.max(12, rect.top - 410);
      }

      setPopoverPos({ top, left });
    };

    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);

    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={rootRef}>
      <button
        type="button"
        aria-label="Profile and Workspace Switcher"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] font-inter text-[11px] font-semibold text-white shadow-sm ring-2 ring-transparent transition hover:ring-[#c8f542]/50 hover:bg-[#222222]"
      >
        {initial}
      </button>
      {open && popoverPos ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "fixed",
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
              width: "288px",
              maxWidth: "calc(100vw - 24px)",
            }}
            className="z-50 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)] animate-in fade-in zoom-in-95 duration-150"
          >
            {/* User Profile Header */}
            <div className="border-b border-[#f0f0f0] bg-[#fafafa] p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111111] font-inter text-xs font-bold text-white shadow-sm">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-inter text-[12px] font-bold text-[#111111]">{email}</p>
                  {roleLabel ? (
                    <span className="mt-0.5 inline-block rounded-full bg-[#e5e7eb] px-2 py-0.5 font-inter text-[10px] font-semibold text-[#374151]">
                      {roleLabel}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Workspace Switcher */}
            {showWorkspaces ? (
              <div className="p-2">
                <p className="px-2 pb-1.5 pt-1 font-archivo text-[10px] font-bold uppercase tracking-[0.12em] text-[#9ca3af]">
                  Workspaces & Portals
                </p>
                <div className="space-y-0.5">
                  {WORKSPACE_LINKS.map((ws) => {
                    const Icon = ws.icon;
                    const isCurrent = ws.match(pathname);
                    return (
                      <Link
                        key={ws.href}
                        href={ws.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 font-inter text-[12px] transition-colors ${
                          isCurrent
                            ? "bg-[#111111] text-white font-semibold shadow-sm"
                            : "text-[#374151] hover:bg-[#f3f4f6] hover:text-[#111111]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 shrink-0 ${isCurrent ? "text-[#c8f542]" : "text-[#6b7280]"}`} />
                          <span>{ws.label}</span>
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            isCurrent
                              ? "text-[#c8f542]"
                              : "text-[#9ca3af]"
                          }`}
                        >
                          {ws.badge}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Quick Utility Links */}
            <div className="border-t border-[#f0f0f0] p-1.5">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl px-2.5 py-1.5 font-inter text-[12px] text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111111]"
              >
                <span className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-[#9ca3af]" />
                  <span>Visit Main Website</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#9ca3af]" />
              </a>
            </div>

            {/* Logout Action */}
            <div className="border-t border-[#f0f0f0] p-1.5 bg-[#fafafa]">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 font-inter text-[12px] font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
