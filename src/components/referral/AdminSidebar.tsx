"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  match: (pathname: string) => boolean;
};

type NavSection = {
  id: string;
  label: string;
  icon: typeof Gift;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    id: "refer",
    label: "Refer & Earn",
    icon: Gift,
    items: [
      {
        href: "/admin",
        label: "Overview",
        icon: LayoutDashboard,
        match: (p) =>
          p === "/admin" || p.startsWith("/admin/referrals"),
      },
      {
        href: "/admin/rewards",
        label: "Rewards",
        icon: Wallet,
        match: (p) => p.startsWith("/admin/rewards"),
      },
    ],
  },
  {
    id: "careers",
    label: "Careers",
    icon: Sparkles,
    items: [
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
    ],
  },
];

const egaSection: NavSection = {
  id: "ega",
  label: "Growth Associates",
  icon: Users,
  items: [
    {
      href: "/admin-ega",
      label: "EGA Applications",
      icon: Users,
      match: (p) => p.startsWith("/admin-ega"),
    },
  ],
};

const LOGO_SRC =
  "https://res.cloudinary.com/dxeoibunj/image/upload/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png";

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = item.match(pathname);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      prefetch
      onClick={onNavigate}
      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 font-inter text-[13px] font-medium transition-colors ${
        active
          ? "bg-[var(--dash-accent)] text-[var(--dash-on-accent)]"
          : "text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-85" strokeWidth={1.75} />
      {item.label}
    </Link>
  );
}

function SidebarBody({
  email,
  pathname,
  sections: navSections,
  showMainAdmin = false,
  egaOnly = false,
  onNavigate,
}: {
  email: string;
  pathname: string;
  sections: NavSection[];
  showMainAdmin?: boolean;
  egaOnly?: boolean;
  onNavigate?: () => void;
}) {
  const initial = (email?.[0] || "A").toUpperCase();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-[var(--dash-border)] px-4 py-4">
        <Link
          href="/"
          aria-label="Editco home"
          onClick={onNavigate}
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="Editco" className="h-7 w-7 object-contain" />
        </Link>
        <div className="min-w-0">
          <p className="font-archivo text-[11px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
            {egaOnly ? "EGA" : "Admin"}
          </p>
          <p className="truncate font-inter text-sm text-[var(--dash-text)]">
            {egaOnly ? "Growth Associates" : "Editco panel"}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navSections.map((section) => {
          const SectionIcon = section.icon;
          return (
            <div key={section.id}>
              <div className="mb-2 flex items-center gap-2 px-3">
                <SectionIcon
                  className="h-3.5 w-3.5 text-[var(--dash-accent)]"
                  strokeWidth={1.75}
                />
                <p className="font-archivo text-[10px] uppercase tracking-[0.18em] text-[var(--dash-faint)]">
                  {section.label}
                </p>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
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
        {showMainAdmin ? (
          <Link
            href="/admin"
            onClick={onNavigate}
            className="mb-1 inline-flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2.5 font-inter text-[13px] font-medium text-[var(--dash-muted)] transition hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
          >
            Main admin
          </Link>
        ) : null}
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
  egaOnly = false,
  showMainAdmin = false,
}: {
  email: string;
  egaOnly?: boolean;
  showMainAdmin?: boolean;
}) {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const navSections = egaOnly ? [egaSection] : sections;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const currentLabel =
    navSections
      .flatMap((s) => s.items)
      .find((i) => i.match(pathname))?.label || "Admin";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-[var(--dash-border)] bg-[var(--dash-bg)] lg:block">
        <SidebarBody
          email={email}
          pathname={pathname}
          sections={navSections}
          egaOnly={egaOnly}
          showMainAdmin={showMainAdmin}
        />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[var(--dash-border)] bg-gaude-black/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)]"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
            {egaOnly ? "EGA" : "Admin"}
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

      {/* Mobile drawer */}
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 w-[min(280px,88vw)] border-r border-[var(--dash-border)] bg-[var(--dash-bg)] lg:hidden"
            >
              <SidebarBody
                email={email}
                pathname={pathname}
                sections={navSections}
                egaOnly={egaOnly}
                showMainAdmin={showMainAdmin}
                onNavigate={() => setOpen(false)}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
