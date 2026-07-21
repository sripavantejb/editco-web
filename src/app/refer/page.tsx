"use client";

import { JoinForm } from "@/components/referral/JoinForm";
import { TIER_LABELS } from "@/lib/constants";
import { formatCurrencyINR } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Gift, Link2, Rocket, Zap } from "lucide-react";
import { FooterSection } from "@/components/sections/FooterSection";

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  { icon: Rocket, title: "Join", body: "Name, email, phone → instant dashboard." },
  { icon: Link2, title: "Refer", body: "Submit leads or share your link." },
  { icon: Gift, title: "Earn", body: "Live pipeline. Paid when deals win." },
];

const tiers = [
  { tier: TIER_LABELS.standard, detail: "1–2 wins", bonus: "Base reward" },
  { tier: TIER_LABELS.growth_partner, detail: "3–5 wins", bonus: "+20% bonus" },
  { tier: TIER_LABELS.elite_partner, detail: "6+ wins", bonus: "+30% bonus" },
];

const floatChips = [
  formatCurrencyINR(3000),
  formatCurrencyINR(8000),
  formatCurrencyINR(15000),
  "+30% bonus",
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
    <main id="main" className="overflow-x-clip bg-[#050505]">
      {/* HERO — full-bleed, dense, kinetic */}
      <section className="relative flex min-h-[100svh] flex-col justify-start overflow-hidden px-4 pb-12 pt-28 sm:px-5 md:px-6 md:pb-16 md:pt-32 lg:px-8 xl:px-10">
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.14, 0.22, 0.14] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-12%] left-[-6%] h-[520px] w-[520px] rounded-full bg-gaude-orange/20 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1.05, 1, 1.05], opacity: [0.1, 0.18, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-18%] right-[-10%] h-[580px] w-[580px] rounded-full bg-gaude-purple/15 blur-[140px]"
          />
          <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
        </div>

        {/* Floating reward chips — desktop only */}
        <div className="pointer-events-none absolute inset-0 z-[1] hidden xl:block">
          {floatChips.map((chip, i) => (
            <motion.span
              key={chip}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: [0.25, 0.55, 0.25],
                y: [0, -18, 0],
              }}
              transition={{
                duration: 4 + i * 0.6,
                delay: 0.6 + i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-archivo text-[10px] uppercase tracking-[0.18em] text-white/50 backdrop-blur-sm"
              style={{
                top: `${22 + i * 14}%`,
                left: i % 2 === 0 ? "2%" : "auto",
                right: i % 2 === 1 ? "2%" : "auto",
              }}
            >
              {chip}
            </motion.span>
          ))}
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-[1680px] items-center gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.9fr)] md:gap-8 lg:gap-12">
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-gaude-orange/25 bg-gaude-orange/5 px-4 py-1.5 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gaude-orange opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gaude-orange" />
              </span>
              <span className="font-archivo text-[9px] font-bold uppercase tracking-[0.2em] text-gaude-orange/90 sm:text-[10px]">
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
                className="block text-[clamp(3.25rem,9.5vw,8.5rem)] text-gaude-orange"
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
                  <span
                    key={tag}
                    className="flex items-center gap-3 font-archivo text-[9px] font-bold uppercase tracking-[0.18em] text-white/40"
                  >
                    {tag}
                    {i < arr.length - 1 && (
                      <span className="hidden h-1 w-1 rounded-full bg-gaude-orange/50 sm:inline-block" />
                    )}
                  </span>
                )
              )}
            </motion.div>

            {/* Mobile-only jump — form is already visible beside copy on md+ */}
            <motion.a
              href="#join"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65, ease }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="group mt-6 inline-flex h-12 items-center gap-2 rounded-full border border-gaude-orange bg-gaude-orange px-7 font-archivo text-[11px] font-bold uppercase tracking-widest text-white transition-shadow hover:shadow-[0_0_40px_rgba(255,78,0,0.5)] md:hidden"
            >
              Start referring
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.a>
          </div>

          <motion.div
            id="join"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.18, ease }}
            className="relative w-full"
          >
            <motion.div
              animate={{ opacity: [0.35, 0.6, 0.35] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-5 rounded-[36px] bg-gaude-orange/15 blur-3xl"
            />
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.05] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-7"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gaude-orange/60 to-transparent" />
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-archivo text-sm uppercase tracking-wide text-white">
                    Get started
                  </p>
                  <p className="mt-1 font-inter text-xs text-white/40">
                    Under 60s · no password
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Zap className="h-5 w-5 text-gaude-orange" />
                </motion.div>
              </div>
              <JoinForm compact />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Marquee strip — fills horizontal space */}
      <div className="relative overflow-hidden border-y border-white/10 bg-white/[0.02] py-4">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="flex w-max gap-10 whitespace-nowrap font-archivo text-sm uppercase tracking-[0.28em] text-white/35"
        >
          {Array.from({ length: 2 }).map((_, loop) => (
            <div key={loop} className="flex gap-10">
              {[
                "Refer clinics",
                "Refer startups",
                `Earn ${formatCurrencyINR(3000)}+`,
                "Live pipeline",
                "Tier bonuses",
                "No chase",
                "Editco Media",
              ].map((item) => (
                <span key={`${loop}-${item}`} className="flex items-center gap-10">
                  {item}
                  <span className="text-gaude-orange">✦</span>
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* STEPS + TIERS — one dense band */}
      <section className="relative px-4 py-14 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto grid w-full max-w-[1680px] gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease }}
              className="font-archivo text-3xl uppercase tracking-tighter text-white md:text-5xl"
            >
              How it <span className="text-gaude-orange">works</span>
            </motion.h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 36, rotate: 1.5 }}
                    whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.65, delay: i * 0.08, ease }}
                    whileHover={{
                      y: -8,
                      borderColor: "rgba(255,78,0,0.45)",
                      transition: { type: "spring", stiffness: 320, damping: 20 },
                    }}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
                  >
                    <div className="absolute -right-1 -top-3 font-archivo text-6xl text-white/[0.04] transition-transform duration-500 group-hover:scale-110">
                      0{i + 1}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gaude-orange/30 bg-gaude-orange/10 text-gaude-orange">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-archivo mt-4 text-xl uppercase tracking-tight text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 font-inter text-sm leading-snug text-white/50">
                      {step.body}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease }}
              className="font-archivo text-3xl uppercase tracking-tighter text-white md:text-5xl"
            >
              Reward <span className="text-gaude-orange">tiers</span>
            </motion.h2>
            <div className="mt-6 grid gap-3">
              {tiers.map((t, i) => (
                <motion.div
                  key={t.tier}
                  initial={{ opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.07, ease }}
                  whileHover={{ scale: 1.015, x: 4 }}
                  className={`flex items-center justify-between rounded-2xl border px-5 py-4 ${
                    i === 2
                      ? "border-gaude-orange/40 bg-gradient-to-r from-gaude-orange/20 to-transparent"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div>
                    <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-gaude-orange">
                      {t.detail}
                    </p>
                    <h3 className="font-archivo mt-1 text-lg uppercase tracking-tight text-white">
                      {t.tier}
                    </h3>
                  </div>
                  <p className="font-space-grotesk text-base text-white/65">
                    {t.bonus}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ compact strip */}
      <section className="border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[1680px]">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-archivo text-3xl uppercase tracking-tighter text-white md:text-4xl"
          >
            FAQ
          </motion.h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
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
            ].map((f, i) => (
              <motion.details
                key={f.q}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] transition open:border-gaude-orange/35"
              >
                <summary className="cursor-pointer list-none px-5 py-4 font-archivo text-sm uppercase tracking-wide text-white marker:content-none [&::-webkit-details-marker]:hidden">
                  {f.q}
                </summary>
                <p className="px-5 pb-4 font-inter text-sm text-white/50">{f.a}</p>
              </motion.details>
            ))}
          </div>

          <p className="mt-8 font-inter text-sm text-white/35">
            <Link href="/" className="text-gaude-orange transition hover:opacity-80">
              ← Back to Editco home
            </Link>
          </p>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
