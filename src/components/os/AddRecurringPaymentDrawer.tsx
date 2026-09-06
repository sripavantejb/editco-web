"use client";

import { createRecurringPayment } from "@/actions/os/recurring-payments";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsSlideOver } from "@/components/os/OsSlideOver";
import { Field, osInputClass, osTextareaClass } from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import { OsDateInput } from "@/components/os/OsDateInput";
import {
  RECURRING_PAYMENT_FREQUENCIES,
  RECURRING_PAYMENT_FREQUENCY_LABELS,
} from "@/lib/os/recurring-payments";

export function AddRecurringPaymentDrawer() {
  return (
    <OsSlideOver
      triggerLabel="Add recurring payment"
      title="Add recurring payment"
      subtitle="Saving sends an alert to finance + super admins."
      wide
    >
      <OsActionForm
        action={createRecurringPayment}
        submitLabel="Add recurring payment"
        className="grid gap-3"
      >
        <Field label="Title">
          <input
            name="title"
            required
            placeholder="e.g. AWS · Google Workspace · Domain"
            className={osInputClass()}
          />
        </Field>
        <Field label="Payee / vendor">
          <input name="payee" placeholder="Who gets paid" className={osInputClass()} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Amount (₹)">
            <input
              name="amount"
              type="number"
              min="1"
              step="0.01"
              required
              className={osInputClass()}
            />
          </Field>
          <Field label="Frequency">
            <OsSelect
              name="frequency"
              defaultValue="monthly"
              options={RECURRING_PAYMENT_FREQUENCIES.map((f) => ({
                value: f,
                label: RECURRING_PAYMENT_FREQUENCY_LABELS[f],
              }))}
            />
          </Field>
          <Field label="Next due">
            <OsDateInput name="nextDueAt" required />
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            name="notes"
            rows={2}
            placeholder="Account, card used, invoice email…"
            className={osTextareaClass()}
          />
        </Field>
        <p className="font-inter text-xs text-[#6b7280]">
          Saving sends an alert to finance + super admins as a reminder.
        </p>
      </OsActionForm>
    </OsSlideOver>
  );
}
