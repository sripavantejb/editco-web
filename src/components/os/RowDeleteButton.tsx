"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ActionState } from "@/actions/auth";

const initial: ActionState = {};

function DeleteSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--dash-muted)] transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

export function RowDeleteButton({
  action,
  id,
  confirmMessage = "Delete this item? This cannot be undone from the list.",
  label = "Delete",
  className,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  id: string;
  confirmMessage?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, initial);
  const lastState = useRef<ActionState>(initial);

  useEffect(() => {
    if (state === lastState.current) return;
    lastState.current = state;
    if (state.error) toast.error(state.error);
    else if (state.success) {
      toast.success(state.success);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className={className}
      onClick={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <DeleteSubmit label={label} />
    </form>
  );
}
