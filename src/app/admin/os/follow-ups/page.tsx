export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { FollowUp } from "@/models/os/FollowUp";
import { Lead } from "@/models/os/Lead";
import { formatDateTime } from "@/lib/utils";
import { OsActionForm } from "@/components/os/OsActionForm";
import { updateFollowUpStatus } from "@/actions/os/followups";
import { OsPage, OsTable, Td, Th, OsBadge } from "@/components/os/ui";
import { OsDateInput } from "@/components/os/OsDateInput";

function toDateTimeLocalValue(d: Date | string | undefined) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export default async function FollowUpsPage() {
  await requireOsPage("followups:read");

  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 86400000);

  const followUps = await FollowUp.find({
    recordStatus: "active",
    status: { $in: ["pending", "rescheduled"] },
    dueAt: { $lte: in7 },
  })
    .sort({ dueAt: 1 })
    .limit(50)
    .lean();

  const leadIds = followUps.map((f) => f.leadId).filter(Boolean);
  const leads = await Lead.find({ _id: { $in: leadIds } }).lean();
  const leadById = Object.fromEntries(leads.map((l) => [String(l._id), l]));

  return (
    <OsPage title="Follow-ups" subtitle="Due follow-ups across the sales pipeline."
      backHref="/admin/os"
      backLabel="Back to dashboard">
      <OsTable>
      <thead>
      <tr>
      <Th>Lead</Th>
      <Th>Due</Th>
      <Th>Status</Th>
      <Th>Actions</Th>
      </tr>
      </thead>
      <tbody>
          {followUps.map((f) => {
            const lead = leadById[String(f.leadId)];
            return (
              <tr key={String(f._id)}>
                <Td>
                  {lead ? (
                    <Link
                      href={`/admin/os/leads/${lead._id}`}
                      className="text-[var(--dash-accent)] hover:underline"
                    >
                      {lead.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </Td>
      <Td>{formatDateTime(f.dueAt)}</Td>
      <Td>
      <OsBadge tone={f.status === "completed" ? "ok" : "accent"}>
                    {f.status}
                  </OsBadge>
      </Td>
      <Td>
      <div className="flex flex-wrap items-start gap-2">
      <div className="w-40">
      <OsActionForm action={updateFollowUpStatus} submitLabel="Complete">
      <input type="hidden" name="id" value={String(f._id)} />
      <input type="hidden" name="status" value="completed" />
      </OsActionForm>
      </div>
      <div className="w-64">
      <OsActionForm action={updateFollowUpStatus} submitLabel="Reschedule">
      <input type="hidden" name="id" value={String(f._id)} />
      <input type="hidden" name="status" value="rescheduled" />
      <OsDateInput
                          name="dueAt"
                          type="datetime-local"
                          required
                          defaultValue={toDateTimeLocalValue(f.dueAt)}
                        />
      </OsActionForm>
      </div>
      </div>
      </Td>
      </tr>
            );
          })}
        </tbody>
      </OsTable>

      {followUps.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No follow-ups due soon.</p>
      ) : null}
    </OsPage>
  );
}

