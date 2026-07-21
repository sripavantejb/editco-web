"use client";

import Link from "next/link";
import { Gift, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function RewardsEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-56 w-56 -translate-x-1/2 rounded-full bg-gaude-orange/10 blur-[80px]" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-gaude-purple/10 blur-[70px]" />
      </div>

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 20 }}
        className="relative mb-7"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-[-18px] rounded-full bg-gaude-orange/20 blur-xl"
        />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-gaude-orange/30 bg-gradient-to-b from-gaude-orange/20 to-transparent shadow-[0_0_40px_rgba(200,245,66,0.2)]">
          <Gift className="h-10 w-10 text-gaude-orange" strokeWidth={1.5} />
          <motion.span
            animate={{ y: [-2, 2, -2], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-gaude-black"
          >
            <Sparkles className="h-3.5 w-3.5 text-gaude-orange" />
          </motion.span>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.4 }}
        className="font-archivo text-[10px] uppercase tracking-[0.22em] text-gaude-orange"
      >
        Rewards
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.4 }}
        className="mt-3 font-archivo text-2xl uppercase tracking-tight text-white sm:text-3xl"
      >
        No rewards yet
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34, duration: 0.4 }}
        className="mt-3 max-w-md font-inter text-sm leading-relaxed text-white/45"
      >
        Nothing pending to pay out. Once referrals convert to won deals,
        rewards will show up here ready to mark as paid.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="mt-8"
      >
        <Link
          href="/admin"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-gaude-orange/40 bg-gaude-orange/10 px-6 font-archivo text-[10px] uppercase tracking-widest text-gaude-orange transition hover:border-gaude-orange hover:bg-gaude-orange hover:text-white hover:shadow-[0_0_28px_rgba(200,245,66,0.35)]"
        >
          View referrals
        </Link>
      </motion.div>
    </motion.div>
  );
}
