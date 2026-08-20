"use client";

import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, osInputClass } from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import { changeLeadStatus } from "@/actions/os/leads";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadStatus,
} from "@/lib/os/constants";

export function LeadStageMoveForm({
  leadId,
  currentEstimatedValue,
  compact = false,
  defaultToStatus,
  disabled = false,
  allowedStatuses,
}: {
  leadId: string;
  currentEstimatedValue: number;
  compact?: boolean;
  defaultToStatus?: LeadStatus;
  disabled?: boolean;
  allowedStatuses?: LeadStatus[];
}) {
  const options = (allowedStatuses ?? LEAD_STATUSES).filter(
    (s) => s !== "converted"
  );

  return (
    <OsActionForm
      action={changeLeadStatus}
      submitLabel="Move"
      className={compact ? "space-y-2" : "mt-3 space-y-3"}
    >
      <input type="hidden" name="id" value={leadId} />
      <input
        type="hidden"
        name="expectedValue"
        value={String(currentEstimatedValue ?? 0)}
      />

      <Field label="To status">
        <OsSelect
          name="status"
          defaultValue={defaultToStatus ?? options[0]}
          disabled={disabled}
          options={options.map((s) => ({
            value: s,
            label: LEAD_STATUS_LABELS[s],
          }))}
        />
      </Field>

      <Field label="Reason">
        <input
          name="reason"
          required
          className={osInputClass()}
          placeholder="Why are you moving this?"
          disabled={disabled}
        />
      </Field>
    </OsActionForm>
  );
}
