"use client";

import { motion } from "framer-motion";
import { stickySlide1 } from "@/lib/stickyStack";
import { ChevronDown } from "lucide-react";
import CursorGrid from "@/components/motion/CursorGrid";

export function HeroSection() {
  return (
    <section
      id="hero"
      className={`relative flex min-h-screen flex-col overflow-hidden bg-gaude-black ${stickySlide1}`}
    >
      <div className="absolute inset-0 z-0">
        <CursorGrid
          cellSize={60}
          color="#FF4E00"
          radius={160}
          falloff="smooth"
          holdTime={350}
          fadeDuration={700}
          lineWidth={1.4}
          maxOpacity={0.95}
          fillOpacity={0.18}
          gridOpacity={0.06}
          cellRadius={12}
          clickPulse
          pulseSpeed={650}
          highlightOnView
          className="h-full w-full"
        />
        <div className="pointer-events-none absolute inset-0 bg-gaude-black/40" />
      </div>

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-24 pb-28">
        <div className="relative flex flex-col items-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            <h1 className="select-none font-archivo text-[24vw] font-black uppercase leading-[0.82] tracking-[-0.06em] text-white sm:text-[22vw] md:text-[20vw] md:leading-[0.78] lg:text-[18vw] xl:text-[17vw]">
              <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                EDITCO
              </span>
            </h1>

            <div className="mt-6 flex flex-col items-center sm:mt-8 md:mt-10">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="whitespace-nowrap px-2 font-space-grotesk text-[clamp(0.7rem,1.85vw,1.35rem)] font-medium leading-none tracking-tight text-white/85"
              >
                We build smart websites, AI calling agents, and growth systems for
                modern businesses
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-10 flex w-full flex-col items-center sm:mt-12 md:mt-14"
              >
                <div className="flex w-full flex-col items-center gap-4 px-4 sm:flex-row sm:justify-center sm:gap-6">
                  <button
                    type="button"
                    data-cal-link="editco-media/15min"
                    data-cal-namespace="15min"
                    data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
                    className="pointer-events-auto group relative flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-full border border-gaude-orange bg-gaude-orange px-8 font-archivo text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:shadow-[0_0_30px_rgba(255,78,0,0.4)] sm:h-16 sm:w-auto sm:px-10 md:text-[11px]"
                  >
                    Book a Call
                  </button>
                  <a
                    href="#calculator"
                    className="pointer-events-auto group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 px-8 font-archivo text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white hover:text-gaude-black sm:h-16 sm:w-auto sm:px-10 md:text-[11px]"
                  >
                    Growth Calculator
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <a
        href="#problem"
        className="pointer-events-auto absolute inset-x-0 bottom-8 z-10 mx-auto flex w-fit flex-col items-center gap-1.5 font-archivo text-[10px] font-medium uppercase tracking-[0.2em] text-white/35 transition-colors hover:text-white/60"
      >
        Scroll to know more
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}
