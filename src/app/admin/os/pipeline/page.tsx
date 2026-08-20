export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { Lead } from "@/models/os/Lead";
import {
  LEAD_STATUS_LABELS,
  type LeadStatus,
} from "@/lib/os/constants";
import { OsPage } from "@/components/os/ui";
import { hasPermission } from "@/lib/os/permissions";
import { PipelineBoard } from "@/components/os/PipelineBoard";

export default async function PipelinePage() {
  const staff = await requireOsPage("leads:read");
  const canWrite = hasPermission(staff.permissions, "leads:write");

  const pipelineStatuses: LeadStatus[] = [
    "new",
    "contacted",
    "qualified",
    "proposal",
    "negotiation",
    "lost",
    "on_hold",
  ];
  const leads = await Lead.find({
    recordStatus: "active",
    status: { $in: pipelineStatuses },
  }).lean();

  const leadsByStatus: Record<string, any[]> = {};
  for (const s of pipelineStatuses) leadsByStatus[s] = [];
  for (const l of leads) {
    leadsByStatus[l.status].push({
      _id: String(l._id),
      name: l.name,
      company: l.company,
      assignedOwner: l.assignedOwner,
      estimatedValue: l.estimatedValue,
      status: l.status as LeadStatus,
    });
  }

  return (
    <OsPage title="Pipeline" subtitle="Kanban by CRM stage. Converted deals live under Conversions."
      backHref="/admin/os"
      backLabel="Back to dashboard">
      <PipelineBoard columns={pipelineStatuses} leadsByStatus={leadsByStatus} canWrite={canWrite} />
      </OsPage>
  );
}
