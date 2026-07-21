"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateReferralStage, markRewardPaid } from "@/actions/admin";
import type { ActionState } from "@/actions/auth";
import {
  LOST_REASONS,
  PROJECT_TYPES,
  STAGE_LABELS,
  STAGES,
  type Stage,
} from "@/lib/constants";
import { Button } from "@/components/referral/ui/button";
import { Input } from "@/components/referral/ui/input";
import { Textarea } from "@/components/referral/ui/textarea";
import { Label } from "@/components/referral/ui/label";
import { useState } from "react";

const initial: ActionState = {};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function AdminStageForm({
  referralId,
  currentStage,
}: {
  referralId: string;
  currentStage: Stage;
}) {
  const [stage, setStage] = useState<Stage>(currentStage);
  const [state, action] = useActionState(updateReferralStage, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="referralId" value={referralId} />

      <div className="space-y-2">
        <Label htmlFor="stage">Stage</Label>
        <select
          id="stage"
          name="stage"
          value={stage}
          onChange={(e) => setStage(e.target.value as Stage)}
          className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white"
        >
          {STAGES.map((s) => (
            <option key={s} value={s} className="bg-zinc-900">
              {STAGE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {stage === "lost" && (
        <div className="space-y-2">
          <Label htmlFor="lostReason">Lost reason</Label>
          <select
            id="lostReason"
            name="lostReason"
            required
            className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white"
          >
            <option value="" className="bg-zinc-900">
              Select reason
            </option>
            {LOST_REASONS.map((r) => (
              <option key={r.value} value={r.value} className="bg-zinc-900">
                {r.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {stage === "won" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="projectType">Project type</Label>
            <select
              id="projectType"
              name="projectType"
              required
              className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white"
            >
              <option value="" className="bg-zinc-900">
                Select type
              </option>
              {PROJECT_TYPES.map((p) => (
                <option key={p.value} value={p.value} className="bg-zinc-900">
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectValue">Project value (₹)</Label>
            <Input
              id="projectValue"
              name="projectValue"
              type="number"
              min={0}
              required
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="referrerFacingNote">Note for referrer (optional)</Label>
        <Textarea id="referrerFacingNote" name="referrerFacingNote" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminInternalNote">Internal note (admin only)</Label>
        <Textarea id="adminInternalNote" name="adminInternalNote" />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-400">{state.success}</p>
      )}
      <Submit label="Update stage" />
    </form>
  );
}

export function MarkPaidButton({ referralId }: { referralId: string }) {
  const [state, action] = useActionState(markRewardPaid, initial);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="referralId" value={referralId} />
      <Submit label="Mark as Paid" />
      {state.error && <p className="mt-2 text-sm text-red-400">{state.error}</p>}
      {state.success && (
        <p className="mt-2 text-sm text-emerald-400">{state.success}</p>
      )}
    </form>
  );
}
