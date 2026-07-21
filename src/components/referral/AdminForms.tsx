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
    <form action={action} className="flex h-full flex-col space-y-5">
      <input type="hidden" name="referralId" value={referralId} />

      <div className="space-y-2">
        <Label
          htmlFor="stage"
          className="font-archivo text-[10px] uppercase tracking-[0.16em] text-white/45"
        >
          Stage
        </Label>
        <select
          id="stage"
          name="stage"
          value={stage}
          onChange={(e) => setStage(e.target.value as Stage)}
          className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white transition focus:border-gaude-orange/50 focus:outline-none"
        >
          {STAGES.map((s) => (
            <option key={s} value={s} className="bg-gaude-black">
              {STAGE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {stage === "lost" && (
        <div className="space-y-2">
          <Label
            htmlFor="lostReason"
            className="font-archivo text-[10px] uppercase tracking-[0.16em] text-white/45"
          >
            Lost reason
          </Label>
          <select
            id="lostReason"
            name="lostReason"
            required
            className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white transition focus:border-gaude-orange/50 focus:outline-none"
          >
            <option value="" className="bg-gaude-black">
              Select reason
            </option>
            {LOST_REASONS.map((r) => (
              <option key={r.value} value={r.value} className="bg-gaude-black">
                {r.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {stage === "won" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="projectType"
              className="font-archivo text-[10px] uppercase tracking-[0.16em] text-white/45"
            >
              Project type
            </Label>
            <select
              id="projectType"
              name="projectType"
              required
              className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white transition focus:border-gaude-orange/50 focus:outline-none"
            >
              <option value="" className="bg-gaude-black">
                Select type
              </option>
              {PROJECT_TYPES.map((p) => (
                <option key={p.value} value={p.value} className="bg-gaude-black">
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="projectValue"
              className="font-archivo text-[10px] uppercase tracking-[0.16em] text-white/45"
            >
              Project value (₹)
            </Label>
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
        <Label
          htmlFor="referrerFacingNote"
          className="font-archivo text-[10px] uppercase tracking-[0.16em] text-white/45"
        >
          Note for referrer
        </Label>
        <Textarea
          id="referrerFacingNote"
          name="referrerFacingNote"
          placeholder="Optional — visible to the partner"
          className="min-h-[88px]"
        />
      </div>
      <div className="space-y-2">
        <Label
          htmlFor="adminInternalNote"
          className="font-archivo text-[10px] uppercase tracking-[0.16em] text-white/45"
        >
          Internal note
        </Label>
        <Textarea
          id="adminInternalNote"
          name="adminInternalNote"
          placeholder="Admin only"
          className="min-h-[88px]"
        />
      </div>

      {state.error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {state.success}
        </p>
      )}
      <div className="mt-auto pt-1">
        <Submit label="Update stage" />
      </div>
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
