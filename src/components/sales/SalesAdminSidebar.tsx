"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Users, UserCog, Contact, Target, CheckCircle2, MapPin, ScrollText, ListTodo } from "lucide-react";
import { logoutAdmin } from "@/actions/auth";

const NAV = [
  { href: "/sales/admin", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p === "/sales/admin" },
  { href: "/sales/admin/leads", label: "All Leads", icon: Contact, match: (p: string) => p.startsWith("/sales/admin/leads") },
  { href: "/sales/admin/team", label: "Employees", icon: Users, match: (p: string) => p.startsWith("/sales/admin/team") && !p.includes("/access") },
  { href: "/sales/admin/tasks", label: "Tasks", icon: ListTodo, match: (p: string) => p.startsWith("/sales/admin/tasks") },
  { href: "/sales/admin/targets", label: "Targets", icon: Target, match: (p: string) => p.startsWith("/sales/admin/targets") },
  { href: "/sales/admin/approvals", label: "Approvals", icon: CheckCircle2, match: (p: string) => p.startsWith("/sales/admin/approvals") },
  { href: "/sales/admin/territories", label: "Territories", icon: MapPin, match: (p: string) => p.startsWith("/sales/admin/territories") },
  { href: "/sales/admin/audit-logs", label: "Audit Logs", icon: ScrollText, match: (p: string) => p.startsWith("/sales/admin/audit-logs") },
];

export function SalesAdminSidebar({ name }: { name: string }) {
  const pathname = usePathname() || "";
  const initial = (name?.[0] || "S").toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-[var(--dash-border)] bg-[var(--dash-bg)] lg:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2.5 border-b border-[var(--dash-border)] px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]">
            <UserCog className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
              Sales CRM
            </p>
            <p className="truncate font-inter text-xs text-[var(--dash-text)]">Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
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
          })}
        </nav>

        <div className="border-t border-[var(--dash-border)] p-3">
          <div className="mb-2 flex items-center gap-2 rounded-xl px-2 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--dash-accent-soft)] font-inter text-[11px] font-semibold text-[var(--dash-accent)]">
              {initial}
            </span>
            <span className="truncate font-inter text-[12px] text-[var(--dash-muted)]">{name}</span>
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
    </aside>
  );
}
