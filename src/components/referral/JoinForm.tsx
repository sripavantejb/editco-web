"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { joinAsReferrer, continueWithEmail, type ActionState } from "@/actions/auth";
import { Button } from "@/components/referral/ui/button";
import { Input } from "@/components/referral/ui/input";
import { Label } from "@/components/referral/ui/label";

const initial: ActionState = {};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      className="mt-1 h-11 w-full rounded-full bg-[var(--refer-accent,#c8f542)] font-inter text-sm font-semibold normal-case tracking-normal text-black hover:bg-[var(--refer-accent-hover,#b8e636)] hover:text-black"
      disabled={pending}
    >
      {pending ? "Please wait..." : label}
    </Button>
  );
}

export function JoinForm({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<"join" | "continue">("join");
  const [joinState, joinAction] = useActionState(joinAsReferrer, initial);
  const [continueState, continueAction] = useActionState(
    continueWithEmail,
    initial
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-black/40 p-1">
        <button
          type="button"
          onClick={() => setMode("join")}
          className={`rounded-full px-3 py-2 font-inter text-sm font-medium transition ${
            mode === "join"
              ? "bg-[var(--refer-accent,#c8f542)] text-black"
              : "text-white/45 hover:text-white/70"
          }`}
        >
          Join
        </button>
        <button
          type="button"
          onClick={() => setMode("continue")}
          className={`rounded-full px-3 py-2 font-inter text-sm font-medium transition ${
            mode === "continue"
              ? "bg-[var(--refer-accent,#c8f542)] text-black"
              : "text-white/45 hover:text-white/70"
          }`}
        >
          Continue
        </button>
      </div>

      <div className="min-h-[20rem]">
        {mode === "join" ? (
          <form action={joinAction} className="space-y-3">
            {!compact && (
              <p className="font-inter text-sm text-white/45">
                Create your account to get your referral link.
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                required
                placeholder="Your name"
                className="h-11 rounded-xl border-white/10 bg-black/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="h-11 rounded-xl border-white/10 bg-black/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                required
                placeholder="+91 98xxxxxxx"
                className="h-11 rounded-xl border-white/10 bg-black/40"
              />
            </div>
            {joinState.error && (
              <p className="text-sm text-red-400">{joinState.error}</p>
            )}
            <Submit label="Join & open dashboard" />
          </form>
        ) : (
          <form action={continueAction} className="space-y-3">
            {!compact && (
              <p className="font-inter text-sm text-white/45">
                Use the email you joined with.
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="continueEmail">Email</Label>
              <Input
                id="continueEmail"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="h-11 rounded-xl border-white/10 bg-black/40"
              />
            </div>
            {continueState.error && (
              <p className="text-sm text-red-400">{continueState.error}</p>
            )}
            <Submit label="Open my dashboard" />
          </form>
        )}
      </div>
    </div>
  );
}
