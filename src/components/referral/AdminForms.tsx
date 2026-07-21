"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateReferralStage,
  markRewardPaid,
  updateReferralDetails,
  deleteReferral,
  updateReferrerDetails,
  deleteReferrer,
} from "@/actions/admin";
import type { ActionState } from "@/actions/auth";
import {
  LOST_REASONS,
  PROJECT_TYPES,
  STAGE_LABELS,
  STAGES,
  TIERS,
  TIER_LABELS,
  type Stage,
} from "@/lib/constants";
import { Button } from "@/components/referral/ui/button";
import { Input } from "@/components/referral/ui/input";
import { Textarea } from "@/components/referral/ui/textarea";
import { Label } from "@/components/referral/ui/label";
import { PhoneField } from "@/components/referral/PhoneField";
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

export function AdminEditReferralForm({
  referral,
}: {
  referral: {
    id: string;
    referredName: string;
    referredBusiness?: string | null;
    referredEmail?: string | null;
    referredPhone?: string | null;
    referredNeeds?: string | null;
    referrerNotes?: string | null;
    rewardAmount?: number | null;
    rewardStatus: string;
    flaggedDuplicate: boolean;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    landingPage?: string | null;
    adminInternalNotes?: string | null;
  };
}) {
  const [state, action] = useActionState(updateReferralDetails, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="referralId" value={referral.id} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="referredName">Name</Label>
          <Input
            id="referredName"
            name="referredName"
            required
            defaultValue={referral.referredName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="referredBusiness">Business</Label>
          <Input
            id="referredBusiness"
            name="referredBusiness"
            defaultValue={referral.referredBusiness || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="referredEmail">Email</Label>
          <Input
            id="referredEmail"
            name="referredEmail"
            type="email"
            defaultValue={referral.referredEmail || ""}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <PhoneField
            id="referredPhone"
            name="referredPhone"
            label="Phone"
            defaultValue={referral.referredPhone || undefined}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="referredNeeds">Needs</Label>
          <Textarea
            id="referredNeeds"
            name="referredNeeds"
            defaultValue={referral.referredNeeds || ""}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="referrerNotes">Referrer notes</Label>
          <Textarea
            id="referrerNotes"
            name="referrerNotes"
            defaultValue={referral.referrerNotes || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rewardAmount">Reward amount (₹)</Label>
          <Input
            id="rewardAmount"
            name="rewardAmount"
            type="number"
            min={0}
            defaultValue={referral.rewardAmount ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rewardStatus">Reward status</Label>
          <select
            id="rewardStatus"
            name="rewardStatus"
            defaultValue={referral.rewardStatus}
            className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white transition focus:border-gaude-orange/50 focus:outline-none"
          >
            <option value="not_applicable" className="bg-gaude-black">
              Not applicable
            </option>
            <option value="pending" className="bg-gaude-black">
              Pending
            </option>
            <option value="paid" className="bg-gaude-black">
              Paid
            </option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="utmSource">UTM source</Label>
          <Input
            id="utmSource"
            name="utmSource"
            defaultValue={referral.utmSource || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="utmMedium">UTM medium</Label>
          <Input
            id="utmMedium"
            name="utmMedium"
            defaultValue={referral.utmMedium || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="utmCampaign">UTM campaign</Label>
          <Input
            id="utmCampaign"
            name="utmCampaign"
            defaultValue={referral.utmCampaign || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="landingPage">Landing page</Label>
          <Input
            id="landingPage"
            name="landingPage"
            defaultValue={referral.landingPage || ""}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="adminInternalNotes">Internal notes</Label>
          <Textarea
            id="adminInternalNotes"
            name="adminInternalNotes"
            defaultValue={referral.adminInternalNotes || ""}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-white/60">
        <input
          type="checkbox"
          name="flaggedDuplicate"
          defaultChecked={referral.flaggedDuplicate}
          className="accent-gaude-orange"
        />
        Flagged as duplicate
      </label>

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
      <Submit label="Save changes" />
    </form>
  );
}

export function AdminDeleteReferralButton({
  referralId,
  referredName,
}: {
  referralId: string;
  referredName: string;
}) {
  const [state, action] = useActionState(deleteReferral, initial);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `Delete referral for "${referredName}"? This cannot be undone.`
          )
        ) {
          e.preventDefault();
        }
      }}
      className="mt-4"
    >
      <input type="hidden" name="referralId" value={referralId} />
      <Button type="submit" variant="destructive" className="w-full sm:w-auto">
        Delete referral
      </Button>
      {state.error && (
        <p className="mt-2 text-sm text-red-400">{state.error}</p>
      )}
    </form>
  );
}

export function AdminEditReferrerForm({
  referrer,
}: {
  referrer: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    referralCode: string;
    tier: string;
    isPublicPartner: boolean;
  };
}) {
  const [state, action] = useActionState(updateReferrerDetails, initial);
  const [deleteState, deleteAction] = useActionState(deleteReferrer, initial);

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-3">
        <input type="hidden" name="referrerId" value={referrer.id} />
        <div className="space-y-2">
          <Label htmlFor="refFullName">Name</Label>
          <Input
            id="refFullName"
            name="fullName"
            required
            defaultValue={referrer.fullName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="refEmail">Email</Label>
          <Input
            id="refEmail"
            name="email"
            type="email"
            required
            defaultValue={referrer.email}
          />
        </div>
        <PhoneField
          id="refPhone"
          name="phone"
          label="Phone"
          defaultValue={referrer.phone || undefined}
        />
        <div className="space-y-2">
          <Label htmlFor="refCode">Referral code</Label>
          <Input
            id="refCode"
            name="referralCode"
            required
            defaultValue={referrer.referralCode}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="refTier">Tier</Label>
          <select
            id="refTier"
            name="tier"
            defaultValue={referrer.tier}
            className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-gaude-orange/50 focus:outline-none"
          >
            {TIERS.map((t) => (
              <option key={t} value={t} className="bg-gaude-black">
                {TIER_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-white/60">
          <input
            type="checkbox"
            name="isPublicPartner"
            defaultChecked={referrer.isPublicPartner}
            className="accent-gaude-orange"
          />
          Public partner wall
        </label>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state.success && (
          <p className="text-sm text-emerald-400">{state.success}</p>
        )}
        <Submit label="Save referrer" />
      </form>

      <form
        action={deleteAction}
        onSubmit={(e) => {
          if (
            !window.confirm(
              `Delete referrer "${referrer.fullName}" and all their referrals?`
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="referrerId" value={referrer.id} />
        <Button type="submit" variant="destructive" size="sm">
          Delete referrer
        </Button>
        {deleteState.error && (
          <p className="mt-2 text-sm text-red-400">{deleteState.error}</p>
        )}
      </form>
    </div>
  );
}
