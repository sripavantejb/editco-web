"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { process } from "@/content/landing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionFlow } from "@/lib/stickyStack";
import { ArrowRight, ChevronRight, Zap } from "lucide-react";

export function ProcessSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section
      id={process.id}
      ref={containerRef}
      className={`relative overflow-hidden bg-gaude-black px-4 py-24 md:px-8 md:py-32 ${sectionFlow}`}
    >
      {/* Technical Background */}
      <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:60px_60px]" />
      
      {/* Glowing Line and Path */}
      <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white/5 hidden md:block">
        <motion.div 
          style={{ height: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }}
          className="w-full bg-gradient-to-b from-gaude-orange via-gaude-purple to-gaude-green shadow-[0_0_20px_rgba(255,78,0,0.5)]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-gaude-orange/20 bg-gaude-orange/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gaude-orange"
          >
            <Zap size={12} className="fill-current" />
            THE BLUEPRINT
          </motion.div>
          <SectionHeading 
            title={
              <>
                OUR <span className="text-gaude-orange italic">EXECUTION</span> PROCESS
              </>
            } 
            description="A standardized technical roadmap engineered for speed, quality, and results."
            light 
          />
        </div>

        <div className="relative space-y-24 md:space-y-40">
          {process.steps.map((step, i) => (
            <div key={step.title} className="group relative flex flex-col items-center md:flex-row md:justify-between">
              {/* Desktop Mirroring Logic */}
              <div className={`flex w-full flex-col md:w-[45%] ${i % 2 === 0 ? 'md:items-end md:text-right' : 'md:order-last md:items-start md:text-left'}`}>
                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  {/* Step Number Tag */}
                  <span className="mb-4 inline-block font-archivo text-[8vw] font-black leading-none opacity-5 md:text-[6vw]">
                    0{i + 1}
                  </span>

                  {/* Creative Card */}
                  <div className="relative overflow-hidden rounded-[2px] border-l-4 border-gaude-orange bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/[0.08]">
                    {/* Technical Corners */}
                    <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-white/20" />
                    <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-white/20" />
                    
                    <h3 className="font-archivo text-2xl font-black uppercase tracking-tighter text-white md:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-4 font-inter text-base font-medium leading-relaxed text-white/60">
                      {step.body}
                    </p>
                    
                    <div className="mt-6 flex items-center gap-2 font-archivo text-[10px] font-black uppercase tracking-widest text-gaude-orange">
                      System Initialized <ChevronRight size={12} className="animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Central Node */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 hidden md:block">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="relative z-20 flex h-12 w-12 items-center justify-center rounded-full border-4 border-gaude-black bg-white text-gaude-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <span className="font-archivo text-sm font-black">{i + 1}</span>
                  {/* Pulse Effect */}
                  <div className="absolute inset-0 animate-ping rounded-full bg-white/20" />
                </motion.div>
              </div>

              {/* Mobile Mobile Number (Visible on small screens) */}
              <div className="mt-6 flex h-10 w-10 items-center justify-center border-2 border-white/20 bg-white/5 font-archivo text-lg font-black text-white md:hidden">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
