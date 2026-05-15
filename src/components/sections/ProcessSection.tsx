"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { process } from "@/content/landing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionFlow } from "@/lib/stickyStack";
import { 
  Search, 
  Target, 
  PenTool, 
  Code2, 
  LineChart,
  ChevronRight, 
  Zap,
  Activity
} from "lucide-react";

const STEP_ICONS = [
  Search,    // Understand
  Target,    // Growth Gaps
  PenTool,   // Design
  Code2,     // Build
  LineChart  // Optimize
];

export function ProcessSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <section
      id={process.id}
      ref={containerRef}
      className={`relative overflow-hidden bg-gaude-black px-4 py-24 md:px-8 md:py-32 ${sectionFlow}`}
    >
      {/* Technical Background Grid */}
      <div className="absolute inset-0 opacity-[0.1]" 
           style={{ 
             backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
             backgroundSize: '40px 40px' 
           }} 
      />
      
      {/* Glowing Central Path */}
      <div className="absolute left-1/2 top-0 h-full w-[1px] -translate-x-1/2 bg-white/5 hidden md:block">
        <motion.div 
          style={{ height: useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]) }}
          className="w-full bg-gradient-to-b from-gaude-orange via-gaude-purple to-gaude-green shadow-[0_0_15px_rgba(255,78,0,0.3)]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-gaude-orange/20 bg-gaude-orange/5 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-gaude-orange"
          >
            <Activity size={10} className="animate-pulse" />
            OPERATIONAL FRAMEWORK
          </motion.div>
          
          <SectionHeading 
            title={
              <span className="text-white">
                OUR <span className="text-gaude-orange italic">EXECUTION</span> PROCESS
              </span>
            } 
            description="A high-performance roadmap engineered to take your business from stagnant to scaling."
            light 
          />
        </div>

        <div className="relative space-y-32 md:space-y-48">
          {process.steps.map((step, i) => {
            const Icon = STEP_ICONS[i % STEP_ICONS.length];
            const isEven = i % 2 === 0;

            return (
              <div key={step.title} className="relative flex w-full flex-col items-center">
                
                {/* Desktop Central Node */}
                <div className="absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 hidden md:block">
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/20 bg-gaude-black p-1 transition-all group-hover:border-gaude-orange"
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-full border border-white/5 bg-white/5 font-archivo text-xs font-black text-white group-hover:bg-gaude-orange group-hover:text-black">
                      {i + 1}
                    </div>
                  </motion.div>
                </div>

                {/* Content Container (Alternates Left/Right) */}
                <div className={`flex w-full items-center ${isEven ? 'justify-start' : 'justify-end'}`}>
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full px-4 md:w-[45%] md:px-0"
                  >
                    {/* Ghost Numbering */}
                    <span className={`absolute -top-16 font-archivo text-[140px] font-black leading-none opacity-[0.03] md:-top-24 ${isEven ? '-right-10' : '-left-10'}`}>
                      0{i + 1}
                    </span>

                    {/* Technical Card */}
                    <div className="group relative z-10 rounded-[2px] border border-white/10 bg-white/[0.02] p-8 backdrop-blur-md transition-all hover:border-gaude-orange/30 hover:bg-white/[0.04]">
                      {/* Technical Accent Line */}
                      <div className={`absolute top-0 h-1 w-12 bg-gaude-orange transition-all duration-500 group-hover:w-24 ${isEven ? 'right-0' : 'left-0'}`} />
                      
                      <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gaude-orange shadow-inner ${isEven ? 'md:ml-auto' : ''}`}>
                        <Icon size={28} strokeWidth={1.5} />
                      </div>

                      <h3 className={`font-archivo text-2xl font-black uppercase tracking-tight text-white md:text-3xl ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                        {step.title}
                      </h3>
                      <p className={`mt-4 font-inter text-sm font-medium leading-relaxed text-white/50 md:text-base ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                        {step.body}
                      </p>
                      
                      <div className={`mt-8 flex items-center gap-3 font-archivo text-[9px] font-black uppercase tracking-[0.25em] text-gaude-orange/60 ${isEven ? 'md:justify-end' : ''}`}>
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gaude-orange opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-gaude-orange"></span>
                        </span>
                        PHASE 0{i + 1} LIVE
                      </div>
                    </div>

                    {/* Connecting Arm (Desktop Only) */}
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className={`absolute top-1/2 z-0 hidden h-[1px] w-20 bg-gradient-to-r from-gaude-orange/40 to-transparent md:block ${isEven ? '-right-20 origin-left' : '-left-20 origin-right rotate-180'}`}
                    />
                  </motion.div>
                </div>

                {/* Mobile Step Divider */}
                <div className="mt-12 flex w-full items-center gap-4 md:hidden">
                   <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                   <span className="font-archivo text-xs font-black text-gaude-orange/40">0{i + 1}</span>
                   <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
