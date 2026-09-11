"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { startTracking, type TrackFormState } from "@/actions/os/track";
import { TRACK_REQUIRE_EMAIL } from "@/lib/os/tracking-stages";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dash-accent)] px-5 py-3 font-archivo text-sm font-semibold uppercase tracking-[0.08em] text-[#0c0c0c] transition-all hover:bg-[var(--dash-accent-hover)] disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking
        </>
      ) : (
        <>
          Track my project
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}

export function TrackLoginForm({ defaultCode = "" }: { defaultCode?: string }) {
  const [state, formAction] = useActionState<TrackFormState, FormData>(
    startTracking,
    undefined
  );

  return (
    <form action={formAction} className="grid gap-3">
      <div className="grid gap-1.5">
        <label
          htmlFor="code"
          className="font-archivo text-[11px] uppercase tracking-[0.16em] text-[var(--dash-faint)]"
        >
          Tracking code
        </label>
        <input
          id="code"
          name="code"
          required
          autoComplete="off"
          spellCheck={false}
          defaultValue={defaultCode}
          placeholder="ECM2026001"
          className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-3 font-mono text-[15px] uppercase tracking-[0.12em] text-[var(--dash-text)] placeholder:tracking-normal placeholder:text-[var(--dash-faint)] focus:border-[var(--dash-accent)] focus:outline-none"
        />
      </div>
      {TRACK_REQUIRE_EMAIL ? (
        <div className="grid gap-1.5">
          <label
            htmlFor="email"
            className="font-archivo text-[11px] uppercase tracking-[0.16em] text-[var(--dash-faint)]"
          >
            Email on your project
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-3 font-inter text-[15px] text-[var(--dash-text)] placeholder:text-[var(--dash-faint)] focus:border-[var(--dash-accent)] focus:outline-none"
          />
        </div>
      ) : null}

      {state?.error ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 font-inter text-sm text-rose-200"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton />

      <p className="flex items-start gap-2 font-inter text-xs leading-relaxed text-[var(--dash-faint)]">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {TRACK_REQUIRE_EMAIL
          ? "We ask for both so a forwarded code can't expose your project. Access lasts 7 days on this device."
          : "Keep your code private — anyone who has it can view your project. Access lasts 7 days on this device."}
      </p>
    </form>
  );
}
