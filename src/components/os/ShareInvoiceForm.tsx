"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/actions/auth";
import { shareInvoiceByEmail } from "@/actions/os/invoices";
import { Button } from "@/components/referral/ui/button";
import { osInputClass } from "@/components/os/ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? "Sending…" : "Share by email"}
    </Button>
  );
}

export function ShareInvoiceForm({
  invoiceId,
  defaultEmail,
}: {
  invoiceId: string;
  defaultEmail?: string;
}) {
  const [state, formAction] = useActionState(
    shareInvoiceByEmail,
    {} as ActionState
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={invoiceId} />
      <div className="min-w-[200px] flex-1">
        <label className="mb-1 block font-inter text-xs text-[var(--dash-muted)]">
          Share to
        </label>
        <input
          name="email"
          type="email"
          defaultValue={defaultEmail || ""}
          placeholder="client@email.com"
          className={osInputClass()}
        />
      </div>
      <Submit />
      {state.error ? (
        <p className="w-full text-sm text-red-400">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="w-full text-sm text-emerald-400">{state.success}</p>
      ) : null}
    </form>
  );
}
