"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/referral/ui/button";
import {
  importLeadsCsv,
  type LeadImportResult,
} from "@/actions/os/lead-import";
import { osInputClass } from "@/components/os/ui";

const initial: LeadImportResult = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Importing..." : "Import leads"}
    </Button>
  );
}

export function LeadCsvImportForm() {
  const [state, formAction] = useActionState(importLeadsCsv, initial);

  return (
    <div className="max-w-2xl space-y-6">
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="lead-csv-file"
            className="mb-2 block font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)]"
          >
            CSV file
          </label>
          <input
            id="lead-csv-file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className={osInputClass()}
          />
          <p className="mt-2 font-inter text-xs text-[var(--dash-muted)]">
            Export your Excel sheet as CSV (File → Save As → CSV). Max 500 rows
            per upload. Rows with an existing phone or email are skipped.
          </p>
        </div>
        <Submit />
      </form>

      {state.error ? (
        <p className="font-inter text-sm text-red-400">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="font-inter text-sm text-emerald-400">{state.success}</p>
      ) : null}

      {typeof state.created === "number" ? (
        <div className="rounded-xl border border-[var(--dash-border)] p-4 space-y-3">
          <p className="font-inter text-sm text-[var(--dash-text)]">
            Created: <strong>{state.created}</strong>
            {" · "}
            Skipped duplicates: <strong>{state.skipped ?? 0}</strong>
          </p>
          {state.created > 0 ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/os/leads?status=new"
                className="inline-flex min-h-10 items-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
              >
                View new leads
              </Link>
              <Link
                href="/admin/os/calling"
                className="inline-flex min-h-10 items-center rounded-full bg-[var(--dash-accent)] px-4 font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-on-accent)]"
              >
                Open calling
              </Link>
            </div>
          ) : null}
          {state.errors && state.errors.length > 0 ? (
            <div>
              <p className="mb-2 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)]">
                Row details (up to 50)
              </p>
              <ul className="max-h-64 overflow-auto space-y-1 font-inter text-xs text-[var(--dash-muted)]">
                {state.errors.map((e, idx) => (
                  <li key={`${e.row}-${idx}`}>
                    Row {e.row}: {e.reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
