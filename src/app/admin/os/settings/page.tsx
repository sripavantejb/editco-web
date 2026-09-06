export const dynamic = "force-dynamic";

import Link from "next/link";
import { UserCog, Settings as SettingsIcon, Building2, ImageIcon } from "lucide-react";
import { requireOsPage } from "@/lib/os/page";
import { OsPage } from "@/components/os/ui";

const SETTINGS_SECTIONS = [
  {
    href: "/admin/os/settings/users",
    icon: UserCog,
    title: "Users & roles",
    description: "Add internal team accounts, set roles, deactivate access.",
  },
  {
    href: "/admin/os/settings/services",
    icon: SettingsIcon,
    title: "Services",
    description: "The service catalog used across leads, proposals, and pitches.",
  },
  {
    href: "/admin/os/settings/website",
    icon: ImageIcon,
    title: "Website images",
    description: "Clients logos, Selected Works, and The Crew photos & portfolio links.",
  },
  {
    href: "/admin/os/settings/sales-admins",
    icon: Building2,
    title: "Sales CRM admins",
    description: "Create the credentials for whoever runs the Sales CRM at /sales/admin.",
  },
];

export default async function SettingsHubPage() {
  await requireOsPage("*");

  return (
    <OsPage title="Settings" subtitle="Everything that configures Editco OS, in one place." backHref="/admin/os" backLabel="Back to dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-[20px] border border-[var(--dash-border)] p-5 transition-colors hover:border-[var(--dash-accent)]"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h2 className="font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)] group-hover:text-[var(--dash-accent)]">
                {s.title}
              </h2>
              <p className="mt-1 font-inter text-xs text-[var(--dash-muted)]">{s.description}</p>
            </Link>
          );
        })}
      </div>
    </OsPage>
  );
}
