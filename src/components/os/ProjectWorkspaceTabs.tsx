import Link from "next/link";
import { cn } from "@/lib/utils";

export const PROJECT_WORKSPACE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "tracking", label: "Tracking" },
  { id: "milestones", label: "Milestones" },
  { id: "tasks", label: "Tasks" },
  { id: "meetings", label: "Meetings" },
  { id: "files", label: "Files" },
  { id: "invoices", label: "Invoices" },
  { id: "activity", label: "Activity" },
  { id: "visibility", label: "Client Visibility" },
] as const;

export type ProjectWorkspaceTabId = (typeof PROJECT_WORKSPACE_TABS)[number]["id"];

export function ProjectWorkspaceTabs({
  projectId,
  active,
}: {
  projectId: string;
  active: ProjectWorkspaceTabId;
}) {
  return (
    <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-[var(--dash-border)] pb-px">
      {PROJECT_WORKSPACE_TABS.map((tab) => {
        const href = `/admin/os/projects/${projectId}?tab=${tab.id}`;
        const isActive = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={href}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2 font-archivo text-[11px] uppercase tracking-[0.08em] transition",
              isActive
                ? "border-[var(--dash-accent)] text-[var(--dash-accent)]"
                : "border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
