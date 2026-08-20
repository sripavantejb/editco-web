"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/referral/ui/button";
import type { ActionState } from "@/actions/auth";

const initial: ActionState = {};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function OsActionForm({
  action,
  children,
  submitLabel = "Save",
  className = "space-y-4",
  showSubmit = true,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  showSubmit?: boolean;
}) {
  const [state, formAction] = useActionState(action, initial);
  return (
    <form action={formAction} className={className}>
      {children}
      {state.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-emerald-400">{state.success}</p>
      ) : null}
      {showSubmit ? <Submit label={submitLabel} /> : null}
    </form>
  );
}
