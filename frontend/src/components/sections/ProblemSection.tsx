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
      className={`relative border-b-4 border-gaude-black bg-gaude-black pt-16 pb-20 md:pt-[110px] md:pb-24 ${stickySlide3}`}
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

        <div className="mt-8 overflow-hidden py-4 md:mt-12 md:py-8">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              duration: 35, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="flex gap-4 md:gap-6 w-fit"
          >
            {[...problem.points, ...problem.points].map((p, i) => {
              const Icon = PROBLEM_ICONS[p.icon];
              return (
                <div
                  key={`${p.label}-${i}`}
                  className="group relative flex min-w-[260px] md:min-w-[300px] flex-col gap-5 rounded-[20px] border-2 border-white/5 bg-white/[0.03] p-6 transition-all hover:border-gaude-orange/20 hover:bg-white/[0.06] md:gap-6 md:rounded-[24px] md:p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-gaude-orange/20 bg-gaude-orange/5 text-gaude-orange transition-all group-hover:scale-110 group-hover:bg-gaude-orange/20 md:h-14 md:w-14 md:rounded-2xl">
                    <Icon className="size-6 md:size-7" strokeWidth={1.5} />
                  </div>
                  
                  <h4 className="font-inter text-base font-bold leading-tight text-white/90 transition-colors group-hover:text-white md:text-lg">
                    {p.label}
                  </h4>

                  <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-gaude-orange/20 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              );
            })}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 overflow-hidden rounded-[24px] border-2 border-gaude-orange/20 bg-gradient-to-br from-gaude-orange/10 to-transparent p-6 md:mt-16 md:rounded-[32px] md:p-12"
        >
          <p className="font-space-grotesk text-xl font-black leading-tight tracking-tight text-white md:text-3xl lg:text-4xl">
            {problem.strongLine}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
