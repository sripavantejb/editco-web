"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { adminLogin, type ActionState } from "@/actions/auth";
import { Button } from "@/components/referral/ui/button";
import { Input } from "@/components/referral/ui/input";
import { Label } from "@/components/referral/ui/label";

const initial: ActionState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Checking..." : "Enter admin"}
    </Button>
  );
}

export function AdminLoginForm() {
  const [state, action] = useActionState(adminLogin, initial);
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Admin email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="admin@editcomedia.com"
        />
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <Submit />
    </form>
  );
}
