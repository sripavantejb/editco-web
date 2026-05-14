"use client";

import type { LucideIcon } from "lucide-react";
import {
  CalendarX2,
  Globe2,
  Hand,
  LayoutTemplate,
  ListChecks,
  MessagesSquare,
  PhoneMissed,
  TrendingDown,
  ZapOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { problem } from "@/content/landing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { stickySlide3 } from "@/lib/stickyStack";

type ProblemIconId = (typeof problem.points)[number]["icon"];

const PROBLEM_ICONS = {
  phoneMissed: PhoneMissed,
  layoutTemplate: LayoutTemplate,
  listChecks: ListChecks,
  hand: Hand,
  globe2: Globe2,
  zapOff: ZapOff,
  trendingDown: TrendingDown,
  messagesSquare: MessagesSquare,
  calendarX2: CalendarX2,
} as const satisfies Record<ProblemIconId, LucideIcon>;

export function ProblemSection() {
  return (
    <section
      id={problem.id}
      className={`relative border-b-4 border-gaude-black bg-gaude-black pt-[110px] pb-24 ${stickySlide3}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-gaude-purple/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        <div className="max-w-4xl">
          <SectionHeading 
            title={
              <>
                Businesses Don’t Lose Customers Because of Bad Products. They Lose Them Because of <span className="text-gaude-orange">Broken Systems.</span>
              </>
            } 
            light 
          />
        </div>

        <div className="mt-12 overflow-hidden py-8">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              duration: 30, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="flex gap-6 w-fit"
          >
            {[...problem.points, ...problem.points].map((p, i) => {
              const Icon = PROBLEM_ICONS[p.icon];
              return (
                <div
                  key={`${p.label}-${i}`}
                  className="group relative flex min-w-[300px] flex-col gap-6 rounded-[24px] border-2 border-white/5 bg-white/[0.03] p-8 transition-all hover:border-gaude-orange/20 hover:bg-white/[0.06]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-gaude-orange/20 bg-gaude-orange/5 text-gaude-orange transition-all group-hover:scale-110 group-hover:bg-gaude-orange/20">
                    <Icon className="size-7" strokeWidth={1.5} />
                  </div>
                  
                  <h4 className="font-inter text-lg font-bold leading-tight text-white/90 transition-colors group-hover:text-white">
                    {p.label}
                  </h4>

                  <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-gaude-orange/20 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              );
            })}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 overflow-hidden rounded-[32px] border-2 border-gaude-orange/20 bg-gradient-to-br from-gaude-orange/10 to-transparent p-8 md:p-12"
        >
          <p className="font-space-grotesk text-2xl font-black leading-tight tracking-tight text-white md:text-3xl lg:text-4xl">
            {problem.strongLine}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
