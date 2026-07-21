"use client";

import {
  PIPELINE_STEPS,
  STAGE_LABELS,
  LOST_REASON_LABELS,
  type Stage,
} from "@/lib/constants";
import { cn, formatDateTime } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, MessageSquare } from "lucide-react";

export function StageStepper({
  stage,
  lostReason,
  latestNote,
  latestNoteAt,
}: {
  stage: Stage;
  lostReason?: string | null;
  latestNote?: string | null;
  latestNoteAt?: Date | string | null;
}) {
  const isLost = stage === "lost";
  const activeIndex = isLost
    ? Math.max(
        0,
        PIPELINE_STEPS.indexOf("proposal_sent")
      )
    : PIPELINE_STEPS.indexOf(stage === "won" ? "won" : stage);

  return (
    <div className="space-y-4">
      {/* Desktop / tablet rail */}
      <div className="hidden sm:block">
        <div className="relative flex justify-between">
          <div className="absolute left-0 right-0 top-4 h-[2px] bg-white/10" />
          <motion.div
            className="absolute left-0 top-4 h-[2px] bg-gaude-orange"
            initial={{ width: "0%" }}
            animate={{
              width: isLost
                ? "60%"
                : stage === "won"
                  ? "100%"
                  : `${(activeIndex / (PIPELINE_STEPS.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          {PIPELINE_STEPS.map((step, index) => {
            const done =
              !isLost &&
              (stage === "won" || (activeIndex >= 0 && index <= activeIndex));
            const current = !isLost && step === stage;
            return (
              <div
                key={step}
                className="relative z-10 flex w-16 flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-all",
                    done || current
                      ? "border-gaude-orange bg-gaude-orange text-white shadow-[0_0_18px_rgba(255,78,0,0.45)]"
                      : "border-white/15 bg-[#0a0a0a] text-neutral-500",
                    current && "scale-110"
                  )}
                >
                  {done && !current ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-center text-[10px] font-medium uppercase leading-tight tracking-wide",
                    current || done ? "text-white" : "text-neutral-500"
                  )}
                >
                  {STAGE_LABELS[step]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile chips */}
      <div className="flex flex-wrap gap-2 sm:hidden">
        {PIPELINE_STEPS.map((step, index) => {
          const done =
            !isLost &&
            (stage === "won" || (activeIndex >= 0 && index <= activeIndex));
          const current = !isLost && step === stage;
          return (
            <div
              key={step}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border",
                done || current
                  ? "bg-gaude-orange/15 border-gaude-orange/40 text-orange-100"
                  : "bg-white/5 border-white/10 text-zinc-500",
                current && "ring-2 ring-gaude-orange/40"
              )}
            >
              {STAGE_LABELS[step]}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-neutral-300">
          Now:{" "}
          <span className="text-gaude-orange">
            {isLost ? "Lost" : STAGE_LABELS[stage]}
          </span>
        </span>
        {isLost && lostReason && (
          <span className="text-sm text-neutral-400">
            Not moving forward — {LOST_REASON_LABELS[lostReason] || lostReason}.
          </span>
        )}
      </div>

      {latestNote && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 rounded-xl border border-gaude-orange/25 bg-gaude-orange/8 p-3"
        >
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gaude-orange" />
          <div>
            <p className="text-xs uppercase tracking-wider text-gaude-orange">
              Update from Editco
            </p>
            <p className="mt-1 text-sm text-neutral-200">{latestNote}</p>
            {latestNoteAt && (
              <p className="mt-1 text-xs text-neutral-500">
                {formatDateTime(latestNoteAt)}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
