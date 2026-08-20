export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { Proposal } from "@/models/os/Proposal";
import { Lead } from "@/models/os/Lead";
import { OsActionForm } from "@/components/os/OsActionForm";
import { updateProposalStatus } from "@/actions/os/proposals";
import {
  OsBadge,
  OsPage,
  OsTable,
  Td,
  Th,
  osInputClass, osSelectClass,
} from "@/components/os/ui";
import { PROPOSAL_STATUSES, PROPOSAL_STATUS_LABELS, type ProposalStatus } from "@/lib/os/constants";
import { formatDateTime } from "@/lib/utils";
import { hasPermission } from "@/lib/os/permissions";

function proposalTone(status: ProposalStatus) {
  if (status === "accepted") return "ok";
  if (status === "rejected" || status === "expired") return "bad";
  if (status === "negotiation") return "accent";
  if (status === "viewed" || status === "sent") return "warn";
  return "neutral";
}

export default async function ProposalsPage() {
  const staff = await requireOsPage("proposals:read");
  const canWrite = hasPermission(staff.permissions, "proposals:write");

  const proposals = await Proposal.find({
    recordStatus: "active",
  })
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  const leadIds = proposals.map((p) => p.leadId).filter(Boolean);
  const leads = await Lead.find({ _id: { $in: leadIds } }).lean();
  const leadById = Object.fromEntries(leads.map((l) => [String(l._id), l]));

  return (
    <OsPage title="Proposals" subtitle="Proposal lifecycle. Accepted proposals drive the opportunity stage."
      backHref="/admin/os"
      backLabel="Back to dashboard">
      <OsTable>
      <thead>
      <tr>
      <Th>Proposal</Th>
      <Th>Lead</Th>
      <Th>Amount</Th>
      <Th>Status</Th>
      <Th>Updated</Th>
      <Th>Update</Th>
      </tr>
      </thead>
      <tbody>
          {proposals.map((p) => {
            const lead = leadById[String(p.leadId)];
            const status = p.status as ProposalStatus;
            return (
              <tr key={String(p._id)}>
      <Td>
      <div className="font-inter font-medium">{p.title}</div>
      <div className="mt-1 text-xs text-[var(--dash-muted)]">
                    {p.summary || "—"}
                  </div>
      </Td>
      <Td>{lead?.name || "—"}</Td>
      <Td>{p.amount || 0}</Td>
      <Td>
      <OsBadge tone={proposalTone(status)}>
                    {PROPOSAL_STATUS_LABELS[status]}
                  </OsBadge>
      </Td>
      <Td>{formatDateTime(p.updatedAt)}</Td>
      <Td>
                  {canWrite ? (
                    <OsActionForm action={updateProposalStatus} submitLabel="Update" className="space-y-2">
      <input type="hidden" name="id" value={String(p._id)} />
      <select name="status" defaultValue={p.status} className={osSelectClass()}>
                        {PROPOSAL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {PROPOSAL_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
      <input name="reason" required className={osInputClass()} placeholder="Reason / note" />
      </OsActionForm>
                  ) : (
                    <span className="text-xs text-[var(--dash-muted)]">—</span>
                  )}
                </Td>
      </tr>
            );
          })}
        </tbody>
      </OsTable>

      {proposals.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">
          No proposals yet.
        </p>
      ) : null}
    </OsPage>
  );
}

