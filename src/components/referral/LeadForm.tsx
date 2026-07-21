"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitAttributedLead } from "@/actions/admin";
import type { ActionState } from "@/actions/auth";
import { readStoredReferralCode } from "@/components/referral/AttributionCapture";
import { Button } from "@/components/referral/ui/button";
import { Input } from "@/components/referral/ui/input";
import { Textarea } from "@/components/referral/ui/textarea";
import { Label } from "@/components/referral/ui/label";

const initial: ActionState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Submitting..." : "Submit"}
    </Button>
  );
}

export function LeadForm({
  defaultCode,
  utmSource,
  utmMedium,
  utmCampaign,
  landingPage,
}: {
  defaultCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
}) {
  const [code, setCode] = useState(defaultCode || "");
  const [state, action] = useActionState(submitAttributedLead, initial);

  useEffect(() => {
    if (!defaultCode) {
      setCode(readStoredReferralCode());
    }
  }, [defaultCode]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="referralCode" value={code} />
      <input type="hidden" name="utmSource" value={utmSource || ""} />
      <input type="hidden" name="utmMedium" value={utmMedium || ""} />
      <input type="hidden" name="utmCampaign" value={utmCampaign || ""} />
      <input type="hidden" name="landingPage" value={landingPage || ""} />

      <div className="space-y-2">
        <Label htmlFor="leadName">Your name *</Label>
        <Input id="leadName" name="referredName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="leadBiz">Business</Label>
        <Input id="leadBiz" name="referredBusiness" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="leadEmail">Email</Label>
        <Input id="leadEmail" name="referredEmail" type="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="leadPhone">Phone</Label>
        <Input id="leadPhone" name="referredPhone" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="leadNeeds">What do you need help with?</Label>
        <Textarea id="leadNeeds" name="referredNeeds" />
      </div>

      {!code && (
        <p className="text-xs text-amber-300/90">
          No referral code detected — submit still works if you arrived from a
          shared link on this device.
        </p>
      )}
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-400">{state.success}</p>
      )}
      <Submit />
    </form>
  );
}
