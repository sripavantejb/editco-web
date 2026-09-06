"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  Building2,
  Phone,
  ListTodo,
  FileText,
  TrendingUp,
  Activity,
  BarChart3,
  FileBarChart,
  Settings,
  Search,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { logoutSalesEmployee } from "@/actions/auth";
import { SALES_MODULE_GROUPS, salesModulesByGroup, type SalesModuleKey } from "@/lib/sales/modules";
import { SALES_ADMIN_ONLY_MODULE_SET } from "@/lib/sales/portal";
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

const GROUP_ORDER: (typeof SALES_MODULE_GROUPS)[number][] = [
  "Dashboard",
  "Leads",
  "Sales",
  "Customers",
  "Communication",
  "Tasks & Calendar",
  "Documents",
  "Performance",
  "Workforce",
  "Administration",
];

function isHrefActive(href: string, pathname: string) {
  if (href === "/sales/employee") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

const GROUP_ICONS: Record<(typeof SALES_MODULE_GROUPS)[number], LucideIcon> = {
  Dashboard: LayoutDashboard,
  Leads: Users,
  Sales: Kanban,
  Customers: Building2,
  Communication: Phone,
  Documents: FileText,
  Performance: TrendingUp,
  Workforce: Activity,
  "Tasks & Calendar": ListTodo,
  Analytics: BarChart3,
  Reports: FileBarChart,
  Administration: Settings,
};

function SidebarBody({
  name,
  email,
  pathname,
  sections,
  collapsed,
  onNavigate,
  onOpenSearch,
}: {
  name: string;
  email: string;
  pathname: string;
  sections: { group: (typeof SALES_MODULE_GROUPS)[number]; items: ReturnType<typeof salesModulesByGroup> }[];
  collapsed?: boolean;
  onNavigate?: () => void;
  onOpenSearch: () => void;
}) {
  const profileEmail = email || name;

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex items-center gap-2 border-b border-[var(--dash-border)] px-3 py-3.5",
          collapsed && "flex-col gap-2 px-2"
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#111111] text-white">
          <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />
        </span>
        {!collapsed ? (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate font-inter text-sm font-semibold text-[#111111]">Editco Sales</p>
              <p className="truncate font-inter text-xs text-[#6b7280]">Employee</p>
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
                roleLabel="Employee"
                logoutAction={logoutSalesEmployee}
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
              roleLabel="Employee"
              logoutAction={logoutSalesEmployee}
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
          {sections.map((section) => {
            const Icon = GROUP_ICONS[section.group];
            return (
              <div key={section.group}>
                {!collapsed ? (
                  <p className="mb-1.5 px-2.5 font-inter text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4b5563]">
                    {section.group}
                  </p>
                ) : (
                  <div className="mx-auto mb-1.5 h-px w-6 bg-[#e5e7eb]" aria-hidden />
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const href = item.employeeRoutes[0];
                    const active = isHrefActive(href, pathname);
                    return (
                      <Link
                        key={item.key}
                        href={href}
                        prefetch
                        onClick={onNavigate}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 py-2 font-inter text-[13px] font-medium transition-colors",
                          collapsed && "justify-center px-0",
                          active
                            ? "bg-[#f5f5f5] text-[#111111]"
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
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function SalesEmployeeSidebar({
  name,
  email,
  effective,
}: {
  name: string;
  email?: string;
  effective: Record<SalesModuleKey, boolean>;
}) {
  const pathname = usePathname() || "";
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const profileEmail = email || name;
  const { collapsed } = usePortalSidebarCollapse();

  const sections = useMemo(
    () =>
      GROUP_ORDER.map((group) => ({
        group,
        items: salesModulesByGroup(group).filter(
          (m) =>
            effective[m.key] &&
            m.employeeRoutes.length > 0 &&
            !SALES_ADMIN_ONLY_MODULE_SET.has(m.key)
        ),
      })).filter((s) => s.items.length > 0),
    [effective]
  );

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
      sections.flatMap((s) =>
        s.items.map((item) => ({
          href: item.employeeRoutes[0],
          label: item.label,
          section: s.group,
        }))
      ),
    [sections]
  );
  const prefetchHrefs = useMemo(() => navItems.map((item) => item.href), [navItems]);

  const currentLabel =
    navItems.find((i) => isHrefActive(i.href, pathname))?.label || "Employee";

  return (
    <>
      <PortalNavProgress />
      <PrefetchNavRoutes hrefs={prefetchHrefs} />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-[var(--dash-border)] bg-white transition-[width] duration-200 ease-out lg:block",
          portalSidebarWidthClass(collapsed)
        )}
      >
        <SidebarBody
          name={name}
          email={profileEmail}
          pathname={pathname}
          sections={sections}
          collapsed={collapsed}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <SidebarCollapseToggle />
      </aside>

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
            Employee
          </p>
          <p className="truncate font-inter text-sm font-semibold text-[#111111]">{currentLabel}</p>
        </div>
        <button
          type="button"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--dash-border)] text-[#6b7280]"
        >
          <Search className="h-4 w-4" />
        </button>
        <PortalProfileMenu
          email={profileEmail}
          roleLabel="Employee"
          logoutAction={logoutSalesEmployee}
        />
      </header>

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
              name={name}
              email={profileEmail}
              pathname={pathname}
              sections={sections}
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
        placeholder="Search your workspace…"
      />
    </>
  );
}
