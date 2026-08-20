"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV = [
  { path: "", label: "Overview" },
  { path: "/projects", label: "Projects" },
  { path: "/invoices", label: "Invoices" },
  { path: "/payments", label: "Payments" },
  { path: "/documents", label: "Documents" },
  { path: "/meetings", label: "Meetings" },
] as const;

export function ClientPortalNav({
  base,
  className,
}: {
  base: string;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {NAV.map((item) => {
        const href = `${base}${item.path}`;
        const active =
          item.path === ""
            ? pathname === base || pathname === `${base}/`
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={item.path || "overview"}
            href={href}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 font-inter text-[13px] transition-colors",
              active
                ? "bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]"
                : "text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
