"use client";

import Link from "next/link";
import { useState } from "react";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, OsBadge, leadTone, osInputClass } from "@/components/os/ui";
import { changeLeadStatus } from "@/actions/os/leads";
import { LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/os/constants";

type LeanLead = {
  _id: string;
  name: string;
  company?: string;
  assignedOwner?: string;
  estimatedValue?: number;
  status: LeadStatus;
};

export function PipelineBoard({
  columns,
  leadsByStatus,
  canWrite,
}: {
  columns: LeadStatus[];
  leadsByStatus: Record<string, LeanLead[]>;
  canWrite: boolean;
}) {
  const [pending, setPending] = useState<null | {
    leadId: string;
    toStatus: LeadStatus;
    expectedValue: number;
    fromStatus: LeadStatus;
  }>(null);

  return (
    <>
      {pending && canWrite ? (
        <div className="mb-4 rounded-[20px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
          <p className="font-archivo text-xs uppercase tracking-wide text-[var(--dash-faint)]">
            Move lead
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <OsBadge tone={leadTone(pending.toStatus)}>{LEAD_STATUS_LABELS[pending.toStatus]}</OsBadge>
            <p className="font-inter text-sm text-[var(--dash-muted)]">
              Reason is required
            </p>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setPending(null)}
              className="inline-flex min-h-10 items-center rounded-xl border border-[var(--dash-border)] px-3 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)] hover:bg-[var(--dash-hover)]"
            >
              Cancel
            </button>
          </div>
          <div className="mt-3">
            <OsActionForm
              action={changeLeadStatus}
              submitLabel="Confirm move"
              className="space-y-3"
            >
              <input type="hidden" name="id" value={pending.leadId} />
              <input type="hidden" name="status" value={pending.toStatus} />
              <input type="hidden" name="expectedValue" value={String(pending.expectedValue)} />
              <Field label="Reason">
                <input name="reason" required className={osInputClass()} placeholder="e.g. Met stakeholder / proposal sent" />
              </Field>
            </OsActionForm>
          </div>
        </div>
      ) : null}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((status) => {
          const col = leadsByStatus[status] || [];
          const value = col.reduce((s, l) => s + (l.estimatedValue || 0), 0);
          return (
            <div
              key={status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                if (!canWrite) return;
                const raw = e.dataTransfer.getData("application/json");
                if (!raw) return;
                try {
                  const parsed = JSON.parse(raw) as {
                    leadId: string;
                    expectedValue: number;
                    fromStatus: LeadStatus;
                  };
                  setPending({
                    leadId: parsed.leadId,
                    expectedValue: parsed.expectedValue || 0,
                    toStatus: status,
                    fromStatus: parsed.fromStatus,
                  });
                } catch {
                  // ignore
                }
              }}
              className="w-64 shrink-0 rounded-[20px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-archivo text-[11px] uppercase tracking-wide">
                  {LEAD_STATUS_LABELS[status]}
                </p>
                <span className="font-inter text-[11px] text-[var(--dash-faint)]">
                  {col.length}
                </span>
              </div>
              <p className="mb-3 font-inter text-xs text-[var(--dash-muted)]">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(value)}
              </p>

              <div className="space-y-2">
                {col.map((lead) => (
                  <div
                    key={String(lead._id)}
                    draggable={canWrite}
                    onDragStart={(e) => {
                      if (!canWrite) return;
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({
                          leadId: String(lead._id),
                          expectedValue: lead.estimatedValue || 0,
                          fromStatus: lead.status,
                        })
                      );
                    }}
                    className={`rounded-xl border border-[var(--dash-border)] p-3 hover:bg-[var(--dash-hover)] ${
                      pending?.leadId === String(lead._id)
                        ? "opacity-80"
                        : ""
                    }`}
                  >
                    <Link href={`/admin/os/leads/${lead._id}`} className="block">
                      <p className="font-inter text-sm text-[var(--dash-text)]">
                        {lead.name}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
                        {lead.company || lead.assignedOwner}
                      </p>
                    </Link>

                    <div className="mt-2">
                      <OsBadge tone={leadTone(lead.status)}>{LEAD_STATUS_LABELS[lead.status]}</OsBadge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

