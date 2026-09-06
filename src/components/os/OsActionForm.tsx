"use client";

import { useActionState, useContext, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SalesModalContext } from "@/components/sales/SalesModal";
import type { ActionState } from "@/actions/auth";

const initial: ActionState = {};

function Submit({ label, compact }: { label: string; compact?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        compact
          ? "inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-[#111111] px-2.5 font-inter text-[12px] font-medium text-white transition hover:bg-[#222222] disabled:opacity-50"
          : "inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#111111] px-4 font-inter text-[13px] font-semibold uppercase tracking-[0.06em] text-white transition hover:bg-[#222222] disabled:opacity-50"
      }
    >
      {pending ? "…" : label}
    </button>
  );
}

export function OsActionForm({
  action,
  children,
  submitLabel = "Save",
  className = "space-y-4",
  showSubmit = true,
  compact,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  showSubmit?: boolean;
  /** Inline row actions (e.g. lead reassign) — smaller button, not full-width. */
  compact?: boolean;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, initial);
  const lastState = useRef<ActionState>(initial);
  const modal = useContext(SalesModalContext);
  useEffect(() => {
    if (state === lastState.current) return;
    lastState.current = state;
    if (state.error) toast.error(state.error);
    else if (state.success) {
      toast.success(state.success);
      modal?.close();
      router.refresh();
    }
  }, [state, modal, router]);
  return (
    <form action={formAction} className={className}>
      {children}
      {state.error ? (
        <p className="text-sm text-red-500">{state.error}</p>
      ) : null}
      {showSubmit ? <Submit label={submitLabel} compact={compact} /> : null}
    </form>
  );
}
