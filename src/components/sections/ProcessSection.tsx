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
              <div key={step.title} className="group relative flex flex-col items-center md:flex-row">
                
                {/* Content Card Side */}
                <div className={`flex w-full flex-col md:w-1/2 ${isEven ? 'md:pr-24 md:items-end' : 'md:pl-24 md:order-last md:items-start'}`}>
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-md"
                  >
                    {/* Ghost Numbering */}
                    <span className={`absolute -top-12 font-archivo text-[120px] font-black leading-none opacity-[0.03] md:-top-20 ${isEven ? 'right-0' : 'left-0'}`}>
                      {i + 1}
                    </span>

                    {/* Technical Card */}
                    <div className="relative rounded-[4px] border border-white/10 bg-white/[0.02] p-8 backdrop-blur-md transition-all hover:border-gaude-orange/30 hover:bg-white/[0.05]">
                      {/* Technical Decorative Bits */}
                      <div className="absolute -left-[2px] top-1/2 h-8 w-[4px] -translate-y-1/2 bg-gaude-orange opacity-0 transition-opacity group-hover:opacity-100" />
                      
                      <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gaude-orange ${isEven ? 'md:ml-auto' : ''}`}>
                        <Icon size={24} strokeWidth={1.5} />
                      </div>

                      <h3 className={`font-archivo text-xl font-black uppercase tracking-tight text-white md:text-2xl ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                        {step.title}
                      </h3>
                      <p className={`mt-4 font-inter text-sm font-medium leading-relaxed text-white/50 md:text-base ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                        {step.body}
                      </p>
                      
                      <div className={`mt-8 flex items-center gap-2 font-archivo text-[9px] font-black uppercase tracking-widest text-gaude-orange/60 ${isEven ? 'md:justify-end' : ''}`}>
                        <span className="h-1 w-1 rounded-full bg-gaude-orange animate-pulse" />
                        PHASE {i + 1} ACTIVE
                      </div>
                    </div>

                    {/* Connecting Arm (Desktop Only) */}
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      className={`absolute top-1/2 hidden h-[1px] w-24 bg-gradient-to-r from-gaude-orange/50 to-transparent md:block ${isEven ? '-right-24 origin-left' : '-left-24 origin-right rotate-180'}`}
                    />
                  </motion.div>
                </div>

                {/* Central Node Node */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    className="relative z-30 flex h-10 w-10 items-center justify-center border-2 border-white/20 bg-gaude-black text-white transition-all group-hover:border-gaude-orange group-hover:bg-gaude-orange group-hover:text-black"
                  >
                    <span className="font-archivo text-xs font-black">{i + 1}</span>
                    {/* Ring */}
                    <div className="absolute inset-[-6px] rounded-full border border-white/5" />
                  </motion.div>
                </div>

                {/* Mobile Step Header */}
                <div className="mb-6 flex items-center gap-4 md:hidden">
                   <div className="h-[1px] w-8 bg-white/20" />
                   <span className="font-archivo text-sm font-black text-gaude-orange">{i + 1}</span>
                   <div className="h-[1px] w-8 bg-white/20" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
