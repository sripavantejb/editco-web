"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { logoutAdmin } from "@/actions/auth";
import {
  LayoutDashboard,
  Wallet,
  LogOut,
  Briefcase,
  Inbox,
  Menu,
  X,
  Gift,
  Users,
  ChevronRight,
  ListChecks,
  Search,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { osNavSections, type OsNavItem, type OsNavSection } from "@/lib/os/nav";
import { canAccessLegacyAdmin, hasPermission } from "@/lib/os/permissions";
import type { StaffRole } from "@/lib/os/constants";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  match: (pathname: string, isEgaTab: boolean, search: string) => boolean;
};

type NavSection = {
  id: string;
  label: string;
  icon: typeof Gift;
  items: NavItem[];
};

const growthSection: NavSection = {
  id: "growth",
  label: "Growth",
  icon: Gift,
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
      match: (p) =>
        p.startsWith("/admin/jobs") && !p.includes("/applications"),
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
      // "All projects" must not light up when a filter query is active
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
      icon: section.icon,
      items: section.items
        .filter((item) => hasPermission(permissions, item.permission))
        .map(mapOsItem),
    }))
    .filter((s) => s.items.length > 0);

  if (role && canAccessLegacyAdmin(role)) {
    return [...os, growthSection];
  }
  if (!role) return [...os, growthSection];
  return os.length ? os : [growthSection];
}

const LOGO_SRC =
  "https://res.cloudinary.com/dxeoibunj/image/upload/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png";

function activeSectionId(
  sections: NavSection[],
  pathname: string,
  isEgaTab: boolean,
  search: string
) {
  return (
    sections.find((s) =>
      s.items.some((item) => item.match(pathname, isEgaTab, search))
    )?.id ?? null
  );
}

function NavLink({
  item,
  pathname,
  isEgaTab,
  search,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  isEgaTab: boolean;
  search: string;
  onNavigate?: () => void;
}) {
  const active = item.match(pathname, isEgaTab, search);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      prefetch
      onClick={onNavigate}
      className={`flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 py-2 font-inter text-[13px] font-medium transition-colors ${
        active
          ? "bg-[var(--dash-accent)] text-[var(--dash-on-accent)]"
          : "text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-85" strokeWidth={1.75} />
      {item.label}
    </Link>
  );
}

function SidebarBody({
  email,
  pathname,
  isEgaTab,
  search,
  sections,
  openId,
  onToggle,
  onNavigate,
  showSearch,
}: {
  email: string;
  pathname: string;
  isEgaTab: boolean;
  search: string;
  sections: NavSection[];
  openId: string | null;
  onToggle: (id: string) => void;
  onNavigate?: () => void;
  showSearch: boolean;
}) {
  const initial = (email?.[0] || "A").toUpperCase();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-[var(--dash-border)] px-4 py-3">
        <a
          href="https://editcomedia.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Editco Media"
          onClick={onNavigate}
          className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="Editco" className="h-5 w-5 object-contain" />
        </a>
        <div className="min-w-0">
          <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
            Admin
          </p>
          <p className="truncate font-inter text-xs text-[var(--dash-text)]">
            Editco panel
          </p>
        </div>
      </div>

      {showSearch ? (
        <form action="/admin/os/search" className="border-b border-[var(--dash-border)] px-3 py-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--dash-faint)]" />
            <input
              name="q"
              placeholder="EC-2026-… / company / invoice"
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-input)] pl-9 pr-3 font-inter text-xs text-[var(--dash-text)] placeholder:text-[var(--dash-faint)]"
            />
          </label>
        </form>
      ) : null}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => {
          const SectionIcon = section.icon;
          const sectionActive = section.items.some((item) =>
            item.match(pathname, isEgaTab, search)
          );

          if (section.items.length === 1) {
            return (
              <NavLink
                key={section.id}
                item={section.items[0]}
                pathname={pathname}
                isEgaTab={isEgaTab}
                search={search}
                onNavigate={onNavigate}
              />
            );
          }

          const expanded = openId === section.id;

          return (
            <div key={section.id}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => onToggle(section.id)}
                className={`flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  sectionActive && !expanded
                    ? "bg-[var(--dash-hover)]"
                    : "hover:bg-[var(--dash-hover)]"
                }`}
              >
                <SectionIcon
                  className="h-4 w-4 shrink-0 text-[var(--dash-accent)]"
                  strokeWidth={1.75}
                />
                <span className="min-w-0 flex-1 truncate font-inter text-[13px] font-medium text-[var(--dash-text)]">
                  {section.label}
                </span>
                <ChevronRight
                  className={`h-4 w-4 shrink-0 text-[var(--dash-faint)] transition-transform duration-200 ${
                    expanded ? "rotate-90" : ""
                  }`}
                  strokeWidth={1.75}
                />
              </button>
              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mb-1 ml-4 mt-0.5 space-y-0.5 border-l border-[var(--dash-border)] pl-2.5">
                      {section.items.map((item) => (
                        <NavLink
                          key={item.href}
                          item={item}
                          pathname={pathname}
                          isEgaTab={isEgaTab}
                          search={search}
                          onNavigate={onNavigate}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[var(--dash-border)] p-3">
        <div className="mb-2 flex items-center gap-2 rounded-xl px-2 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--dash-accent-soft)] font-inter text-[11px] font-semibold text-[var(--dash-accent)]">
            {initial}
          </span>
          <span className="truncate font-inter text-[12px] text-[var(--dash-muted)]">
            {email}
          </span>
        </div>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2.5 font-inter text-[13px] font-medium text-[var(--dash-muted)] transition hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </form>
      </div>
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(() =>
    activeSectionId(sections, pathname, isEgaTab, search)
  );

  useEffect(() => {
    const active = activeSectionId(sections, pathname, isEgaTab, search);
    if (active) setOpenId(active);
  }, [pathname, isEgaTab, search, sections]);

  useEffect(() => {
    setDrawerOpen(false);
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

  const toggleSection = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const currentLabel =
    sections
      .flatMap((s) => s.items)
      .find((i) => i.match(pathname, isEgaTab, search))?.label || "Admin";

  const showSearch = hasPermission(permissions, "search:read");
  const bodyProps = {
    email,
    pathname,
    isEgaTab,
    search,
    sections,
    openId,
    onToggle: toggleSection,
    showSearch,
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-[var(--dash-border)] bg-[var(--dash-bg)] lg:block">
        <SidebarBody {...bodyProps} />
      </aside>

      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[var(--dash-border)] bg-gaude-black/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
          onClick={() => setDrawerOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)]"
        >
          {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
            Admin
          </p>
          <p className="truncate font-inter text-sm text-[var(--dash-text)]">
            {currentLabel}
          </p>
        </div>
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="Editco" className="h-6 w-6 object-contain" />
        </Link>
      </header>

      <AnimatePresence>
        {drawerOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 w-[min(280px,88vw)] border-r border-[var(--dash-border)] bg-[var(--dash-bg)] lg:hidden"
            >
              <SidebarBody
                {...bodyProps}
                onNavigate={() => setDrawerOpen(false)}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
