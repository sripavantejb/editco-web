export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { Lead } from "@/models/os/Lead";
import { LeadProjectPitch } from "@/models/os/LeadProjectPitch";
import { VaultProject } from "@/models/os/VaultProject";
import { LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/os/constants";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import {
  OsBadge,
  OsPage,
  OsTable,
  Td,
  Th,
  leadTone,
} from "@/components/os/ui";
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
            <Link
              href="/admin/os/leads/import"
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--dash-border)] px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
            >
              Import CSV
            </Link>
            <Link
              href="/admin/os/leads/new"
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--dash-accent)] px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-on-accent)]"
            >
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
            <Th>Company</Th>
            <Th>Status</Th>
            <Th>Value</Th>
            <Th>Owner</Th>
            <Th>Source</Th>
            <Th>Created</Th>
            <Th>Open</Th>
            <Th>Delete</Th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const leadHref = `/admin/os/leads/${String(lead._id)}`;
            return (
              <tr key={String(lead._id)} className="group">
                <Td>
                  <Link
                    href={leadHref}
                    className="font-medium text-[var(--dash-accent)] hover:underline"
                  >
                    {lead.name}
                  </Link>
                </Td>
                <Td>
                  <Link href={leadHref} className="hover:text-[var(--dash-accent)]">
                    {lead.company || "—"}
                  </Link>
                </Td>
                <Td>
                  <OsBadge tone={leadTone(lead.status)}>
                    {LEAD_STATUS_LABELS[lead.status as LeadStatus]}
                  </OsBadge>
                  {canWrite && lead.status !== "converted" ? (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-inter text-xs text-[var(--dash-muted)]">
                        Move
                      </summary>
                      <div className="mt-2">
                        <LeadStageMoveForm
                          leadId={String(lead._id)}
                          currentEstimatedValue={lead.estimatedValue || 0}
                          compact
                          defaultToStatus={lead.status as LeadStatus}
                        />
                      </div>
                    </details>
                  ) : null}
                </Td>
                <Td>{formatCurrencyINR(lead.estimatedValue || 0)}</Td>
                <Td>{lead.assignedOwner || "—"}</Td>
                <Td>{lead.source || "—"}</Td>
                <Td>{formatDate(lead.createdAt)}</Td>
                <Td>
                  <Link
                    href={leadHref}
                    className="inline-flex min-h-9 items-center rounded-full border border-[var(--dash-border)] px-3 font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
                  >
                    Open
                  </Link>
                </Td>
                <Td>
                  {canWrite && lead.status !== "converted" ? (
                    <RowDeleteButton
                      action={archiveLead}
                      id={String(lead._id)}
                      confirmMessage={`Delete lead "${lead.name}"?`}
                    />
                  ) : null}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </OsTable>

      {leads.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No leads yet.</p>
      ) : null}

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between">
      <Link
            href={buildHref(Math.max(1, pageNum - 1))}
            className={`inline-flex min-h-11 items-center rounded-xl border px-4 font-archivo text-xs uppercase tracking-[0.08em] ${
              pageNum <= 1
                ? "pointer-events-none border-[var(--dash-border)] text-[var(--dash-muted)]"
                : "border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-hover)]"
            }`}
          >
            Prev
          </Link>
      <p className="font-inter text-sm text-[var(--dash-muted)]">
            Page {pageNum} of {totalPages}
          </p>
      <Link
            href={buildHref(Math.min(totalPages, pageNum + 1))}
            className={`inline-flex min-h-11 items-center rounded-xl border px-4 font-archivo text-xs uppercase tracking-[0.08em] ${
              pageNum >= totalPages
                ? "pointer-events-none border-[var(--dash-border)] text-[var(--dash-muted)]"
                : "border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-hover)]"
            }`}
          >
            Next
          </Link>
      </div>
      ) : null}
    </OsPage>
  );
}
