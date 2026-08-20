export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireOsPage } from "@/lib/os/page";
import { Lead } from "@/models/os/Lead";
import { LeadActivity } from "@/models/os/LeadActivity";
import { Conversion } from "@/models/os/Conversion";
import { Referral } from "@/models/Referral";
import { changeLeadStatus, updateLeadDetails } from "@/actions/os/leads";
import { createProposal } from "@/actions/os/proposals";
import { createFollowUp } from "@/actions/os/followups";
import { Proposal } from "@/models/os/Proposal";
import { FollowUp } from "@/models/os/FollowUp";
import { LeadProjectPitch } from "@/models/os/LeadProjectPitch";
import { VaultProject } from "@/models/os/VaultProject";
import { VaultProjectMessage } from "@/models/os/VaultProjectMessage";
import { LeadPitchesPanel } from "@/components/os/LeadPitchesPanel";
import { OsActionForm } from "@/components/os/OsActionForm";
import {
  Field,
  OsLink,
  OsPage,
  OsBadge,
  osInputClass,
  osTextareaClass,
} from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import { OsDateInput } from "@/components/os/OsDateInput";
import {
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  PROPOSAL_STATUS_LABELS,
  type ProposalStatus,
} from "@/lib/os/constants";
import { STAGE_LABELS, type Stage } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { canAccessLegacyAdmin, hasPermission } from "@/lib/os/permissions";
import Link from "next/link";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireOsPage("leads:read");
  const { id } = await params;
  const lead = await Lead.findById(id).lean();
  if (!lead) notFound();
  const activities = await LeadActivity.find({ leadId: lead._id })
    .sort({ createdAt: -1 })
    .lean();
  const conversion = lead.conversionId
    ? await Conversion.findById(lead.conversionId).lean()
    : null;
  const canWrite = hasPermission(staff.permissions, "leads:write");
  const canConvert = hasPermission(staff.permissions, "conversions:write");

  const referral =
    lead.referralId && canAccessLegacyAdmin(staff.role)
      ? await Referral.findById(lead.referralId).lean()
      : null;
  const proposals = await Proposal.find({
    leadId: lead._id,
    recordStatus: "active",
  })
    .sort({ updatedAt: -1 })
    .lean();
  const followUps = await FollowUp.find({
    leadId: lead._id,
    recordStatus: "active",
  })
    .sort({ dueAt: 1 })
    .limit(20)
    .lean();
  const canPropose = hasPermission(staff.permissions, "proposals:write");
  const canFollowUp = hasPermission(staff.permissions, "followups:write");

  const pitches = await LeadProjectPitch.find({
    leadId: lead._id,
    recordStatus: "active",
  })
    .sort({ pitchedAt: -1 })
    .lean();
  const pitchProjectIds = pitches.map((p) => p.projectId);
  const [vaultProjects, vaultMessages] = await Promise.all([
    VaultProject.find({
      recordStatus: "active",
      status: "active",
    })
      .sort({ name: 1 })
      .select({ name: 1, category: 1, productionUrl: 1 })
      .lean(),
    pitchProjectIds.length
      ? VaultProjectMessage.find({ projectId: { $in: pitchProjectIds } }).lean()
      : Promise.resolve([]),
  ]);
  const vaultById = new Map(
    (
      await VaultProject.find({
        _id: { $in: pitchProjectIds },
      })
        .select({ name: 1, productionUrl: 1 })
        .lean()
    ).map((p) => [String(p._id), p])
  );
  const messageBodies: Record<
    string,
    Partial<Record<string, { subject?: string; body?: string }>>
  > = {};
  for (const m of vaultMessages) {
    const pid = String(m.projectId);
    if (!messageBodies[pid]) messageBodies[pid] = {};
    messageBodies[pid][m.type] = {
      subject: m.subject || "",
      body: m.body || "",
    };
  }

  function proposalTone(status: ProposalStatus) {
    if (status === "accepted") return "ok";
    if (status === "rejected" || status === "expired") return "bad";
    if (status === "negotiation") return "accent";
    if (status === "viewed" || status === "sent") return "warn";
    return "neutral";
  }

  return (
    <OsPage
      title={lead.name}
      subtitle={lead.company || "No company"}
      backHref="/admin/os/leads"
      backLabel="Back to leads"
      actions={
        <>
          {conversion ? (
            <OsLink href={`/admin/os/c/${conversion.publicCode}`}>Open conversion</OsLink>
          ) : canConvert && lead.status !== "converted" ? (
            <OsLink href={`/admin/os/leads/${id}/convert`}>Convert lead</OsLink>
          ) : null}
        </>
      }
    >      {referral ? (
        <div className="mb-6 rounded-2xl border border-[var(--dash-border)] p-4">
      <p className="text-xs text-[var(--dash-faint)]">Refer & Earn source</p>
      <p className="mt-1 font-inter text-sm">
      <OsLink href={`/admin/referrals/${String(referral._id)}`}>
              {referral.referredName}
            </OsLink>{" "}
            · {STAGE_LABELS[referral.stage as Stage]}{" "}
            {referral.rewardAmount ? `· ₹${referral.rewardAmount}` : null}
          </p>
      </div>
      ) : null}
      {canWrite && lead.status !== "converted" ? (
        <div className="grid gap-8 lg:grid-cols-2">
      <section>
      <h2 className="mb-4 font-archivo text-sm uppercase">Details</h2>
      <OsActionForm action={updateLeadDetails}>
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Company"><input name="company" defaultValue={lead.company} className={osInputClass()} /></Field>
      <Field label="Phone"><input name="phone" defaultValue={lead.phone} className={osInputClass()} /></Field>
      <Field label="Email"><input name="email" defaultValue={lead.email} className={osInputClass()} /></Field>
                <Field label="Source">
                  <OsSelect
                    name="source"
                    defaultValue={lead.source}
                    options={LEAD_SOURCES.map((s) => ({ value: s, label: s }))}
                  />
                </Field>
                <Field label="Industry"><input name="industry" defaultValue={lead.industry} className={osInputClass()} /></Field>
                <Field label="Estimated value"><input name="estimatedValue" type="number" defaultValue={lead.estimatedValue} className={osInputClass()} /></Field>
                <Field label="Owner"><input name="assignedOwner" defaultValue={lead.assignedOwner} className={osInputClass()} /></Field>
                <Field label="Priority">
                  <OsSelect
                    name="priority"
                    defaultValue={lead.priority}
                    options={LEAD_PRIORITIES.map((s) => ({ value: s, label: s }))}
                  />
                </Field>
      <div className="sm:col-span-2">
      <Field label="Requirement"><textarea name="requirement" defaultValue={lead.requirement} className={osTextareaClass()} /></Field>
      </div>
      <div className="sm:col-span-2">
      <Field label="Notes"><textarea name="notes" defaultValue={lead.notes} className={osTextareaClass()} /></Field>
      </div>
      </div>
      </OsActionForm>
      </section>
      <section>
      <h2 className="mb-4 font-archivo text-sm uppercase">Move status</h2>
      <p className="mb-3 font-inter text-sm text-[var(--dash-muted)]">
              Status changes must record who, when, and why. Converted is only available via the conversion wizard.
            </p>
      <OsActionForm action={changeLeadStatus} submitLabel="Record move">
      <input type="hidden" name="id" value={id} />
              <Field label="New status">
                <OsSelect
                  name="status"
                  defaultValue={lead.status}
                  options={LEAD_STATUSES.filter((s) => s !== "converted").map((s) => ({
                    value: s,
                    label: LEAD_STATUS_LABELS[s],
                  }))}
                />
              </Field>
      <Field label="Reason">
      <input name="reason" required className={osInputClass()} placeholder="Proposal sent" />
      </Field>
      <Field label="Expected value (₹)">
      <input name="expectedValue" type="number" defaultValue={lead.estimatedValue} className={osInputClass()} />
      </Field>
      </OsActionForm>
      </section>
      </div>
      ) : (
        <p className="font-inter text-sm text-[var(--dash-muted)]">
          {LEAD_STATUS_LABELS[lead.status as keyof typeof LEAD_STATUS_LABELS]} · {lead.email} · {lead.phone}
        </p>
      )}

      <section className="mt-10">
      <h2 className="mb-4 font-archivo text-sm uppercase">Activity</h2>
      <ol className="space-y-3">
          {activities.map((a) => (
            <li key={String(a._id)} className="border-l border-[var(--dash-border)] pl-4 font-inter text-sm">
      <p className="text-[var(--dash-text)]">
                {a.eventType === "status_change"
                  ? `Lead moved: ${a.fromStatus} → ${a.toStatus}`
                  : a.eventType}
              </p>
      <p className="text-[var(--dash-muted)]">
                {a.createdBy} · {formatDateTime(a.createdAt)}
                {a.reason ? ` · ${a.reason}` : ""}
                {a.expectedValue ? ` · ₹${a.expectedValue}` : ""}
              </p>
      </li>
          ))}
        </ol>
      </section>
      <section className="mt-10">
        <h2 className="mb-4 font-archivo text-sm uppercase">Follow-ups</h2>
        {followUps.length === 0 ? (
          <p className="mb-4 font-inter text-sm text-[var(--dash-muted)]">
            No follow-ups yet.
          </p>
        ) : (
          <ul className="mb-6 space-y-2">
            {followUps.map((f) => (
              <li
                key={String(f._id)}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--dash-border)] px-4 py-3 font-inter text-sm"
              >
                <span>
                  {formatDateTime(f.dueAt)}
                  {f.notes ? ` · ${f.notes}` : ""}
                </span>
                <OsBadge tone={f.status === "completed" ? "ok" : "accent"}>
                  {f.status}
                </OsBadge>
              </li>
            ))}
          </ul>
        )}
        {canFollowUp && lead.status !== "converted" ? (
          <OsActionForm
            action={createFollowUp}
            submitLabel="Schedule follow-up"
            className="grid max-w-xl gap-3 sm:grid-cols-2"
          >
            <input type="hidden" name="leadId" value={id} />
            <Field label="Due at">
              <OsDateInput name="dueAt" type="datetime-local" required />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes (optional)">
                <input
                  name="notes"
                  className={osInputClass()}
                  placeholder="Call back / send proposal / wait for docs"
                />
              </Field>
            </div>
          </OsActionForm>
        ) : null}
        <p className="mt-3 font-inter text-xs text-[var(--dash-muted)]">
          Tip: you can also schedule a follow-up from{" "}
          <Link href="/admin/os/calling" className="text-[var(--dash-accent)]">
            Calling
          </Link>{" "}
          when the call outcome is “follow up required”.
        </p>
      </section>

      <LeadPitchesPanel
        leadId={id}
        leadName={lead.name}
        leadCompany={lead.company || ""}
        leadPhone={lead.phone || ""}
        senderName={staff.name || staff.email}
        canWrite={canWrite && lead.status !== "converted"}
        canConvert={canConvert && lead.status !== "converted"}
        pitches={pitches.map((p) => {
          const vp = vaultById.get(String(p.projectId));
          return {
            id: String(p._id),
            projectId: String(p.projectId),
            projectName: p.projectName || vp?.name || "Project",
            status: p.status as import("@/lib/os/constants").PitchStatus,
            pitchedBy: p.pitchedBy || "",
            pitchedAt: formatDateTime(p.pitchedAt || p.createdAt),
            notes: p.notes || "",
            attemptCount: p.attemptCount || 1,
            productionUrl: vp?.productionUrl || "",
          };
        })}
        vaultProjects={vaultProjects.map((p) => ({
          id: String(p._id),
          name: p.name,
          category: p.category || "",
        }))}
        messageBodies={messageBodies}
      />

      <section className="mt-10">
        <h2 className="mb-4 font-archivo text-sm uppercase">Proposals</h2>

        {proposals.length === 0 ? (
          <p className="font-inter text-sm text-[var(--dash-muted)]">No proposals yet.</p>
        ) : (
          <div className="space-y-3">
            {proposals.map((p) => (
              <div
                key={String(p._id)}
                className="rounded-2xl border border-[var(--dash-border)] p-4"
              >
      <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="font-inter font-medium text-[var(--dash-text)]">{p.title}</p>
      <OsBadge tone={proposalTone(p.status as ProposalStatus)}>
                    {PROPOSAL_STATUS_LABELS[p.status as ProposalStatus]}
                  </OsBadge>
      </div>
      <p className="mt-1 font-inter text-xs text-[var(--dash-muted)]">
                  ₹{p.amount || 0} · {formatDateTime(p.updatedAt)}
                </p>
                {p.summary ? (
                  <p className="mt-2 font-inter text-sm text-[var(--dash-muted)]">{p.summary}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {canPropose && lead.status !== "converted" ? (
          <div className="mt-6">
      <OsActionForm
              action={createProposal}
              submitLabel="Create proposal"
              className="grid max-w-3xl gap-3 sm:grid-cols-2"
            >
      <input type="hidden" name="leadId" value={id} />
      <input type="hidden" name="status" value="sent" />
      <Field label="Title">
      <input
                  name="title"
                  required
                  defaultValue={`Proposal for ${lead.company || lead.name}`}
                  className={osInputClass()}
                />
      </Field>
      <Field label="Amount (₹)">
      <input
                  name="amount"
                  type="number"
                  required
                  defaultValue={lead.estimatedValue || 0}
                  className={osInputClass()}
                />
      </Field>
      <div className="sm:col-span-2">
      <Field label="Summary">
      <textarea
                    name="summary"
                    defaultValue={lead.requirement || ""}
                    className={osTextareaClass()}
                  />
      </Field>
      </div>
      </OsActionForm>
      </div>
        ) : null}
      </section>
      </OsPage>
  );
}
