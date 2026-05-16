"use client";

import { motion } from "framer-motion";
import { site } from "@/content/site";
import { stickySlide1 } from "@/lib/stickyStack";
import { Cpu, TrendingUp, Smartphone, Layout, ArrowRight } from "lucide-react";


export function HeroSection() {
  return (
    <section
      id="hero"
      className={`relative flex min-h-screen flex-col overflow-hidden bg-[#050505] ${stickySlide1}`}
    >

      {/* 2. Professional Background Visuals */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-gaude-orange/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-gaude-purple/10 blur-[150px]" />
        
        {/* Animated Background Mesh - More subtle */}
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      {/* 3. Hero Content Center */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-24 pb-24">
        <div className="relative flex flex-col items-center">
          {/* MAIN BRAND TEXT */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gaude-orange/20 bg-gaude-orange/5 px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gaude-orange opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gaude-orange"></span>
              </span>
              <span className="font-archivo text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-gaude-orange/80 whitespace-nowrap">
                AI AUTOMATION + GROWTH SYSTEMS AGENCY
              </span>
            </div>

            <h1 className="select-none font-archivo text-[14vw] font-black uppercase leading-[1] tracking-[-0.04em] text-white md:text-[20vw] lg:text-[18vw] md:leading-[0.8] md:tracking-[-0.06em]">
              <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                EDITCO
              </span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 px-4 font-space-grotesk text-[4.5vw] font-medium tracking-tight text-white/90 md:mt-8 md:text-[3vw] lg:text-[2.2vw] max-w-[90vw] md:max-w-none"
            >
              Smart Websites, AI Automations & Growth Systems for <span className="text-gaude-orange">Exponential Growth.</span>
            </motion.p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex flex-col items-center gap-8 w-full md:mt-16"
        >
          <div className="flex w-full flex-col items-center gap-4 px-4 sm:flex-row sm:justify-center sm:gap-6">
            <a
              href="#services"
              className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-full border border-gaude-orange bg-gaude-orange px-8 font-archivo text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:shadow-[0_0_30px_rgba(255,78,0,0.4)] sm:h-16 sm:w-auto sm:px-10 md:text-[11px]"
            >
              <span className="relative z-10 flex items-center gap-2">
                VIEW OUR WORK <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
            <button
              data-cal-link="editco-media/15min"
              data-cal-namespace="15min"
              data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
              className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 px-8 font-archivo text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white hover:text-gaude-black cursor-pointer sm:h-16 sm:w-auto sm:px-10 md:text-[11px]"
            >
              BOOK STRATEGY CALL
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2.5 px-6">
            {[
              "Websites",
              "AI Calling Agents",
              "CRM Systems",
              "Workflow Automations"
            ].map((text, i, arr) => (
              <span key={text} className="flex items-center gap-1.5 font-archivo text-[8px] font-bold uppercase tracking-[0.15em] text-white/30 md:text-[9px] md:tracking-[0.2em]">
                {text}
                {i < arr.length - 1 && <span className="h-0.5 w-0.5 rounded-full bg-gaude-orange/40" />}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Decorative Branding */}
      <div className="absolute bottom-10 left-10 hidden md:block">
        <p className="flex items-center gap-3 font-archivo text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
          <span className="h-[1px] w-8 bg-white/20" />
          Built in Hyderabad • Serving Businesses Globally
        </p>
      </div>

      <div className="absolute right-10 bottom-10 hidden md:block">
        <div className="flex h-8 items-center font-archivo text-[9px] font-bold uppercase tracking-widest text-white/40">
          Built for Clinics, Schools, Agencies & Service Businesses
        </div>
      </div>
    </section>
  );
}
