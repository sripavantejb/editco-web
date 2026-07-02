"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Zap, 
  Palette, 
  Users, 
  Search, 
  BarChart3, 
  ShieldCheck,
  Rocket
} from "lucide-react";
import { solution } from "@/content/landing";
import { SectionHeading } from "@/components/ui/SectionHeading";

const SOLUTION_ICONS = [
  Zap,        // Workflow Automations
  Palette,    // UI/UX Design
  Users,      // CRM & Lead Management
  Search,     // SEO & AEO
  BarChart3,  // Scale-Ready Performance
  ShieldCheck // Security/Quality
];

const cardColors = [
  "#D4FF3F", // Lime/Yellow
  "#C3A4F6", // Lavender
  "#FF8A5C", // Vibrant Orange
  "#36DF93", // Mint Green
  "#FF7EB6", // Pink
  "#88E0EF", // Cyan/Sky
];

const textColors = [
  "text-black",
  "text-black",
  "text-black",
  "text-black",
  "text-black",
  "text-black",
];

export function SolutionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section 
      id={solution.id}
      ref={containerRef}
      className="relative z-[50] w-full bg-gaude-black py-16 md:pt-24 md:pb-48"
    >
      <div className="mx-auto w-full max-w-[1100px] px-6">
        <div className="mb-12 md:mb-16">
          <SectionHeading 
            title={
              <>
                Editco Media Builds Complete <span className="text-gaude-purple">Digital Growth Systems.</span>
              </>
            } 
            description={solution.description} 
            light 
          />
        </div>

        <div className="relative flex flex-col gap-[5vh]">
          {solution.cards.map((card, i) => (
            <Card 
              key={card.title} 
              card={card} 
              index={i} 
              total={solution.cards.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ card, index, total, scrollYProgress }: any) {
  const Icon = SOLUTION_ICONS[index % SOLUTION_ICONS.length];
  const bgColor = cardColors[index % cardColors.length];

  // Logic for stacking and scaling
  const targetScale = 1 - ((total - index) * 0.05);
  const scale = useTransform(scrollYProgress, [index / total, 1], [1, targetScale]);
  
  // Subtle top offset to keep them visible as they stack - Lifted higher (60px instead of 100px)
  const topOffset = 60 + (index * 20);

  return (
    <div className="sticky top-0 flex h-[80vh] items-center justify-center">
      <motion.div
        style={{ 
          scale,
          top: topOffset,
          backgroundColor: bgColor
        }}
        className={`relative h-[500px] w-full overflow-hidden rounded-[32px] border-4 border-black p-8 md:p-12 shadow-[8px_8px_0_0_#000] transition-shadow hover:shadow-[12px_12px_0_0_#000]`}
      >
        {/* Technical Background Details */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} 
        />
        
        <div className="relative flex h-full flex-col justify-between md:flex-row md:items-center">
          {/* Content Side */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
                <Icon size={24} />
              </div>
              <span className="font-archivo text-xs font-black uppercase tracking-[0.2em] text-black/40">
                System 0{index + 1}
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="font-archivo text-4xl font-black uppercase leading-[0.9] tracking-tighter text-black md:text-6xl lg:text-7xl">
                {card.title}
              </h3>
              <p className="max-w-md font-inter text-sm font-medium leading-relaxed text-black/70 md:text-lg">
                {card.body}
              </p>
            </div>

            <div className="pt-4">
              <a 
                href="#cta" 
                className="group inline-flex items-center gap-3 rounded-full border-2 border-black bg-black px-6 py-3 font-archivo text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-transparent hover:text-black"
              >
                Get Started
                <Rocket className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" size={16} />
              </a>
            </div>
          </div>

          {/* Visual/Illustration Side */}
          <div className="hidden flex-1 md:flex justify-end items-center">
            <div className="relative h-64 w-64 md:h-80 md:w-80 overflow-hidden rounded-2xl border-2 border-black/10 bg-black/[0.03]">
              <CardIllustration index={index} />
            </div>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="absolute bottom-8 right-8 hidden md:block">
          <p className="font-archivo text-[10px] font-black uppercase tracking-widest text-black/20">
            Editco Growth Engine v2.0 // Stacked Layer 0{index + 1}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function CardIllustration({ index }: { index: number }) {
  // Keeping the premium SVG illustrations from before but adapted for the new layout
  const illustrations = [
    // 0: Websites
    <svg key="0" className="w-full h-full p-12" viewBox="0 0 200 120" fill="none">
      <rect x="20" y="20" width="160" height="90" rx="6" stroke="black" strokeWidth="2" />
      <rect x="30" y="45" width="40" height="40" rx="4" fill="black" fillOpacity="0.1" />
      <rect x="80" y="45" width="90" height="4" rx="2" fill="black" fillOpacity="0.2" />
      <rect x="80" y="55" width="70" height="4" rx="2" fill="black" fillOpacity="0.2" />
    </svg>,
    // 1: AI
    <svg key="1" className="w-full h-full p-12" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="40" stroke="black" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="60" cy="60" r="20" fill="black" fillOpacity="0.1" />
      <path d="M40 60H80" stroke="black" strokeWidth="2" />
      <path d="M60 40V80" stroke="black" strokeWidth="2" />
    </svg>,
    // 2: Automations
    <svg key="2" className="w-full h-full p-12" viewBox="0 0 120 120" fill="none">
      <rect x="20" y="20" width="30" height="30" rx="4" stroke="black" strokeWidth="2" />
      <rect x="70" y="70" width="30" height="30" rx="4" stroke="black" strokeWidth="2" />
      <path d="M50 35H85V70" stroke="black" strokeWidth="2" strokeDasharray="4 2" />
    </svg>,
    // 3: UI/UX
    <svg key="3" className="w-full h-full p-12" viewBox="0 0 120 120" fill="none">
      <path d="M20 20L100 100M20 100L100 20" stroke="black" strokeOpacity="0.1" strokeWidth="1" />
      <circle cx="60" cy="60" r="30" stroke="black" strokeWidth="2" />
      <rect x="45" y="45" width="30" height="30" fill="black" fillOpacity="0.1" />
    </svg>,
    // 4: CRM
    <svg key="4" className="w-full h-full p-12" viewBox="0 0 200 120" fill="none">
      <path d="M20 100 L60 40 L100 80 L140 20 L180 60" stroke="black" strokeWidth="3" />
      <circle cx="140" cy="20" r="6" fill="black" />
    </svg>,
    // 5: SEO
    <svg key="5" className="w-full h-full p-12" viewBox="0 0 120 120" fill="none">
      <circle cx="50" cy="50" r="30" stroke="black" strokeWidth="2" />
      <path d="M72 72L100 100" stroke="black" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ];

  return illustrations[index % illustrations.length];
}
