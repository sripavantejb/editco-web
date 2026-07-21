"use client";

import { JoinForm } from "@/components/referral/JoinForm";
import { TIER_LABELS } from "@/lib/constants";
import { formatCurrencyINR } from "@/lib/utils";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Gift,
  Link2,
  Rocket,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import SideRays from "@/components/referral/SideRays";

/**
 * Sibling sticky slides (same pattern as main site stickyStack).
 * Must be direct children of main — no short wrappers, or sticky breaks.
 */
const referSlideCore =
  "relative w-full border-b-4 border-gaude-black shadow-[0_-20px_40px_rgba(0,0,0,0.28)] lg:sticky lg:top-0 lg:h-[100svh] lg:overflow-hidden";
const referSlide1 = `${referSlideCore} z-10`;
const referSlide2 = `${referSlideCore} z-20`;
const referSlide3 = `${referSlideCore} z-[25]`;
const referSlide4 = `${referSlideCore} z-30`;
const referSlideLast =
  "relative z-[40] w-full border-b-4 border-gaude-black bg-[#050505] shadow-[0_-20px_40px_rgba(0,0,0,0.28)] lg:min-h-[100svh]";

const ease = [0.16, 1, 0.3, 1] as const;

const ACCENT = "#c8f542";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

const steps = [
  {
    icon: Rocket,
    title: "Join",
    body: "Name, email, phone — instant partner dashboard.",
  },
  {
    icon: Link2,
    title: "Refer",
    body: "Submit leads or share your personal link.",
  },
  {
    icon: Gift,
    title: "Earn",
    body: "Live pipeline. Paid when referred deals win.",
  },
];

const tiers = [
  {
    tier: TIER_LABELS.standard,
    detail: "1–2 wins",
    price: "Base",
    bonus: "Standard reward per win",
    features: ["Dashboard access", "Shareable link", "Pipeline tracking"],
    highlight: false,
  },
  {
    tier: TIER_LABELS.growth_partner,
    detail: "3–5 wins",
    price: "+20%",
    bonus: "Bonus on every win",
    features: [
      "Everything in Standard",
      "+20% reward boost",
      "Priority updates",
    ],
    highlight: true,
  },
  {
    tier: TIER_LABELS.elite_partner,
    detail: "6+ wins",
    price: "+30%",
    bonus: "Top partner bonus",
    features: [
      "Everything in Growth",
      "+30% reward boost",
      "Public partner wall",
    ],
    highlight: false,
  },
];

const highlights = [
  {
    icon: TrendingUp,
    title: "Increase referral wins",
    body: "Clear pipeline stages so you always know where each lead stands.",
  },
  {
    icon: Target,
    title: "Hit reward targets",
    body: "Transparent tiers — grow from Standard to Elite as you convert.",
  },
  {
    icon: Trophy,
    title: "Partner-first payouts",
    body: "Rewards unlock when deals win — no chasing, no guessing.",
  },
];

const faqs = [
  {
    q: "Who can join?",
    a: "Anyone who knows businesses that need websites, AI agents, CRM, or automations.",
  },
  {
    q: "When do I get paid?",
    a: "When a referral is marked Won — typically within 14 days of kickoff.",
  },
  {
    q: "Do I chase leads?",
    a: "No. Submit or share your link — Editco handles outreach and updates your pipeline.",
  },
];

function StaggerWords({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <motion.p
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.03, delayChildren: delay } },
      }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.5, ease }}
          className="mr-[0.28em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}

export default function ReferLandingPage() {
  return (
    <main
      id="main"
      className="refer-landing overflow-x-clip bg-[#050505] [scroll-behavior:smooth]"
      style={
        {
          "--refer-accent": ACCENT,
          "--refer-accent-hover": "#b8e636",
        } as CSSProperties
      }
    >
      {/* HERO */}
      <section
        className={`flex flex-col justify-start overflow-hidden bg-[#050505] px-4 pb-12 pt-28 sm:px-5 md:px-6 md:pb-16 md:pt-32 lg:px-8 xl:px-10 ${referSlide1}`}
      >
        <div className="absolute inset-0 z-0 bg-[#050505]">
          <SideRays
            speed={2.5}
            rayColor1={ACCENT}
            rayColor2="#96c8ff"
            intensity={2}
            spread={2}
            origin="top-right"
            tilt={0}
            saturation={1.5}
            blend={0.75}
            falloff={1.6}
            opacity={1.0}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505]" />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-[1680px] items-center gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.9fr)] md:gap-8 lg:gap-12">
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--refer-accent)]/30 bg-[var(--refer-accent)]/10 px-4 py-1.5 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--refer-accent)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--refer-accent)]" />
              </span>
              <span className="font-inter text-[10px] font-semibold tracking-wide text-[var(--refer-accent)] sm:text-[11px]">
                Editco · Referral
              </span>
            </motion.div>

            <h1 className="select-none font-archivo font-black uppercase leading-[0.82] tracking-[-0.055em]">
              <motion.span
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.95, ease }}
                className="block bg-gradient-to-b from-white to-white/40 bg-clip-text text-[clamp(3.25rem,9.5vw,8.5rem)] text-transparent"
              >
                Refer
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.95, delay: 0.12, ease }}
                className="block text-[clamp(3.25rem,9.5vw,8.5rem)] text-[var(--refer-accent)]"
              >
                Earn.
              </motion.span>
            </h1>

            <StaggerWords
              delay={0.35}
              text={`Share Editco. Track every lead live. Earn ${formatCurrencyINR(3000)}–${formatCurrencyINR(15000)}+ per win.`}
              className="mt-4 max-w-xl font-space-grotesk text-base font-medium tracking-tight text-white/75 sm:text-lg lg:text-xl lg:leading-snug"
            />

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease }}
              className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2"
            >
              {["Instant dashboard", "Live pipeline", "Tier bonuses"].map(
                (tag, i, arr) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.45, ease }}
                    className="flex items-center gap-3 font-inter text-[11px] font-medium tracking-wide text-white/45"
                  >
                    {tag}
                    {i < arr.length - 1 && (
                      <span className="hidden h-1 w-1 rounded-full bg-[var(--refer-accent)]/60 sm:inline-block" />
                    )}
                  </motion.span>
                )
              )}
            </motion.div>

            <motion.a
              href="#join"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65, ease }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="group mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[var(--refer-accent)] px-7 font-inter text-[12px] font-semibold tracking-wide text-black transition-shadow hover:shadow-[0_0_40px_rgba(200,245,66,0.45)] md:hidden"
            >
              Start referring
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.a>
          </div>

          <motion.div
            id="join"
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease }}
            className="relative w-full"
          >
            <motion.div
              animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.04, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-5 rounded-[36px] bg-[var(--refer-accent)]/15 blur-3xl"
            />
            <div className="relative rounded-[24px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl sm:p-6">
              <div className="mb-4">
                <p className="font-inter text-base font-semibold text-white">
                  Get started
                </p>
                <p className="mt-0.5 font-inter text-sm text-white/40">
                  Under 60s · no password
                </p>
              </div>
              <JoinForm compact />
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className={`flex flex-col justify-start bg-[var(--refer-accent)] px-4 py-12 text-gaude-black sm:px-6 lg:px-8 lg:py-14 xl:px-10 ${referSlide2}`}
      >
        <div className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col justify-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="mb-6 max-w-3xl lg:mb-8"
          >
            <span className="inline-block border-2 border-gaude-black bg-white px-3 py-1 font-inter text-[10px] font-black uppercase tracking-[0.2em] text-gaude-black shadow-[3px_3px_0_0_#0a0a0a]">
              Process
            </span>
            <h2 className="mt-3 whitespace-nowrap font-archivo text-3xl font-black uppercase leading-none tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              How it{" "}
              <span className="bg-gaude-black px-2 text-[var(--refer-accent)]">
                works
              </span>
            </h2>
            <p className="mt-3 max-w-xl font-inter text-sm font-medium leading-relaxed text-gaude-black/70 md:text-base">
              Three hard steps. No fluff. Join, refer, get paid.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const rotations = ["md:-rotate-1", "md:rotate-1", "md:-rotate-1"];
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease }}
                  whileHover={{
                    y: -8,
                    x: -4,
                    transition: { type: "spring", stiffness: 400, damping: 22 },
                  }}
                  className={`group relative flex flex-col border-4 border-gaude-black bg-white p-5 shadow-[8px_8px_0_0_#0a0a0a] transition-shadow hover:shadow-[12px_12px_0_0_#0a0a0a] md:p-6 ${rotations[i]}`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center border-4 border-gaude-black bg-[var(--refer-accent)] text-gaude-black shadow-[4px_4px_0_0_#0a0a0a] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0_0_#0a0a0a]">
                      <Icon className="h-5 w-5" strokeWidth={2.25} />
                    </div>
                    <span className="font-archivo text-3xl font-black leading-none tracking-tighter text-gaude-black/15 md:text-4xl">
                      0{i + 1}
                    </span>
                  </div>

                  <span className="mb-2 inline-flex w-fit border-2 border-gaude-black bg-[var(--refer-accent)] px-2 py-0.5 font-inter text-[9px] font-black uppercase tracking-widest">
                    Step 0{i + 1}
                  </span>
                  <h3 className="font-archivo text-xl font-black uppercase tracking-tight md:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 font-inter text-sm font-medium leading-relaxed text-gaude-black/65">
                    {step.body}
                  </p>

                  <div className="mt-auto pt-4">
                    <div className="h-1.5 w-10 bg-gaude-black transition-all duration-300 group-hover:w-20" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TIERS */}
      <section
        className={`flex flex-col justify-start bg-[#f0f0f0] px-4 py-12 sm:px-6 lg:px-8 lg:py-14 xl:px-10 ${referSlide3}`}
      >
        <div className="mx-auto w-full max-w-[1680px]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65, ease }}
            className="mb-6 lg:mb-8"
          >
            <span className="inline-block border-2 border-gaude-black bg-[var(--refer-accent)] px-3 py-1 font-inter text-[10px] font-black uppercase tracking-[0.2em] text-gaude-black shadow-[3px_3px_0_0_#0a0a0a]">
              Reward tiers
            </span>
            <h2 className="mt-3 whitespace-nowrap font-archivo text-3xl font-black uppercase leading-none tracking-tighter text-gaude-black sm:text-4xl md:text-5xl lg:text-6xl">
              Grow your{" "}
              <span className="bg-gaude-black px-2 text-[var(--refer-accent)]">
                payouts
              </span>
            </h2>
            <p className="mt-3 max-w-2xl font-inter text-sm font-medium leading-relaxed text-gaude-black/65 md:text-base">
              Earn {formatCurrencyINR(3000)}–{formatCurrencyINR(15000)}+ per
              win — plus tier bonuses as you convert more.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {tiers.map((t, i) => (
              <motion.div
                key={t.tier}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease }}
                whileHover={{
                  y: -8,
                  x: -4,
                  transition: { type: "spring", stiffness: 400, damping: 22 },
                }}
                className={`relative flex flex-col border-4 border-gaude-black p-5 shadow-[8px_8px_0_0_#0a0a0a] transition-shadow hover:shadow-[12px_12px_0_0_#0a0a0a] md:p-6 ${
                  t.highlight
                    ? "bg-[var(--refer-accent)] text-gaude-black"
                    : "bg-white text-gaude-black"
                }`}
              >
                {t.highlight && (
                  <span className="absolute -right-2 -top-3 rotate-6 border-2 border-gaude-black bg-white px-2.5 py-1 font-inter text-[9px] font-black uppercase tracking-widest shadow-[3px_3px_0_0_#0a0a0a]">
                    Popular
                  </span>
                )}
                <p className="font-inter text-[10px] font-black uppercase tracking-[0.18em] text-gaude-black/45">
                  {t.detail}
                </p>
                <h3 className="mt-1 font-archivo text-xl font-black uppercase tracking-tight md:text-2xl">
                  {t.tier}
                </h3>
                <p className="mt-0.5 font-inter text-sm font-medium text-gaude-black/60">
                  {t.bonus}
                </p>
                <p className="mt-4 font-archivo text-3xl font-black tracking-tighter">
                  {t.price}
                  <span className="ml-2 font-inter text-[10px] font-black uppercase tracking-widest text-gaude-black/40">
                    bonus
                  </span>
                </p>
                <motion.a
                  href="#join"
                  whileHover={{ x: -2, y: -2 }}
                  whileTap={{ x: 0, y: 0 }}
                  className={`mt-4 inline-flex h-10 items-center justify-center border-4 border-gaude-black font-archivo text-[11px] font-black uppercase tracking-widest transition ${
                    t.highlight
                      ? "bg-gaude-black text-[var(--refer-accent)] shadow-[4px_4px_0_0_#fff] hover:shadow-[6px_6px_0_0_#fff]"
                      : "bg-[var(--refer-accent)] text-gaude-black shadow-[4px_4px_0_0_#0a0a0a] hover:shadow-[6px_6px_0_0_#0a0a0a]"
                  }`}
                >
                  Get started
                </motion.a>
                <ul className="mt-4 space-y-2 border-t-2 border-gaude-black/10 pt-4">
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 font-inter text-sm font-medium text-gaude-black/75"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0"
                        strokeWidth={2.75}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNER BAND */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className={`flex flex-col justify-start bg-[var(--refer-accent)] px-4 py-12 text-black sm:px-6 lg:px-8 lg:py-14 xl:px-10 ${referSlide4}`}
      >
        <div className="mx-auto grid w-full max-w-[1680px] gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
          <motion.div variants={fadeUp}>
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex rounded-full bg-white px-3.5 py-1.5 font-inter text-xs font-semibold tracking-wide"
            >
              Partner reviews
            </motion.span>
            <h2 className="mt-4 max-w-lg font-inter text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl lg:text-5xl">
              Built for partners who refer with confidence
            </h2>
            <p className="mt-3 max-w-md font-inter text-sm leading-relaxed text-black/65 md:text-base">
              Clear stages, fast updates, and rewards that pay when deals close —
              so you can focus on introductions, not follow-ups.
            </p>
            <motion.div variants={fadeUp} className="mt-6">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.06, type: "spring" }}
                    className="text-lg text-black"
                  >
                    ★
                  </motion.span>
                ))}
              </div>
              <p className="mt-2 font-inter text-sm font-medium text-black/70">
                Trusted by Editco partners across clinics & startups
              </p>
            </motion.div>
          </motion.div>

          <div className="space-y-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  whileHover={{
                    x: 6,
                    backgroundColor: "rgba(255,255,255,0.75)",
                    transition: { type: "spring", stiffness: 300, damping: 22 },
                  }}
                  className="flex gap-4 rounded-[22px] bg-white/55 p-4 backdrop-blur-sm"
                >
                  <motion.div
                    whileHover={{ rotate: -6, scale: 1.06 }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-black shadow-sm"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </motion.div>
                  <div>
                    <h3 className="font-inter text-base font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-1 font-inter text-sm leading-relaxed text-black/60">
                      {item.body}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* FAQ — scrolls over sticky stack */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className={`flex flex-col justify-start px-4 py-12 sm:px-6 lg:px-8 lg:py-16 xl:px-10 ${referSlideLast}`}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col justify-start">
          <motion.div variants={fadeUp} className="mb-8 text-center">
            <p className="font-inter text-xs font-semibold uppercase tracking-[0.18em] text-[var(--refer-accent)]">
              FAQ
            </p>
            <h2 className="mt-2 font-inter text-3xl font-bold tracking-tight text-white md:text-4xl">
              Questions, answered
            </h2>
          </motion.div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {faqs.map((f) => (
              <motion.details
                key={f.q}
                variants={fadeUp}
                className="group py-1"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-inter text-base font-medium tracking-tight text-white transition hover:text-[var(--refer-accent)] marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>{f.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-white/35 transition duration-300 group-open:rotate-180 group-open:text-[var(--refer-accent)]" />
                </summary>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pb-5 pr-8 font-inter text-sm leading-relaxed text-white/50"
                >
                  {f.a}
                </motion.p>
              </motion.details>
            ))}
          </div>
        </div>
      </motion.section>
    </main>
  );
}
