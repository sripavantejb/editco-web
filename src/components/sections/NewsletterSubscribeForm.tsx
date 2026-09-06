"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/actions/newsletter";
import { site } from "@/content/site";
import type { ActionState } from "@/actions/auth";

const initial: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-black px-3.5 py-2 text-[9px] font-black text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-60 sm:w-auto"
    >
      {pending ? "…" : "SUBSCRIBE"}
    </button>
  );
}

export function NewsletterSubscribeForm() {
  const [state, formAction] = useActionState(subscribeNewsletter, initial);
  const last = useRef<ActionState>(initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === last.current) return;
    last.current = state;
    if (state.error) toast.error(state.error);
    else if (state.success) {
      toast.success(state.success);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-1.5">
      <div className="flex w-full max-w-sm flex-col gap-2 sm:max-w-xs">
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="Your email address"
          className="w-full min-w-0 rounded-full border-none bg-white px-3.5 py-2.5 text-[11px] text-black placeholder-black/40 focus:ring-1 focus:ring-black/10"
        />
        <SubmitButton />
      </div>
      <label className="flex items-start gap-1.5 text-[8px] font-bold leading-snug text-black/60">
        <input
          type="checkbox"
          name="agreed"
          value="true"
          required
          className="mt-0.5 h-3 w-3 shrink-0 rounded border-none bg-black/10 text-black focus:ring-transparent"
        />
        <span>I agree to receive communications from {site.name}.</span>
      </label>
      {state.error ? (
        <p className="text-[10px] font-bold text-red-700">{state.error}</p>
      ) : null}
    </form>
  );
}
