"use client";

import { motion } from "framer-motion";
import { stickySlide1 } from "@/lib/stickyStack";
import { ChevronDown } from "lucide-react";
import CursorGrid from "@/components/motion/CursorGrid";

export function HeroSection() {
  return (
    <section
      id="hero"
      className={`relative flex min-h-[100svh] flex-col overflow-x-clip bg-gaude-black ${stickySlide1}`}
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

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col items-center justify-center px-3 pt-24 pb-20 sm:px-6 sm:pt-32 sm:pb-28">
        <div className="relative flex w-full max-w-[100%] flex-col items-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full flex-col items-center text-center"
          >
            {/* Size from viewport width so all 6 letters fit with side padding */}
            <h1
              className="hero-wordmark w-full max-w-[100%] select-none font-archivo font-black uppercase leading-[0.85] tracking-[-0.04em] text-white sm:leading-[0.82] sm:tracking-[-0.05em]"
            >
              <span className="inline-block max-w-full bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                EDITCO
              </span>
            </h1>

            <div className="mt-5 flex w-full flex-col items-center sm:mt-8 md:mt-10">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="max-w-[20rem] px-2 font-space-grotesk text-[0.85rem] font-medium leading-snug tracking-tight text-white/85 sm:max-w-xl sm:text-[clamp(0.85rem,1.85vw,1.35rem)] sm:leading-snug md:max-w-3xl md:leading-snug"
              >
                We build smart websites, AI calling agents, and growth systems for
                modern businesses
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex w-full flex-col items-center sm:mt-12 md:mt-14"
              >
                <div className="flex w-full max-w-md flex-col items-center gap-3 px-1 sm:max-w-none sm:flex-row sm:justify-center sm:gap-6 sm:px-4">
                  <button
                    type="button"
                    data-cal-link="editco-media/15min"
                    data-cal-namespace="15min"
                    data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
                    className="pointer-events-auto group relative flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-full border border-gaude-orange bg-gaude-orange px-6 font-archivo text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:shadow-[0_0_30px_rgba(255,78,0,0.4)] sm:h-14 sm:w-auto sm:px-10 md:h-16 md:text-[11px]"
                  >
                    Book a Call
                  </button>
                  <a
                    href="#calculator"
                    className="pointer-events-auto group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 px-6 font-archivo text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white hover:text-gaude-black sm:h-14 sm:w-auto sm:px-10 md:h-16 md:text-[11px]"
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
        className="pointer-events-auto relative z-10 mx-auto mt-2 mb-6 flex w-fit flex-col items-center gap-1.5 font-archivo text-[10px] font-medium uppercase tracking-[0.2em] text-white/35 transition-colors hover:text-white/60 sm:absolute sm:inset-x-0 sm:bottom-8 sm:mt-0 sm:mb-0"
      >
        Scroll to know more
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}
