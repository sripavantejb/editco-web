"use client";

import { motion } from "framer-motion";
import { comparison } from "@/content/landing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionFlow } from "@/lib/stickyStack";
import { X, CheckCircle2, Zap, ArrowRight } from "lucide-react";

export function ComparisonSection() {
  return (
    <section
      id={comparison.id}
      className={`relative overflow-hidden border-b-4 border-gaude-black bg-gaude-black px-4 py-24 md:px-8 md:py-32 ${sectionFlow}`}
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-gaude-pink/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-gaude-orange/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-16 md:mb-24">
          <SectionHeading 
            title={
              <>
                NOT JUST ANOTHER <span className="text-gaude-pink italic">MARKETING</span> AGENCY
              </>
            } 
            description="Traditional agencies sell services. We build high-conversion technical growth systems."
            light 
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-0">
          {/* Traditional Agency Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative flex flex-col border-4 border-white/5 bg-white/[0.02] p-8 md:border-r-0 md:p-12"
          >
            <div className="mb-10">
              <span className="font-archivo text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                THE OLD WAY
              </span>
              <h3 className="mt-2 font-archivo text-3xl font-black uppercase tracking-tighter text-white/50">
                TRADITIONAL AGENCY
              </h3>
            </div>

            <ul className="space-y-6">
              {comparison.rows.map((row, i) => (
                <li key={i} className="flex items-start gap-4 opacity-40 transition-opacity group-hover:opacity-60">
                  <X className="mt-1 size-5 shrink-0 text-gaude-pink" />
                  <p className="font-inter text-base font-medium text-white/80 line-through decoration-gaude-pink/50">
                    {row.agency}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-12 border-t border-white/10 pt-8">
              <p className="font-inter text-sm font-bold text-white/30">
                Result: Stagnant growth & manual headaches.
              </p>
            </div>
          </motion.div>

          {/* Editco Media Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex flex-col border-4 border-gaude-orange bg-gaude-orange p-8 shadow-[20px_20px_0_0_rgba(255,78,0,0.1)] md:p-12"
          >
            {/* Glossy Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            
            <div className="mb-10">
              <div className="flex items-center gap-2">
                <Zap className="size-4 fill-white text-white" />
                <span className="font-archivo text-[10px] font-black uppercase tracking-[0.3em] text-white">
                  THE SYSTEM WAY
                </span>
              </div>
              <h3 className="mt-2 font-archivo text-3xl font-black uppercase tracking-tighter text-white">
                EDITCO MEDIA
              </h3>
            </div>

            <ul className="space-y-6">
              {comparison.rows.map((row, i) => (
                <li key={i} className="flex items-start gap-4">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-white" />
                  <p className="font-inter text-base font-extrabold text-white">
                    {row.editco}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-12 border-t border-white/20 pt-8">
              <div className="flex items-center justify-between">
                <p className="font-inter text-sm font-black text-white">
                  Result: Automated scaling & clear ROI.
                </p>
                <ArrowRight className="text-white" />
              </div>
            </div>

            {/* "Better" Badge */}
            <div className="absolute -right-4 -top-4 rotate-12 border-4 border-gaude-black bg-white px-4 py-1 font-archivo text-xs font-black uppercase text-gaude-black shadow-[4px_4px_0_0_#000]">
              THE FUTURE
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
