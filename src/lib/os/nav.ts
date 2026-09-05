import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Kanban,
  Link2,
  Building2,
  FolderKanban,
  Receipt,
  Wallet,
  AlertCircle,
  Calendar,
  ListTodo,
  FileText,
  Activity,
  BarChart3,
  Settings,
  UserCog,
  Search,
  Archive,
  BookOpen,
} from "lucide-react";

export type OsNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: string;
  match: (pathname: string) => boolean;
};

export type OsNavSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: OsNavItem[];
};

export const osNavSections: OsNavSection[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    items: [
      {
        href: "/admin/os",
        label: "Dashboard",
        icon: LayoutDashboard,
        permission: "dashboard:read",
        match: (p) => p === "/admin/os",
      },
      {
        href: "/admin/os/how-it-works",
        label: "How it works",
        icon: BookOpen,
        permission: "dashboard:read",
        match: (p) => p.startsWith("/admin/os/how-it-works"),
      },
      {
        href: "/admin/os/notifications",
        label: "Notifications",
        icon: AlertCircle,
        permission: "notifications:read",
        match: (p) => p.startsWith("/admin/os/notifications"),
      },
      {
        href: "/admin/os/search",
        label: "Search",
        icon: Search,
        permission: "search:read",
        match: (p) => p.startsWith("/admin/os/search"),
      },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    icon: Users,
    items: [
      {
        href: "/admin/os/leads",
        label: "Leads",
        icon: Users,
        permission: "leads:read",
        match: (p) =>
          p.startsWith("/admin/os/leads") && !p.startsWith("/admin/os/leads/lists"),
      },
      {
        href: "/admin/os/leads/lists",
        label: "Lead Lists",
        icon: ListTodo,
        permission: "leads:read",
        match: (p) => p.startsWith("/admin/os/leads/lists"),
      },
      {
        href: "/admin/os/pipeline",
        label: "Pipeline",
        icon: Kanban,
        permission: "leads:read",
        match: (p) => p.startsWith("/admin/os/pipeline"),
      },
      {
        href: "/admin/os/calling",
        label: "Calling",
        icon: Calendar,
        permission: "calls:read",
        match: (p) => p.startsWith("/admin/os/calling"),
      },
      {
        href: "/admin/os/follow-ups",
        label: "Follow-ups",
        icon: ListTodo,
        permission: "followups:read",
        match: (p) => p.startsWith("/admin/os/follow-ups"),
      },
      {
        href: "/admin/os/proposals",
        label: "Proposals",
        icon: FileText,
        permission: "proposals:read",
        match: (p) => p.startsWith("/admin/os/proposals"),
      },
      {
        href: "/admin/os/projects-vault",
        label: "Projects Vault",
        icon: Archive,
        permission: "vault:read",
        match: (p) => p.startsWith("/admin/os/projects-vault"),
      },
      {
        href: "/admin/os/conversions",
        label: "Conversions",
        icon: Link2,
        permission: "conversions:read",
        match: (p) => p.startsWith("/admin/os/conversions"),
      },
    ],
  },
  {
    id: "clients",
    label: "Clients",
    icon: Building2,
    items: [
      {
        href: "/admin/os/vendors",
        label: "Clients",
        icon: Building2,
        permission: "vendors:read",
        match: (p) =>
          p.startsWith("/admin/os/vendors") || p.startsWith("/admin/os/clients"),
      },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: FolderKanban,
    items: [
      {
        href: "/admin/os/projects",
        label: "All projects",
        icon: FolderKanban,
        permission: "projects:read",
        match: (p) =>
          p === "/admin/os/projects" || p.startsWith("/admin/os/projects/"),
      },
      {
        href: "/admin/os/projects?filter=active",
        label: "Active",
        icon: FolderKanban,
        permission: "projects:read",
        match: () => false,
      },
      {
        href: "/admin/os/projects?filter=due",
        label: "Due soon",
        icon: FolderKanban,
        permission: "projects:read",
        match: () => false,
      },
      {
        href: "/admin/os/projects?filter=completed",
        label: "Completed",
        icon: FolderKanban,
        permission: "projects:read",
        match: () => false,
      },
      {
        href: "/admin/os/tasks",
        label: "Tasks",
        icon: ListTodo,
        permission: "tasks:read",
        match: (p) => p.startsWith("/admin/os/tasks"),
      },
      {
        href: "/admin/os/meetings",
        label: "Meetings",
        icon: Calendar,
        permission: "meetings:read",
        match: (p) => p.startsWith("/admin/os/meetings"),
      },
      {
        href: "/admin/os/documents",
        label: "Documents",
        icon: FileText,
        permission: "documents:read",
        match: (p) => p.startsWith("/admin/os/documents"),
      },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: Wallet,
    items: [
      {
        href: "/admin/os/invoices",
        label: "Invoices",
        icon: Receipt,
        permission: "invoices:read",
        match: (p) => p.startsWith("/admin/os/invoices"),
      },
      {
        href: "/admin/os/payments",
        label: "Payments",
        icon: Wallet,
        permission: "payments:read",
        match: (p) => p.startsWith("/admin/os/payments"),
      },
      {
        href: "/admin/os/outstanding",
        label: "Outstanding",
        icon: AlertCircle,
        permission: "finance:read",
        match: (p) => p.startsWith("/admin/os/outstanding"),
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    icon: Activity,
    items: [
      {
        href: "/admin/os/activity",
        label: "Activity",
        icon: Activity,
        permission: "activity:read",
        match: (p) => p.startsWith("/admin/os/activity"),
      },
      {
        href: "/admin/os/analytics",
        label: "Analytics",
        icon: BarChart3,
        permission: "analytics:read",
        match: (p) => p.startsWith("/admin/os/analytics"),
      },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    icon: Settings,
    items: [
      {
        href: "/admin/os/settings",
        label: "Settings",
        icon: Settings,
        permission: "*",
        match: (p) => p === "/admin/os/settings",
      },
      {
        href: "/admin/os/settings/users",
        label: "Users & roles",
        icon: UserCog,
        permission: "*",
        match: (p) => p.startsWith("/admin/os/settings/users"),
      },
      {
        href: "/admin/os/settings/services",
        label: "Services",
        icon: Settings,
        permission: "*",
        match: (p) => p.startsWith("/admin/os/settings/services"),
      },
      {
        href: "/admin/os/settings/sales-admins",
        label: "Sales CRM admins",
        icon: UserCog,
        permission: "*",
        match: (p) => p.startsWith("/admin/os/settings/sales-admins"),
      },
    ],
  },
];
