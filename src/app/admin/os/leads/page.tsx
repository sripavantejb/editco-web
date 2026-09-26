export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { Lead } from "@/models/os/Lead";
import { LeadProjectPitch } from "@/models/os/LeadProjectPitch";
import { VaultProject } from "@/models/os/VaultProject";
import { LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/os/constants";
import { cn, formatCurrencyINR, formatDate } from "@/lib/utils";
import { Plus, Upload } from "lucide-react";
import {
  OsBadge,
  OsPage,
  OsTable,
  Td,
  Th,
  leadTone,
  osButtonClass,
} from "@/components/os/ui";
import { SalesModal } from "@/components/sales/SalesModal";
import { hasPermission } from "@/lib/os/permissions";
import { LeadStageMoveForm } from "@/components/os/LeadStageMoveForm";
import { LeadsFilterForm } from "@/components/os/LeadsFilterForm";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import { archiveLead } from "@/actions/os/leads";
import type { StaffContext } from "@/lib/os/staff";
import { Types } from "mongoose";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    pageSize?: string;
    sort?: string;
    projectId?: string;
    pitchStatus?: string;
  }>;
}) {
  const staff = (await requireOsPage("leads:read")) as StaffContext;
  const canWrite = hasPermission(staff.permissions, "leads:write");

  const {
    q = "",
    status,
    page,
    pageSize,
    sort,
    projectId,
    pitchStatus,
  } = await searchParams;
  const query: Record<string, unknown> = { recordStatus: "active" };

  const trimmedQ = q.trim();
  if (status && status !== "all") query.status = status;
  if (trimmedQ) {
    query.$or = [
      { name: new RegExp(trimmedQ, "i") },
      { company: new RegExp(trimmedQ, "i") },
      { email: new RegExp(trimmedQ, "i") },
      { phone: new RegExp(trimmedQ, "i") },
    ];
  }

  const pitchFilter: Record<string, unknown> = { recordStatus: "active" };
  if (projectId && projectId !== "all" && Types.ObjectId.isValid(projectId)) {
    pitchFilter.projectId = new Types.ObjectId(projectId);
  }
  if (pitchStatus && pitchStatus !== "all") {
    pitchFilter.status = pitchStatus;
  }
  if (pitchFilter.projectId || pitchFilter.status) {
    const pitchedLeadIds = await LeadProjectPitch.distinct("leadId", pitchFilter);
    query._id = { $in: pitchedLeadIds };
  }

  const pageNum = Math.max(1, Number(page || 1));
  const limitNum = Math.min(50, Math.max(10, Number(pageSize || 25)));
  const skip = (pageNum - 1) * limitNum;

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    updatedAt: { updatedAt: -1 },
    createdAt: { createdAt: -1 },
    value: { estimatedValue: -1 },
  };
  const sortObj = sortMap[sort || "updatedAt"] ?? sortMap.updatedAt;

  const vaultProjects = await VaultProject.find({
    recordStatus: "active",
  })
    .sort({ name: 1 })
    .select({ name: 1 })
    .lean();

  const total = await Lead.countDocuments(query);
  const leads = await Lead.find(query).sort(sortObj).skip(skip).limit(limitNum).lean();
  const totalPages = Math.max(1, Math.ceil(total / limitNum));

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (trimmedQ) params.set("q", trimmedQ);
    if (status) params.set("status", status);
    if (projectId) params.set("projectId", projectId);
    if (pitchStatus) params.set("pitchStatus", pitchStatus);
    params.set("page", String(nextPage));
    params.set("pageSize", String(limitNum));
    if (sort) params.set("sort", sort);
    const qs = params.toString();
    return `/admin/os/leads?${qs}`;
  };

  return (
    <OsPage
      title="Leads"
      subtitle="Opportunities. Converted leads become clients through a conversion UUID — never a disconnected record."
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={
        canWrite ? (
          <>
            <Link href="/admin/os/leads/import" className={osButtonClass("secondary")}>
              <Upload className="h-4 w-4" />
              Import CSV
            </Link>
            <Link href="/admin/os/leads/new" className={osButtonClass("primary")}>
              <Plus className="h-4 w-4" />
              Add lead
            </Link>
          </>
        ) : null
      }
    >
      <LeadsFilterForm
        q={trimmedQ}
        status={status}
        sort={sort}
        projectId={projectId}
        pitchStatus={pitchStatus}
        vaultProjects={vaultProjects.map((p) => ({
          id: String(p._id),
          name: p.name,
        }))}
      />
      <OsTable>
        <thead>
          <tr>
            <Th>Lead</Th>
            <Th>Status</Th>
            <Th align="right">Value</Th>
            <Th>Owner</Th>
            <Th>Source</Th>
            <Th>Created</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const leadHref = `/admin/os/leads/${String(lead._id)}`;
            const canEditRow = canWrite && lead.status !== "converted";
            return (
              <tr key={String(lead._id)}>
                <Td>
                  <Link href={leadHref} className="group flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] font-inter text-[12px] font-semibold text-[#374151]">
                      {(lead.name || "?").charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-[#111111] group-hover:underline">
                        {lead.name}
                      </span>
                      <span className="block truncate text-xs text-[#6b7280]">{lead.company || "—"}</span>
                    </span>
                  </Link>
                </Td>
                <Td>
                  <OsBadge tone={leadTone(lead.status)}>
                    {LEAD_STATUS_LABELS[lead.status as LeadStatus]}
                  </OsBadge>
                </Td>
                <Td align="right" className="whitespace-nowrap tabular-nums">
                  {formatCurrencyINR(lead.estimatedValue || 0)}
                </Td>
                <Td className="whitespace-nowrap">{lead.assignedOwner || "—"}</Td>
                <Td className="whitespace-nowrap capitalize">{lead.source || "—"}</Td>
                <Td className="whitespace-nowrap text-[#4b5563]">{formatDate(lead.createdAt)}</Td>
                <Td align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={leadHref} className={osButtonClass("secondary", "sm")}>
                      Open
                    </Link>
                    {canEditRow ? (
                      <SalesModal
                        triggerLabel="Move stage"
                        title={`Move ${lead.name}`}
                        subtitle="Stage changes are logged to the lead's history."
                        triggerClassName={osButtonClass("secondary", "sm")}
                      >
                        <LeadStageMoveForm
                          leadId={String(lead._id)}
                          currentEstimatedValue={lead.estimatedValue || 0}
                          compact
                          defaultToStatus={lead.status as LeadStatus}
                        />
                      </SalesModal>
                    ) : null}
                    {canEditRow ? (
                      <RowDeleteButton
                        action={archiveLead}
                        id={String(lead._id)}
                        confirmMessage={`Delete lead "${lead.name}"?`}
                      />
                    ) : (
                      <span className="inline-block w-8" />
                    )}
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </OsTable>

      {leads.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-[var(--dash-border)] bg-white px-6 py-10 text-center">
          <p className="font-inter text-sm font-medium text-[#111111]">No leads found</p>
          <p className="mt-1 font-inter text-xs text-[#6b7280]">
            {trimmedQ || (status && status !== "all") ? "Try clearing the filters." : "Add your first lead to start the pipeline."}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-inter text-xs text-[#6b7280]">
          {total === 0
            ? "0 leads"
            : `Showing ${skip + 1}–${Math.min(skip + leads.length, total)} of ${total} leads`}
        </p>
        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <Link
              href={buildHref(Math.max(1, pageNum - 1))}
              aria-disabled={pageNum <= 1}
              className={cn(osButtonClass("secondary", "sm"), pageNum <= 1 && "pointer-events-none opacity-40")}
            >
              Previous
            </Link>
            <span className="font-inter text-xs text-[#6b7280]">
              Page {pageNum} of {totalPages}
            </span>
            <Link
              href={buildHref(Math.min(totalPages, pageNum + 1))}
              aria-disabled={pageNum >= totalPages}
              className={cn(osButtonClass("secondary", "sm"), pageNum >= totalPages && "pointer-events-none opacity-40")}
            >
              Next
            </Link>
          </div>
        ) : null}
      </div>
    </OsPage>
  );
}
