"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Contact,
  Target,
  CheckCircle2,
  MapPin,
  ScrollText,
  ListTodo,
  Activity,
  BarChart3,
  FileBarChart,
  Radio,
  ClipboardList,
  UserPlus,
  Search,
  Menu,
  X,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { logoutSalesAdmin } from "@/actions/auth";
import { PortalProfileMenu } from "@/components/portal/PortalProfileMenu";
import { PortalSearchDialog, type NavSearchItem } from "@/components/portal/PortalSearchDialog";
import { PortalNavProgress } from "@/components/portal/PortalNavProgress";
import { PrefetchNavRoutes } from "@/components/portal/PrefetchNavRoutes";
import {
  SidebarCollapseToggle,
  portalSidebarWidthClass,
  usePortalSidebarCollapse,
} from "@/components/portal/PortalSidebarCollapse";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (p: string) => boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/sales/admin", label: "Dashboard", icon: LayoutDashboard, match: (p) => p === "/sales/admin" },
      { href: "/sales/admin/leads", label: "All Leads", icon: Contact, match: (p) => p.startsWith("/sales/admin/leads") && !p.includes("/assignment") },
      { href: "/sales/admin/leads/assignment", label: "Lead Assignment", icon: UserPlus, match: (p) => p.startsWith("/sales/admin/leads/assignment") },
    ],
  },
  {
    label: "Team",
    items: [
      { href: "/sales/admin/team", label: "Employees", icon: Users, match: (p) => p.startsWith("/sales/admin/team") && !p.includes("/access") },
      { href: "/sales/admin/tasks", label: "Tasks", icon: ListTodo, match: (p) => p.startsWith("/sales/admin/tasks") },
      { href: "/sales/admin/targets", label: "Targets", icon: Target, match: (p) => p.startsWith("/sales/admin/targets") },
      { href: "/sales/admin/approvals", label: "Approvals", icon: CheckCircle2, match: (p) => p.startsWith("/sales/admin/approvals") },
    ],
  },
  {
    label: "Growth & EGA",
    items: [
      {
        href: "/admin/ega",
        label: "EGA Applications",
        icon: Users,
        match: (p) =>
          (p.startsWith("/admin/ega") && !p.startsWith("/admin/ega/form")) ||
          p.startsWith("/admin-ega") ||
          p.startsWith("/sales/admin/ega"),
      },
      {
        href: "/admin/ega/form",
        label: "EGA Form Builder",
        icon: ListChecks,
        match: (p) => p.startsWith("/admin/ega/form"),
      },
    ],
  },
  {
    label: "Workforce",
    items: [
      { href: "/sales/admin/attendance/dashboard", label: "Attendance", icon: ClipboardList, match: (p) => p.startsWith("/sales/admin/attendance") },
      { href: "/sales/admin/live-status", label: "Live Tracking", icon: Radio, match: (p) => p.startsWith("/sales/admin/live-status") },
      { href: "/sales/admin/activity", label: "Activity", icon: Activity, match: (p) => p.startsWith("/sales/admin/activity") },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/sales/admin/analytics/revenue", label: "Analytics", icon: BarChart3, match: (p) => p.startsWith("/sales/admin/analytics") },
      { href: "/sales/admin/reports", label: "Reports", icon: FileBarChart, match: (p) => p.startsWith("/sales/admin/reports") },
      { href: "/sales/admin/territories", label: "Territories", icon: MapPin, match: (p) => p.startsWith("/sales/admin/territories") },
      { href: "/sales/admin/audit-logs", label: "Audit Logs", icon: ScrollText, match: (p) => p.startsWith("/sales/admin/audit-logs") },
    ],
  },
  {
    label: "Workspaces",
    items: [
      { href: "/admin/os", label: "Admin OS Hub", icon: LayoutDashboard, match: (p) => p.startsWith("/admin/os") && !p.startsWith("/admin/os/editco") },
      { href: "/admin/os/editco", label: "Master Tracker", icon: ScrollText, match: (p) => p.startsWith("/admin/os/editco") },
      { href: "/admin", label: "Super Admin", icon: Target, match: (p) => p === "/admin" || p.startsWith("/admin/rewards") || p.startsWith("/admin/jobs") || p.startsWith("/admin/applications") || p.startsWith("/admin/referrals") },
      { href: "/track", label: "Client Tracker", icon: CheckCircle2, match: (p) => p.startsWith("/track") },
    ],
  },
];

function SidebarBody({
  pathname,
  collapsed,
  profileEmail,
  onNavigate,
  onOpenSearch,
}: {
  pathname: string;
  collapsed?: boolean;
  profileEmail: string;
  onNavigate?: () => void;
  onOpenSearch: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div
        className={cn(
          "flex items-center gap-2 border-b border-[var(--dash-border)] px-3 py-3.5",
          collapsed && "flex-col gap-2 px-2"
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#111111] text-white">
          <UserCog className="h-4 w-4" strokeWidth={1.75} />
        </span>
        {!collapsed ? (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate font-inter text-sm font-semibold text-[#111111]">Editco Sales</p>
              <p className="truncate font-inter text-xs text-[#6b7280]">Admin</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label="Search"
                onClick={onOpenSearch}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#f5f5f5] hover:text-[#111111]"
              >
                <Search className="h-4 w-4" />
              </button>
              <PortalProfileMenu
                email={profileEmail}
                roleLabel="Sales Admin"
                logoutAction={logoutSalesAdmin}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              aria-label="Search"
              onClick={onOpenSearch}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#f5f5f5] hover:text-[#111111]"
            >
              <Search className="h-4 w-4" />
            </button>
            <PortalProfileMenu
              email={profileEmail}
              roleLabel="Sales Admin"
              logoutAction={logoutSalesAdmin}
            />
          </div>
        )}
      </div>

      <nav
        className={cn(
          "flex-1 overflow-y-auto overscroll-contain py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          collapsed ? "px-1.5" : "px-3"
        )}
      >
        <div className="space-y-5">
          {SECTIONS.map((section) => (
            <div key={section.label}>
              {!collapsed ? (
                <p className="mb-1.5 px-2.5 font-inter text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4b5563]">
                  {section.label}
                </p>
              ) : (
                <div className="mx-auto mb-1.5 h-px w-6 bg-[#e5e7eb]" aria-hidden />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.match(pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 py-2 font-inter text-[13px] font-medium transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-[#f5f5f5] text-[#111111] font-semibold"
                          : "text-[#6b7280] hover:bg-[#f5f5f5] hover:text-[#111111]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} />
                      {!collapsed ? item.label : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function SalesAdminSidebar({ name, email }: { name: string; email?: string }) {
  const pathname = usePathname() || "";
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const profileEmail = email || name;
  const { collapsed } = usePortalSidebarCollapse();

  useEffect(() => {
    setSearchOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const navItems: NavSearchItem[] = useMemo(
    () =>
      SECTIONS.flatMap((s) =>
        s.items.map((item) => ({ href: item.href, label: item.label, section: s.label }))
      ),
    []
  );
  const prefetchHrefs = useMemo(() => navItems.map((item) => item.href), [navItems]);

  const currentLabel =
    navItems.find((i) => i.href === pathname || (i.href !== "/sales/admin" && pathname.startsWith(i.href)))?.label || "Sales Admin";

  return (
    <>
      <PortalNavProgress />
      <PrefetchNavRoutes hrefs={prefetchHrefs} />
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-[var(--dash-border)] bg-white transition-[width] duration-200 ease-out lg:block",
          portalSidebarWidthClass(collapsed)
        )}
      >
        <SidebarBody
          pathname={pathname}
          collapsed={collapsed}
          profileEmail={profileEmail}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <SidebarCollapseToggle />
      </aside>

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[var(--dash-border)] bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
          onClick={() => setDrawerOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-white text-[#111111]"
        >
          {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-inter text-[10px] font-medium uppercase tracking-[0.12em] text-[#6b7280]">
            Sales Admin
          </p>
          <p className="truncate font-inter text-sm font-semibold text-[#111111]">
            {currentLabel}
          </p>
        </div>
        <button
          type="button"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--dash-border)] text-[#6b7280]"
        >
          <Search className="h-4 w-4" />
        </button>
        <PortalProfileMenu email={profileEmail} roleLabel="Sales Admin" logoutAction={logoutSalesAdmin} />
      </header>

      {/* Mobile Drawer */}
      {drawerOpen ? (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[min(280px,88vw)] border-r border-[var(--dash-border)] bg-white lg:hidden">
            <SidebarBody
              pathname={pathname}
              collapsed={false}
              profileEmail={profileEmail}
              onNavigate={() => setDrawerOpen(false)}
              onOpenSearch={() => {
                setDrawerOpen(false);
                setSearchOpen(true);
              }}
            />
          </aside>
        </>
      ) : null}

      <PortalSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        navItems={navItems}
        placeholder="Search sales admin pages…"
      />
    </>
  );
}
