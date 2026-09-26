"use client";

import { useId, useState } from "react";
import { OsSelect } from "@/components/os/OsSelect";
import { OsDateInput } from "@/components/os/OsDateInput";
import { Field, osInputClass, osTextareaClass } from "@/components/os/ui";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_PAYMENT_METHODS,
  TRANSACTION_PAYMENT_METHOD_LABELS,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_LABELS,
  type TransactionType,
} from "@/lib/os/transactions";

export type TransactionFieldValues = {
  type?: TransactionType;
  title?: string;
  category?: string;
  amount?: number;
  date?: string;
  party?: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
};

export function TransactionFields({ initial = {} }: { initial?: TransactionFieldValues }) {
  const [type, setType] = useState<TransactionType>(initial.type || "expense");
  const listId = useId();

  return (
    <>
      <Field label="Type">
        <OsSelect
          name="type"
          value={type}
          onChange={(v) => setType(v as TransactionType)}
          options={TRANSACTION_TYPES.map((t) => ({ value: t, label: TRANSACTION_TYPE_LABELS[t] }))}
        />
      </Field>
      <Field label="Title">
        <input
          name="title"
          required
          defaultValue={initial.title || ""}
          placeholder={type === "income" ? "e.g. Website project – Acme" : "e.g. Figma subscription"}
          className={osInputClass()}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount (₹)">
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            defaultValue={initial.amount ?? ""}
            className={osInputClass()}
          />
        </Field>
        <Field label="Date">
          <OsDateInput
            name="date"
            required
            defaultValue={initial.date || new Date().toISOString().slice(0, 10)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <input
            name="category"
            list={listId}
            defaultValue={initial.category || ""}
            placeholder="Pick or type"
            className={osInputClass()}
          />
          <datalist id={listId}>
            {TRANSACTION_CATEGORIES[type].map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Payment method">
          <OsSelect
            name="paymentMethod"
            defaultValue={initial.paymentMethod || "upi"}
            options={TRANSACTION_PAYMENT_METHODS.map((m) => ({
              value: m,
              label: TRANSACTION_PAYMENT_METHOD_LABELS[m],
            }))}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={type === "income" ? "Received from" : "Paid to"}>
          <input name="party" defaultValue={initial.party || ""} className={osInputClass()} />
        </Field>
        <Field label="Reference / UTR">
          <input name="reference" defaultValue={initial.reference || ""} className={osInputClass()} />
        </Field>
      </div>
      <Field label="Notes">
        <textarea name="notes" rows={2} defaultValue={initial.notes || ""} className={osTextareaClass()} />
      </Field>
    </>
  );
}
