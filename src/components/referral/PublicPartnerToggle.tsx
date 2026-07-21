"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { togglePublicPartner } from "@/actions/referrals";
import type { ActionState } from "@/actions/auth";
import { Button } from "@/components/referral/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/referral/ui/card";

const initial: ActionState = {};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="secondary" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function PublicPartnerToggle({
  isPublic,
  isElite,
}: {
  isPublic: boolean;
  isElite: boolean;
}) {
  const [state, action] = useActionState(togglePublicPartner, initial);

  if (!isElite) return null;

  return (
    <Card>
      <CardTitle>Public partner wall</CardTitle>
      <CardDescription className="mt-1">
        As an Elite Partner you can opt in to be listed on{" "}
        <span className="text-zinc-300">/partners</span>.
      </CardDescription>
      <form action={action} className="mt-4">
        <input type="hidden" name="enabled" value={isPublic ? "false" : "true"} />
        <Submit label={isPublic ? "Remove listing" : "List me publicly"} />
      </form>
      {state.error && <p className="mt-2 text-sm text-red-400">{state.error}</p>}
      {state.success && (
        <p className="mt-2 text-sm text-emerald-400">{state.success}</p>
      )}
    </Card>
  );
}
