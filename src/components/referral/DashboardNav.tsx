"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { logoutReferrer } from "@/actions/auth";
import {
  LayoutDashboard,
  Plus,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useDashboardTheme } from "@/components/referral/DashboardThemeProvider";

const LOGO_SRC =
  "https://res.cloudinary.com/dxeoibunj/image/upload/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png";

const links = [
  { href: "/dashboard", label: "Pipeline", icon: LayoutDashboard },
  { href: "/dashboard/new", label: "Add referral", icon: Plus },
];

export function DashboardNav({ name }: { name: string }) {
  const pathname = usePathname();
  const first = name.split(" ")[0] || "Partner";
  const { theme, toggleTheme } = useDashboardTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--dash-border)] bg-[var(--dash-nav)] backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center justify-start">
          <Link
            href="/"
            aria-label="Editco home"
            className="group flex items-center"
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] transition-colors group-hover:border-[var(--dash-accent)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_SRC}
                alt="Editco"
                className="h-7 w-7 object-contain"
              />
            </motion.span>
          </Link>
        </div>

        <LayoutGroup id="dash-nav">
          <nav className="flex items-center gap-1 rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] p-1">
            {links.map((link) => {
              const active =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname?.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch
                  className={`relative flex items-center gap-2 rounded-full px-3.5 py-2 font-inter text-[13px] font-medium tracking-[-0.01em] transition-colors duration-300 sm:px-5 ${
                    active
                      ? "text-[var(--dash-on-accent)]"
                      : "text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="dash-nav-pill"
                      className="dash-pill-active absolute inset-0 rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                        mass: 0.8,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 opacity-80" strokeWidth={1.75} />
                    <span className="hidden sm:inline">{link.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </LayoutGroup>

        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-muted)] transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </motion.button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface)] py-1.5 pl-1.5 pr-2.5 transition hover:border-[var(--dash-accent)]/40 sm:pr-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--dash-accent-soft)] font-inter text-[11px] font-semibold text-[var(--dash-accent)]">
                {first.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden font-inter text-[13px] font-medium text-[var(--dash-text)] sm:inline">
                {first}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-[var(--dash-faint)] transition-transform duration-200 ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {menuOpen ? (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[160px] overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-bg)] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
                >
                  <form action={logoutReferrer}>
                    <button
                      type="submit"
                      role="menuitem"
                      className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2.5 font-inter text-[13px] font-medium text-[var(--dash-muted)] transition hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Log out
                    </button>
                  </form>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
