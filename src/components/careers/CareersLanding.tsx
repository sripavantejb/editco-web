"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import SideRays from "@/components/referral/SideRays";
import { JobCard, type PublicJobCard } from "@/components/careers/JobCard";

const ACCENT = "#c3a4f6";
const ease = [0.16, 1, 0.3, 1] as const;

export function CareersLanding({ jobs }: { jobs: PublicJobCard[] }) {
  return (
    <main
      className="careers-theme relative min-h-svh overflow-x-hidden"
      style={
        {
          "--careers-accent": ACCENT,
          "--careers-accent-hover": "#b18eef",
        } as CSSProperties
      }
    >
      <section className="relative flex min-h-[70svh] flex-col justify-end border-b-4 border-gaude-black bg-[#050505] px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:min-h-[85svh] lg:px-10 lg:pb-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <SideRays
            rayColor1={ACCENT}
            rayColor2="#96c8ff"
            intensity={0.85}
            origin="top-right"
          />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1100px]">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="font-archivo text-[11px] uppercase tracking-[0.22em] text-[var(--careers-accent)]"
          >
            Careers
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease }}
            className="mt-3 max-w-[14ch] font-archivo text-[clamp(2.75rem,12vw,6.5rem)] leading-[0.9] uppercase tracking-[-0.04em] text-white"
          >
            Build with Editco.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="mt-5 max-w-xl font-inter text-base leading-relaxed text-white/60 sm:text-lg"
          >
            Open roles across product, craft, and growth. Same energy as the
            work — sharp, collaborative, and shipping.
          </motion.p>
        </div>
      </section>

      <section className="border-b-4 border-gaude-black bg-[var(--careers-accent)] px-4 py-14 text-[var(--careers-on-accent)] sm:px-6 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="font-archivo text-2xl uppercase tracking-tight sm:text-3xl">
            Why join
          </h2>
          <p className="mt-3 max-w-2xl font-inter text-sm leading-relaxed opacity-80 sm:text-base">
            Small team, real ownership, and work that ships to production —
            websites, AI systems, and growth engines for ambitious brands.
          </p>
        </div>
      </section>

      <section className="bg-[#0c0c0c] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-[1100px] space-y-8">
          <div>
            <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-[var(--careers-accent)]">
              Open roles
            </p>
            <h2 className="mt-2 font-archivo text-2xl uppercase tracking-tight text-white sm:text-3xl">
              {jobs.length === 0
                ? "No openings right now"
                : `${jobs.length} open role${jobs.length === 1 ? "" : "s"}`}
            </h2>
          </div>

          {jobs.length === 0 ? (
            <p className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 text-sm text-white/55">
              Check back soon — or email{" "}
              <a
                href="mailto:team@editcomedia.com"
                className="text-[var(--careers-accent)] underline-offset-4 hover:underline"
              >
                team@editcomedia.com
              </a>{" "}
              with your portfolio.
            </p>
          ) : (
            <ul className="space-y-4">
              {jobs.map((job, i) => (
                <li key={job.id}>
                  <JobCard job={job} index={i} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
