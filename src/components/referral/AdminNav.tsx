"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/actions/auth";
import { LayoutDashboard, List, Wallet, LogOut } from "lucide-react";
import { motion } from "framer-motion";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/referrals", label: "Referrals", icon: List },
  { href: "/admin/rewards", label: "Rewards", icon: Wallet },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gaude-black/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="font-archivo text-[11px] uppercase tracking-[0.16em] text-gaude-orange">
              Editco Admin
            </p>
            <p className="font-inter text-xs text-white/40">Referral control</p>
          </div>
          <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
            {links.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname?.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 rounded-full px-3 py-2 font-archivo text-[10px] uppercase tracking-widest ${
                    active ? "text-white" : "text-white/45 hover:text-white/80"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-nav-pill"
                      className="absolute inset-0 rounded-full bg-gaude-orange shadow-[0_0_20px_rgba(255,78,0,0.35)]"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    />
                  )}
                  <Icon className="relative z-10 h-3.5 w-3.5" />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-inter text-xs text-white/40 sm:inline">
            {email}
          </span>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 px-3 font-archivo text-[10px] uppercase tracking-widest text-white/50 transition hover:border-gaude-orange/40 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
