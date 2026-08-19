"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  Sparkles,
  Users,
  ChevronRight,
  ListChecks,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  match: (pathname: string, isEgaTab: boolean) => boolean;
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
  {
    id: "ega",
    label: "Growth Associates",
    icon: Users,
    items: [
      {
        href: "/admin/ega",
        label: "EGA Applications",
        icon: Users,
        match: (p) =>
          (p.startsWith("/admin/ega") && !p.startsWith("/admin/ega/form")) ||
          p.startsWith("/admin-ega"),
      },
      {
        href: "/admin/ega/form",
        label: "Form questions",
        icon: ListChecks,
        match: (p) => p.startsWith("/admin/ega/form"),
      },
    ],
  },
];

const LOGO_SRC =
  "https://res.cloudinary.com/dxeoibunj/image/upload/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png";

function activeSectionId(pathname: string, isEgaTab: boolean) {
  return (
    sections.find((s) =>
      s.items.some((item) => item.match(pathname, isEgaTab))
    )?.id ?? null
  );
}

function NavLink({
  item,
  pathname,
  isEgaTab,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  isEgaTab: boolean;
  onNavigate?: () => void;
}) {
  const active = item.match(pathname, isEgaTab);
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
  openIds,
  onToggle,
  onNavigate,
}: {
  email: string;
  pathname: string;
  isEgaTab: boolean;
  openIds: Set<string>;
  onToggle: (id: string) => void;
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
            Admin
          </p>
          <p className="truncate font-inter text-sm text-[var(--dash-text)]">
            Editco panel
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => {
          const SectionIcon = section.icon;
          const expanded = openIds.has(section.id);
          const sectionActive = section.items.some((item) =>
            item.match(pathname, isEgaTab)
          );

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

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const isEgaTab = searchParams.get("tab") === "ega";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const active = activeSectionId(pathname, isEgaTab);
    return new Set(active ? [active] : ["refer"]);
  });

  useEffect(() => {
    const active = activeSectionId(pathname, isEgaTab);
    if (!active) return;
    setOpenIds((prev) => {
      if (prev.has(active)) return prev;
      const next = new Set(prev);
      next.add(active);
      return next;
    });
  }, [pathname, isEgaTab]);

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
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const currentLabel =
    sections
      .flatMap((s) => s.items)
      .find((i) => i.match(pathname, isEgaTab))?.label || "Admin";

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-[var(--dash-border)] bg-[var(--dash-bg)] lg:block">
        <SidebarBody
          email={email}
          pathname={pathname}
          isEgaTab={isEgaTab}
          openIds={openIds}
          onToggle={toggleSection}
        />
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
                email={email}
                pathname={pathname}
                isEgaTab={isEgaTab}
                openIds={openIds}
                onToggle={toggleSection}
                onNavigate={() => setDrawerOpen(false)}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
