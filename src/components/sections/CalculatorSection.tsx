"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValueEvent } from "framer-motion";
import { sectionFlow } from "@/lib/stickyStack";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRight } from "lucide-react";

const HOURS_PER_YEAR = 40 * 52;

const easeOut = [0.22, 1, 0.36, 1] as const;

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPlain(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    value
  );
}

function AnimatedCost({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 90, damping: 26, mass: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  return (
    <motion.p
      key={Math.round(value / 1000)}
      initial={{ scale: 0.97, opacity: 0.7 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="font-archivo text-2xl font-black leading-none tracking-tighter text-white tabular-nums sm:text-4xl md:text-5xl"
    >
      {formatInr(display)}
    </motion.p>
  );
}

export function CalculatorSection() {
  const [teamSize, setTeamSize] = useState(5);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [avgSalary, setAvgSalary] = useState(600000);

  const hourlyRate = avgSalary / HOURS_PER_YEAR;
  const annualCost = Math.max(0, teamSize * hoursPerWeek * hourlyRate * 52);
  const monthlyCost = annualCost / 12;
  const hoursPerYear = teamSize * hoursPerWeek * 52;
  const fteEquivalent = hoursPerYear / HOURS_PER_YEAR;

  return (
    <section
      id="calculator"
      className={`relative overflow-hidden bg-white pt-16 pb-20 md:pt-[110px] md:pb-24 ${sectionFlow}`}
    >
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: easeOut }}
        >
          <SectionHeading
            title={
              <>
                Growth <span className="text-gaude-orange">Calculator</span>
              </>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.08, ease: easeOut }}
          className="grid overflow-hidden rounded-[20px] border-2 border-gaude-black/10 md:grid-cols-2 md:rounded-[24px]"
        >
          {/* Inputs */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.15, ease: easeOut }}
            className="flex min-w-0 flex-col gap-6 border-b-2 border-gaude-black/10 bg-white p-4 sm:p-6 md:border-r-2 md:border-b-0 md:p-8"
          >
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="font-archivo text-[10px] font-bold uppercase tracking-[0.22em] text-gaude-orange"
            >
              Your inputs
            </motion.p>

            <SliderField
              label="Team size"
              hint="How many people do manual follow-ups or ops work"
              value={teamSize}
              min={1}
              max={50}
              step={1}
              display={formatPlain(teamSize)}
              unit="people"
              onChange={setTeamSize}
              delay={0.22}
            />
            <SliderField
              label="Hours per week"
              hint="Hours each person spends on that manual work every week"
              value={hoursPerWeek}
              min={1}
              max={40}
              step={1}
              display={formatPlain(hoursPerWeek)}
              unit="hrs / week"
              onChange={setHoursPerWeek}
              delay={0.3}
            />
            <SliderField
              label="Average annual salary"
              hint="Typical yearly salary (INR) for one person on that team"
              value={avgSalary}
              min={200000}
              max={3000000}
              step={50000}
              display={formatInr(avgSalary)}
              unit="per person / year"
              onChange={setAvgSalary}
              delay={0.38}
            />
          </motion.div>

          {/* Result */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.22, ease: easeOut }}
            className="flex min-w-0 flex-col bg-gaude-black p-4 text-white sm:p-6 md:p-8"
          >
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="font-archivo text-[10px] font-bold uppercase tracking-[0.22em] text-gaude-orange"
            >
              What it costs you
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.45, ease: easeOut }}
              className="mt-5"
            >
              <p className="font-inter text-sm font-medium text-white/50">
                Cost of manual work / year
              </p>
              <div className="mt-2">
                <AnimatedCost value={annualCost} />
              </div>
              <p className="mt-2 font-inter text-xs text-white/35">
                Salary value lost to busywork across your team
              </p>
            </motion.div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat
                label="Per month"
                value={formatInr(monthlyCost)}
                detail="same burn, monthly"
                delay={0.45}
              />
              <Stat
                label="Hours wasted / year"
                value={formatPlain(hoursPerYear)}
                detail="total team hours"
                delay={0.52}
              />
              <Stat
                label="Full-time equivalent"
                value={`${fteEquivalent.toFixed(1)} FTE`}
                detail="people-years of work"
                delay={0.59}
              />
            </div>

            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.65, duration: 0.4, ease: easeOut }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-cal-link="editco-media/15min"
              data-cal-namespace="15min"
              data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
              className="group mt-8 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-gaude-orange bg-gaude-orange px-5 py-3.5 font-archivo text-[11px] font-black uppercase tracking-widest text-white transition-all hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:mt-auto"
            >
              See what we&apos;d automate
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  detail,
  delay = 0,
}: {
  label: string;
  value: string;
  detail: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4, ease: easeOut }}
      whileHover={{ y: -2, borderColor: "rgba(255,78,0,0.35)" }}
      className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 transition-colors"
    >
      <p className="font-inter text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </p>
      <p className="mt-1 font-archivo text-sm font-bold tracking-tight text-white tabular-nums">
        {value}
      </p>
      <p className="mt-0.5 font-inter text-[10px] text-white/30">{detail}</p>
    </motion.div>
  );
}

function SliderField({
  label,
  hint,
  value,
  min,
  max,
  step,
  display,
  unit,
  onChange,
  delay = 0,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  unit: string;
  onChange: (v: number) => void;
  delay?: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.45, ease: easeOut }}
    >
      <div className="mb-1 flex items-end justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <label className="font-archivo text-xs font-bold uppercase tracking-wide text-gaude-black">
            {label}
          </label>
          <p className="mt-0.5 max-w-[240px] font-inter text-[11px] leading-snug text-gaude-black/45">
            {hint}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <motion.p
            key={display}
            initial={{ opacity: 0.5, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="font-archivo text-xs font-bold tabular-nums text-gaude-orange sm:text-sm"
          >
            {display}
          </motion.p>
          <p className="font-inter text-[10px] text-gaude-black/40">{unit}</p>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="calc-range relative z-10 mt-2 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right, var(--color-gaude-orange) ${pct}%, rgba(10,10,10,0.08) ${pct}%)`,
          backgroundSize: "100% 6px",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
    </motion.div>
  );
}
