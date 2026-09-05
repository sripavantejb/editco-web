"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LogOut,
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
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { logoutAdmin } from "@/actions/auth";
import { SALES_MODULE_GROUPS, salesModulesByGroup, type SalesModuleKey } from "@/lib/sales/modules";

/** Employee-facing IA per spec §47: only groups/items the admin has enabled render at all. */
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
  "Analytics",
  "Reports",
  "Administration",
];

/** "/sales/employee" is the dashboard root AND a prefix of every other route — only exact-match it. */
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

export function SalesEmployeeSidebar({
  name,
  effective,
}: {
  name: string;
  effective: Record<SalesModuleKey, boolean>;
}) {
  const pathname = usePathname() || "";
  const initial = (name?.[0] || "S").toUpperCase();

  const sections = GROUP_ORDER.map((group) => ({
    group,
    items: salesModulesByGroup(group).filter(
      (m) => effective[m.key] && m.employeeRoutes.length > 0
    ),
  })).filter((s) => s.items.length > 0);

  const activeGroup = sections.find((s) =>
    s.items.some((item) => isHrefActive(item.employeeRoutes[0], pathname))
  )?.group;

  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup ?? sections[0]?.group ?? null);

  useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup);
  }, [activeGroup]);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-[var(--dash-border)] bg-[var(--dash-bg)] lg:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2.5 border-b border-[var(--dash-border)] px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]">
            <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
              Sales CRM
            </p>
            <p className="truncate font-inter text-xs text-[var(--dash-text)]">Editco</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {sections.map((section) => {
            const Icon = GROUP_ICONS[section.group];

            if (section.items.length === 1) {
              const item = section.items[0];
              const href = item.employeeRoutes[0];
              const active = isHrefActive(href, pathname);
              return (
                <Link
                  key={section.group}
                  href={href}
                  prefetch
                  className={`flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 py-2 font-inter text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-[var(--dash-accent)] text-[var(--dash-on-accent)]"
                      : "text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "" : "text-[var(--dash-accent)]"}`} strokeWidth={1.75} />
                  {section.group}
                </Link>
              );
            }

            const expanded = openGroup === section.group;
            const sectionActive = section.group === activeGroup;
            return (
              <div key={section.group}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpenGroup(expanded ? null : section.group)}
                  className={`flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left font-inter text-[13px] font-medium transition-colors ${
                    sectionActive && !expanded ? "bg-[var(--dash-hover)]" : "hover:bg-[var(--dash-hover)]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--dash-accent)]" strokeWidth={1.75} />
                  <span className="min-w-0 flex-1 truncate text-[var(--dash-text)]">{section.group}</span>
                  <ChevronRight
                    className={`h-3.5 w-3.5 shrink-0 text-[var(--dash-faint)] transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
                    strokeWidth={1.75}
                  />
                </button>
                {expanded ? (
                  <div className="mb-1 ml-4 mt-0.5 space-y-0.5 border-l border-[var(--dash-border)] pl-2.5">
                    {section.items.map((item) => {
                      const href = item.employeeRoutes[0];
                      const active = isHrefActive(href, pathname);
                      return (
                        <Link
                          key={item.key}
                          href={href}
                          prefetch
                          className={`flex min-h-9 items-center rounded-lg px-2.5 py-1.5 font-inter text-[13px] font-medium transition-colors ${
                            active
                              ? "bg-[var(--dash-accent)] text-[var(--dash-on-accent)]"
                              : "text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
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
