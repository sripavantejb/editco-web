export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { Lead } from "@/models/os/Lead";
import { OsActionForm } from "@/components/os/OsActionForm";
import { createCall } from "@/actions/os/calls";
import { OsPage, OsTable, Td, Th, OsBadge, leadTone, osInputClass, osSelectClass } from "@/components/os/ui";
import { OsDateInput } from "@/components/os/OsDateInput";
import {
  CALL_OUTCOMES,
  LEAD_STATUS_LABELS,
  type LeadStatus,
} from "@/lib/os/constants";
import { formatDateTime } from "@/lib/utils";
import { hasPermission } from "@/lib/os/permissions";

function toDateTimeLocalValue(d: Date | string | undefined) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export default async function CallingPage() {
  const staff = await requireOsPage("calls:read");
  const canWrite = hasPermission(staff.permissions, "calls:write");

  const now = new Date();
  const defaultStart = toDateTimeLocalValue(now);
  const defaultFollowUp = toDateTimeLocalValue(
    new Date(now.getTime() + 2 * 86400000)
  );

  const leads = await Lead.find({
    recordStatus: "active",
    status: { $in: ["new", "contacted", "qualified"] },
  })
    .sort({ updatedAt: -1 })
    .limit(30)
    .lean();

  return (
    <OsPage title="Calling" subtitle="Record cold calls and drive follow-ups."
      backHref="/admin/os"
      backLabel="Back to dashboard">
      <OsTable>
      <thead>
      <tr>
      <Th>Lead</Th>
      <Th>Status</Th>
      <Th>Contact</Th>
      <Th>Call outcome</Th>
      </tr>
      </thead>
      <tbody>
          {leads.map((lead) => (
            <tr key={String(lead._id)}>
      <Td>
      <div className="font-inter">
      <span className="font-medium text-[var(--dash-text)]">{lead.name}</span>
      </div>
      <div className="mt-1 text-xs text-[var(--dash-muted)]">{lead.company || lead.assignedOwner || "—"}</div>
      </Td>
      <Td>
      <OsBadge tone={leadTone(lead.status as string)}>
                  {LEAD_STATUS_LABELS[lead.status as LeadStatus]}
                </OsBadge>
      </Td>
      <Td>
      <div className="text-xs text-[var(--dash-muted)]">
                  {lead.phone || "—"}
                  <br />
                  {lead.email || ""}
                </div>
      </Td>
      <Td>
                {canWrite ? (
                  <OsActionForm action={createCall} submitLabel="Record call" className="space-y-3">
      <input type="hidden" name="leadId" value={String(lead._id)} />
      <input type="hidden" name="callerId" value={staff.userId} />
      <div className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-1.5 sm:col-span-2">
      <span className="font-inter text-xs text-[var(--dash-muted)]">Outcome</span>
      <select name="outcome" defaultValue={"connected"} className={osSelectClass()}>
                          {CALL_OUTCOMES.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
      </label>
      <label className="space-y-1.5">
      <span className="font-inter text-xs text-[var(--dash-muted)]">Started</span>
      <OsDateInput name="startedAt" type="datetime-local" required defaultValue={defaultStart} />
      </label>
      <label className="space-y-1.5">
      <span className="font-inter text-xs text-[var(--dash-muted)]">Ended (optional)</span>
      <OsDateInput name="endedAt" type="datetime-local" />
      </label>
      <label className="space-y-1.5 sm:col-span-2">
      <span className="font-inter text-xs text-[var(--dash-muted)]">Notes</span>
      <input name="notes" className={osInputClass()} placeholder="Short call notes" />
      </label>
      <label className="space-y-1.5 sm:col-span-2">
      <span className="font-inter text-xs text-[var(--dash-muted)]">Next follow-up (only for follow-up required)</span>
      <OsDateInput name="nextFollowUpAt" type="datetime-local" defaultValue={defaultFollowUp} />
      </label>
      </div>
      </OsActionForm>
                ) : (
                  <p className="text-xs text-[var(--dash-muted)]">No permission to record calls.</p>
                )}
              </Td>
      </tr>
          ))}
        </tbody>
      </OsTable>

      {leads.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No leads ready for calling.</p>
      ) : null}
    </OsPage>
  );
}

