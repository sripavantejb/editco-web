"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  Zap, 
  Palette, 
  Users, 
  Search, 
  BarChart3, 
  Rocket, 
  ShieldCheck 
} from "lucide-react";
import { solution } from "@/content/landing";
import { SlamBlock } from "@/components/motion/SlamBlock";
import { SectionHeading } from "@/components/ui/SectionHeading";

const cardAccents = [
  "bg-gaude-purple",
  "bg-gaude-orange",
  "bg-gaude-green",
  "bg-gaude-pink",
  "bg-white",
  "bg-[#c3a4f6]",
];

const SOLUTION_ICONS = [
  Zap,        // Workflow Automations
  Palette,    // UI/UX Design
  Users,      // CRM & Lead Management
  Search,     // SEO & AEO
  BarChart3,  // Scale-Ready Performance
  ShieldCheck // Security/Quality
];

export function SolutionSection() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Simple linear horizontal translation - calibrated for max-w-1200
  const x = useTransform(smoothProgress, [0, 1], ["0%", "-75%"]);

  return (
    <section 
      id={solution.id}
      ref={targetRef} 
      className="relative z-[50] w-full h-[250vh] bg-gaude-black"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {/* Main Grid Container */}
        <div className="mx-auto flex w-full max-w-[1200px] flex-col px-6 pt-[110px]">
          <SectionHeading 
            title={
              <>
                Editco Media Builds Complete <span className="text-gaude-purple">Digital Growth Systems.</span>
              </>
            } 
            description={solution.description} 
            light 
          />
          
          <div className="relative mt-8 md:mt-12">
            <motion.div 
              style={{ x }} 
              className="flex gap-6 md:gap-10"
            >
              {solution.cards.map((card, i) => {
                const Icon = SOLUTION_ICONS[i % SOLUTION_ICONS.length];
                return (
                  <div key={card.title} className="shrink-0">
                    <SlamBlock
                      id={`slam-solution-${i}`}
                      hoverClasses="hover:-translate-y-2 transition-transform"
                      className={`relative flex h-[320px] w-[280px] flex-col border-4 border-gaude-black p-6 shadow-[10px_10px_0_0_#000] transition-all md:h-[420px] md:w-[380px] md:p-8 ${cardAccents[i % cardAccents.length]}`}
                    >
                      <article className="flex h-full flex-col text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-gaude-black bg-white/20">
                            <Icon className="h-6 w-6 text-gaude-black" strokeWidth={2.5} />
                          </div>
                          <span className="font-archivo text-xs font-black uppercase opacity-30">0{i + 1}</span>
                        </div>

                        <h3 className="mt-6 font-archivo text-xl font-black uppercase leading-[1.1] tracking-tighter text-gaude-black md:text-3xl">
                          {card.title}
                        </h3>
                        <div className="mt-3 h-1.5 w-10 bg-gaude-black" />
                        <p className="mt-6 font-inter text-sm font-bold leading-relaxed text-gaude-black/80 md:text-base">
                          {card.body}
                        </p>
                        
                        <div className="mt-auto flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-gaude-black/20" />
                           <span className="font-archivo text-[10px] font-black uppercase tracking-widest text-gaude-black/40">Growth Solution</span>
                        </div>
                      </article>
                    </SlamBlock>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
