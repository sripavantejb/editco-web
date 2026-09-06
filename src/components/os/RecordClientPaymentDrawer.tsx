"use client";

import { recordClientPayment } from "@/actions/os/payments";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsSlideOver } from "@/components/os/OsSlideOver";
import { Field, osInputClass, osTextareaClass } from "@/components/os/ui";
import { OsDateInput } from "@/components/os/OsDateInput";
import { OsSelect } from "@/components/os/OsSelect";

const METHODS = [
  { value: "bank", label: "Bank transfer" },
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

export function RecordClientPaymentDrawer({ vendorId }: { vendorId: string }) {
  return (
    <OsSlideOver
      triggerLabel="Record money"
      title="Record money received"
      subtitle="Adds to Received on this client and Editco OS revenue."
      triggerClassName="inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 font-inter text-sm text-white hover:bg-black/90"
    >
      <OsActionForm
        action={recordClientPayment}
        submitLabel="Add to Received"
        className="grid gap-3"
      >
        <input type="hidden" name="vendorId" value={vendorId} />
        <Field label="Amount (₹)">
          <input
            name="amount"
            type="number"
            min="1"
            step="0.01"
            required
            placeholder="e.g. 50000"
            className={osInputClass()}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Date">
            <OsDateInput name="paidAt" />
          </Field>
          <Field label="Method">
            <OsSelect name="method" defaultValue="bank" options={METHODS} />
          </Field>
        </div>
        <Field label="Reference">
          <input
            name="reference"
            placeholder="UTR / cheque no. / txn id"
            className={osInputClass()}
          />
        </Field>
        <Field label="Notes">
          <textarea
            name="notes"
            rows={2}
            placeholder="What this payment is for"
            className={osTextareaClass()}
          />
        </Field>
      </OsActionForm>
    </OsSlideOver>
  );
}
