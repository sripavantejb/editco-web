"use client";

import { useCallback, useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
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

function LeadSuccessModal({
  open,
  onSubmitAnother,
}: {
  open: boolean;
  onSubmitAnother: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-success-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#111] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:p-8"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gaude-orange/15 text-gaude-orange ring-1 ring-gaude-orange/35">
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </div>

            <h2
              id="lead-success-title"
              className="font-archivo mt-5 text-center text-2xl uppercase tracking-tighter text-white"
            >
              Submitted successfully
            </h2>
            <p className="mt-2 text-center font-inter text-sm leading-relaxed text-white/55">
              Thanks — Editco will follow up shortly. Your intro is already
              attached.
            </p>

            <div className="mt-7 space-y-3">
              <Link
                href="/"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gaude-orange px-6 font-archivo text-sm uppercase tracking-[0.08em] text-white transition-colors hover:bg-gaude-orange/90"
              >
                Continue to Editco
              </Link>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onSubmitAnother}
              >
                Submit another referral
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function LeadFormFields({
  defaultCode,
  utmSource,
  utmMedium,
  utmCampaign,
  landingPage,
  onSuccess,
}: {
  defaultCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState(defaultCode || "");
  const [state, action] = useActionState(submitAttributedLead, initial);

  useEffect(() => {
    if (!defaultCode) {
      setCode(readStoredReferralCode());
    }
  }, [defaultCode]);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

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
      <Submit />
    </form>
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
  const [formKey, setFormKey] = useState(0);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSuccess = useCallback(() => {
    setSuccessOpen(true);
  }, []);

  const handleSubmitAnother = useCallback(() => {
    setSuccessOpen(false);
    setFormKey((k) => k + 1);
  }, []);

  return (
    <>
      <LeadFormFields
        key={formKey}
        defaultCode={defaultCode}
        utmSource={utmSource}
        utmMedium={utmMedium}
        utmCampaign={utmCampaign}
        landingPage={landingPage}
        onSuccess={handleSuccess}
      />
      <LeadSuccessModal
        open={successOpen}
        onSubmitAnother={handleSubmitAnother}
      />
    </>
  );
}
