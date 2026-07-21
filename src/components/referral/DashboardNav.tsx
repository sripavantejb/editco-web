"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutReferrer } from "@/actions/auth";
import { LayoutDashboard, Plus, LogOut, Home } from "lucide-react";
import { motion } from "framer-motion";

export function DashboardNav({ name }: { name: string }) {
  const pathname = usePathname();
  const first = name.split(" ")[0] || "Partner";

  const links = [
    { href: "/dashboard", label: "Pipeline", icon: LayoutDashboard },
    { href: "/dashboard/new", label: "Add referral", icon: Plus },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gaude-black/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/dxeoibunj/image/upload/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png"
              alt="Editco"
              className="h-9 w-9 object-contain"
            />
            <div className="hidden sm:block">
              <p className="font-archivo text-[11px] uppercase tracking-[0.16em] text-gaude-orange">
                Editco Referral
              </p>
              <p className="font-inter text-xs text-white/45">Partner portal</p>
            </div>
          </Link>

          <nav className="ml-1 flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
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
                  className={`relative flex items-center gap-2 rounded-full px-3 py-2 font-archivo text-[10px] uppercase tracking-widest transition-colors sm:px-4 ${
                    active
                      ? "text-white"
                      : "text-white/45 hover:text-white/80"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="dash-nav-pill"
                      className="absolute inset-0 rounded-full bg-gaude-orange shadow-[0_0_20px_rgba(255,78,0,0.35)]"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    />
                  )}
                  <Icon className="relative z-10 h-3.5 w-3.5" />
                  <span className="relative z-10 hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 md:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gaude-orange/20 font-archivo text-[10px] text-gaude-orange">
              {first.slice(0, 1).toUpperCase()}
            </span>
            <span className="font-inter text-sm text-white/80">{first}</span>
          </div>
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 font-archivo text-[10px] uppercase tracking-widest text-white/70 transition hover:border-white/20 hover:text-white"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Site</span>
          </Link>
          <form action={logoutReferrer}>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 px-3 font-archivo text-[10px] uppercase tracking-widest text-white/50 transition hover:border-gaude-orange/40 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
