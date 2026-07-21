"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitManualReferral } from "@/actions/referrals";
import type { ActionState } from "@/actions/auth";
import { NEED_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/referral/ui/button";
import { Input } from "@/components/referral/ui/input";
import { Textarea } from "@/components/referral/ui/textarea";
import { Label } from "@/components/referral/ui/label";

const initial: ActionState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
      {pending ? "Submitting..." : "Submit referral"}
    </Button>
  );
}

export function NewReferralForm() {
  const router = useRouter();
  const [state, action] = useActionState(submitManualReferral, initial);

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => router.push("/dashboard"), 1200);
      return () => clearTimeout(t);
    }
  }, [state.success, router]);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="referredName">Referred person&apos;s name *</Label>
          <Input id="referredName" name="referredName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="referredBusiness">Business name</Label>
          <Input id="referredBusiness" name="referredBusiness" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="referredPhone">Phone</Label>
          <Input id="referredPhone" name="referredPhone" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="referredEmail">Email</Label>
          <Input id="referredEmail" name="referredEmail" type="email" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>What do they need?</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {NEED_OPTIONS.map((need) => (
            <label
              key={need}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300"
            >
              <input
                type="checkbox"
                name="needs"
                value={need}
                className="accent-gaude-orange"
              />
              {need}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referrerNotes">How do you know them / any context</Label>
        <Textarea
          id="referrerNotes"
          name="referrerNotes"
          placeholder="Met through clinic network, looking to launch soon..."
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          name="mentionReferrerName"
          className="mt-1 accent-gaude-orange"
          defaultChecked
        />
        Can we mention your name when we reach out?
      </label>

      <label className="flex items-start gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          name="consentToIntroEmail"
          className="mt-1 accent-gaude-orange"
        />
        Can we send them a short intro email directly?
      </label>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-400">{state.success}</p>
      )}

      <Submit />
    </form>
  );
}
