"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, ArrowRight, Hash, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
import { startTracking, type TrackFormState } from "@/actions/os/track";
import { TRACK_REQUIRE_EMAIL } from "@/lib/os/tracking-stages";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[var(--dash-accent)] px-6 py-3.5 font-archivo text-sm font-bold uppercase tracking-[0.08em] text-[#0a0a0a] shadow-[0_0_24px_rgba(200,245,66,0.3)] transition-all duration-200 hover:bg-[var(--dash-accent-hover)] hover:shadow-[0_0_32px_rgba(200,245,66,0.45)] active:scale-[0.99] disabled:opacity-60 disabled:shadow-none"
    >
      <span className="relative z-10 flex items-center gap-2">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-[#0a0a0a]" />
            Verifying Code...
          </>
        ) : (
          <>
            Track My Project
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </>
        )}
      </span>
    </button>
  );
}

export function TrackLoginForm({ defaultCode = "" }: { defaultCode?: string }) {
  const [state, formAction] = useActionState<TrackFormState, FormData>(
    startTracking,
    undefined
  );
  const [codeValue, setCodeValue] = useState(defaultCode);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-1.5">
        <label
          htmlFor="code"
          className="flex items-center justify-between font-archivo text-[11px] uppercase tracking-[0.14em] text-white/70"
        >
          <span className="flex items-center gap-1.5">
            <KeyRound className="h-3 w-3 text-[var(--dash-accent)]" />
            Tracking Code
          </span>
          <span className="font-mono text-[10px] text-white/40">e.g. ECM-2026-001</span>
        </label>
        <div className="relative">
          <input
            id="code"
            name="code"
            required
            autoFocus
            autoComplete="off"
            spellCheck={false}
            value={codeValue}
            onChange={(e) => setCodeValue(e.target.value.toUpperCase())}
            placeholder="ECM-2026-001"
            className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 font-mono text-[16px] uppercase tracking-[0.12em] text-white placeholder:font-sans placeholder:tracking-normal placeholder:text-white/30 transition-all duration-150 focus:border-[var(--dash-accent)] focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-[var(--dash-accent)]/50"
          />
        </div>
      </div>

      {TRACK_REQUIRE_EMAIL ? (
        <div className="grid gap-1.5">
          <label
            htmlFor="email"
            className="flex items-center gap-1.5 font-archivo text-[11px] uppercase tracking-[0.14em] text-white/70"
          >
            <Mail className="h-3 w-3 text-[var(--dash-accent)]" />
            Email on your project
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 font-inter text-[15px] text-white placeholder:text-white/30 transition-all duration-150 focus:border-[var(--dash-accent)] focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-[var(--dash-accent)]/50"
          />
        </div>
      ) : null}

      {state?.error ? (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 font-inter text-sm text-rose-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <SubmitButton />

      <p className="flex items-start gap-2 pt-1 font-inter text-[11px] leading-relaxed text-white/45">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--dash-accent)]/70" />
        <span>
          {TRACK_REQUIRE_EMAIL
            ? "We verify both code and email to ensure your project details remain strictly confidential."
            : "Keep your code confidential — anyone with this code can view milestone status & invoices."}
        </span>
      </p>
    </form>
  );
}
