"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { joinAsReferrer, continueWithEmail, type ActionState } from "@/actions/auth";
import { Button } from "@/components/referral/ui/button";
import { Input } from "@/components/referral/ui/input";
import { Label } from "@/components/referral/ui/label";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const initial: ActionState = {};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full shadow-[0_0_28px_rgba(255,78,0,0.35)] transition hover:shadow-[0_0_40px_rgba(255,78,0,0.5)]"
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
      <div className="grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-black/50 p-1">
        {(
          [
            { id: "join" as const, top: "New here?", bottom: "Join" },
            { id: "continue" as const, top: "Returning?", bottom: "Continue" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={`relative rounded-full px-3 py-2.5 text-center transition-colors ${
              mode === tab.id ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {mode === tab.id && (
              <motion.span
                layoutId="join-tab"
                className="absolute inset-0 rounded-full bg-gaude-orange shadow-[0_0_22px_rgba(255,78,0,0.4)]"
                transition={{ type: "spring", stiffness: 340, damping: 30 }}
              />
            )}
            <span className="relative z-10 block font-archivo text-[9px] uppercase tracking-[0.14em]">
              {tab.top}
            </span>
            <span className="relative z-10 mt-0.5 block font-inter text-xs font-medium">
              {tab.bottom}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === "join" ? (
          <motion.div
            key="join"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.28 }}
            className="space-y-3.5"
          >
            {!compact && (
              <p className="font-inter text-sm text-white/45">
                Create your account — code from your name + phone.
              </p>
            )}
            <form action={joinAction} className="space-y-3.5">
              {(
                [
                  {
                    id: "fullName",
                    name: "fullName",
                    label: "Full name",
                    placeholder: "Your name",
                    type: "text",
                  },
                  {
                    id: "email",
                    name: "email",
                    label: "Email",
                    placeholder: "you@company.com",
                    type: "email",
                  },
                  {
                    id: "phone",
                    name: "phone",
                    label: "Phone",
                    placeholder: "+91 98xxxxxxx",
                    type: "text",
                  },
                ] as const
              ).map((field, i) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.35 }}
                  className="space-y-1.5"
                >
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input
                    id={field.id}
                    name={field.name}
                    type={field.type}
                    required
                    placeholder={field.placeholder}
                    className="h-12 rounded-xl border-white/10 bg-black/40 transition duration-300 focus-visible:border-gaude-orange/60 focus-visible:shadow-[0_0_0_3px_rgba(255,78,0,0.12)]"
                  />
                </motion.div>
              ))}
              {joinState.error && (
                <p className="text-sm text-red-400">{joinState.error}</p>
              )}
              <Submit label="Join & open dashboard" />
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="continue"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.28 }}
            className="space-y-3.5"
          >
            {!compact && (
              <p className="font-inter text-sm text-white/45">
                Same email you used to join → straight to your pipeline.
              </p>
            )}
            <form action={continueAction} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="continueEmail">Email</Label>
                <Input
                  id="continueEmail"
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="h-12 rounded-xl transition focus-visible:border-gaude-orange/50"
                />
              </div>
              {continueState.error && (
                <p className="text-sm text-red-400">{continueState.error}</p>
              )}
              <Submit label="Open my dashboard" />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
