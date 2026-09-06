"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { logoutAdmin } from "@/actions/auth";
import {
  LayoutDashboard,
  Wallet,
  Briefcase,
  Inbox,
  Menu,
  X,
  Users,
  ListChecks,
  Search,
  Store,
} from "lucide-react";
import { osNavSections, type OsNavItem, type OsNavSection } from "@/lib/os/nav";
import { canAccessLegacyAdmin, hasPermission } from "@/lib/os/permissions";
import type { StaffRole } from "@/lib/os/constants";
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
  icon: typeof LayoutDashboard;
  match: (pathname: string, isEgaTab: boolean, search: string) => boolean;
};

type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

const growthSection: NavSection = {
  id: "growth",
  label: "Growth",
  items: [
    {
      href: "/admin",
      label: "Refer & Earn",
      icon: LayoutDashboard,
      match: (p) => p === "/admin" || p.startsWith("/admin/referrals"),
    },
    {
      href: "/admin/rewards",
      label: "Rewards",
      icon: Wallet,
      match: (p) => p.startsWith("/admin/rewards"),
    },
    {
      href: "/admin/jobs",
      label: "Jobs",
      icon: Briefcase,
      match: (p) => p.startsWith("/admin/jobs") && !p.includes("/applications"),
    },
    {
      href: "/admin/applications",
      label: "Applications",
      icon: Inbox,
      match: (p) =>
        p.startsWith("/admin/applications") ||
        (p.startsWith("/admin/jobs") && p.includes("/applications")),
    },
    {
      href: "/admin/ega",
      label: "EGA",
      icon: Users,
      match: (p) =>
        (p.startsWith("/admin/ega") && !p.startsWith("/admin/ega/form")) ||
        p.startsWith("/admin-ega"),
    },
    {
      href: "/admin/ega/form",
      label: "EGA form",
      icon: ListChecks,
      match: (p) => p.startsWith("/admin/ega/form"),
    },
  ],
};

function mapOsItem(item: OsNavItem): NavItem {
  return {
    href: item.href,
    label: item.label,
    icon: item.icon,
    match: (p, _ega, search) => {
      if (item.href.includes("?filter=")) {
        const filter = item.href.split("filter=")[1];
        return (
          p === "/admin/os/projects" &&
          new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get(
            "filter"
          ) === filter
        );
      }
      if (item.href === "/admin/os/projects") {
        const filter = new URLSearchParams(
          search.startsWith("?") ? search.slice(1) : search
        ).get("filter");
        if (filter) return p.startsWith("/admin/os/projects/");
        return p === "/admin/os/projects" || p.startsWith("/admin/os/projects/");
      }
      return item.match(p);
    },
  };
}

function buildSections(permissions: string[], role?: StaffRole): NavSection[] {
  const os: NavSection[] = osNavSections
    .map((section: OsNavSection) => ({
      id: section.id,
      label: section.label,
      items: section.items
        .filter((item) => hasPermission(permissions, item.permission))
        .map(mapOsItem),
    }))
    .filter((s) => s.items.length > 0);

  if (role && canAccessLegacyAdmin(role)) return [...os, growthSection];
  if (!role) return [...os, growthSection];
  return os.length ? os : [growthSection];
}

const LOGO_SRC =
  "https://res.cloudinary.com/dxeoibunj/image/upload/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png";

function NavLink({
  item,
  pathname,
  isEgaTab,
  search,
  onNavigate,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  isEgaTab: boolean;
  search: string;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const active = item.match(pathname, isEgaTab, search);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
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
}

function SidebarBody({
  email,
  pathname,
  isEgaTab,
  search,
  sections,
  onNavigate,
  showSearch,
  showSalesAdminJump,
  onOpenSearch,
  collapsed,
}: {
  email: string;
  pathname: string;
  isEgaTab: boolean;
  search: string;
  sections: NavSection[];
  onNavigate?: () => void;
  showSearch: boolean;
  showSalesAdminJump?: boolean;
  onOpenSearch?: () => void;
  collapsed?: boolean;
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div
        className={cn(
          "flex items-center gap-2 border-b border-[var(--dash-border)] px-3 py-3.5",
          collapsed && "flex-col gap-2 px-2"
        )}
      >
        <a
          href="https://editcomedia.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Editco Media"
          onClick={onNavigate}
          className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#111111]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="Editco" className="h-5 w-5 object-contain brightness-0 invert" />
        </a>
        {!collapsed ? (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate font-inter text-sm font-semibold text-[#111111]">Editco</p>
              <p className="truncate font-inter text-xs text-[#6b7280]">Super Admin</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {showSearch ? (
                <button
                  type="button"
                  aria-label="Search"
                  onClick={onOpenSearch}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#f5f5f5] hover:text-[#111111]"
                >
                  <Search className="h-4 w-4" />
                </button>
              ) : null}
              {showSalesAdminJump ? (
                <Link
                  href="/sales/admin"
                  prefetch
                  onClick={onNavigate}
                  aria-label="Sales Admin"
                  title="Sales Admin"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#f5f5f5] hover:text-[#111111]"
                >
                  <Store className="h-4 w-4" />
                </Link>
              ) : null}
              <PortalProfileMenu
                email={email}
                roleLabel="Super Admin"
                logoutAction={logoutAdmin}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1">
            {showSearch ? (
              <button
                type="button"
                aria-label="Search"
                onClick={onOpenSearch}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#f5f5f5] hover:text-[#111111]"
              >
                <Search className="h-4 w-4" />
              </button>
            ) : null}
            {showSalesAdminJump ? (
              <Link
                href="/sales/admin"
                prefetch
                onClick={onNavigate}
                aria-label="Sales Admin"
                title="Sales Admin"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#f5f5f5] hover:text-[#111111]"
              >
                <Store className="h-4 w-4" />
              </Link>
            ) : null}
            <PortalProfileMenu email={email} roleLabel="Super Admin" logoutAction={logoutAdmin} />
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
          {sections.map((section) => (
            <div key={section.id}>
              {!collapsed ? (
                <p className="mb-1.5 px-2.5 font-inter text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4b5563]">
                  {section.label}
                </p>
              ) : (
                <div className="mx-auto mb-1.5 h-px w-6 bg-[#e5e7eb]" aria-hidden />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    isEgaTab={isEgaTab}
                    search={search}
                    onNavigate={onNavigate}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function AdminSidebar({
  email,
  role,
  permissions = ["*"],
}: {
  email: string;
  role?: StaffRole;
  permissions?: string[];
}) {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const isEgaTab = searchParams.get("tab") === "ega";
  const search = searchParams.toString();
  const sections = useMemo(
    () => buildSections(permissions, role),
    [permissions, role]
  );
  const prefetchHrefs = useMemo(
    () => sections.flatMap((s) => s.items.map((item) => item.href)),
    [sections]
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { collapsed } = usePortalSidebarCollapse();

  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
  }, [pathname, isEgaTab]);

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

  const currentLabel =
    sections
      .flatMap((s) => s.items)
      .find((i) => i.match(pathname, isEgaTab, search))?.label || "Admin";

  const showSearch = hasPermission(permissions, "search:read");
  const showSalesAdminJump = role === "super_admin";
  const navItems: NavSearchItem[] = useMemo(
    () =>
      sections.flatMap((s) =>
        s.items.map((item) => ({
          href: item.href,
          label: item.label,
          section: s.label,
        }))
      ),
    [sections]
  );

  const bodyProps = {
    email,
    pathname,
    isEgaTab,
    search,
    sections,
    showSearch,
    showSalesAdminJump,
    onOpenSearch: () => setSearchOpen(true),
    collapsed: false as boolean,
  };

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
        <SidebarBody {...bodyProps} collapsed={collapsed} />
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
            Super Admin
          </p>
          <p className="truncate font-inter text-sm font-semibold text-[#111111]">
            {currentLabel}
          </p>
        </div>
        {showSearch ? (
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--dash-border)] text-[#6b7280]"
          >
            <Search className="h-4 w-4" />
          </button>
        ) : null}
        {showSalesAdminJump ? (
          <Link
            href="/sales/admin"
            prefetch
            aria-label="Sales Admin"
            title="Sales Admin"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--dash-border)] text-[#6b7280]"
          >
            <Store className="h-4 w-4" />
          </Link>
        ) : null}
        <PortalProfileMenu email={email} roleLabel="Super Admin" logoutAction={logoutAdmin} />
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
            <SidebarBody {...bodyProps} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </>
      ) : null}

      <PortalSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        navItems={navItems}
        enableOsSearch={showSearch}
        placeholder="Search pages, EC codes, clients, invoicesâ€¦"
      />
    </>
  );
}
