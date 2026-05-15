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

  const bentoCards = [
    {
      ...solution.cards[0],
      colSpan: "md:col-span-2",
      icon: SOLUTION_ICONS[0],
      layout: "flex-row",
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
    },
    {
      ...solution.cards[1],
      colSpan: "md:col-span-1",
      icon: SOLUTION_ICONS[1],
      layout: "flex-col",
      img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2532&auto=format&fit=crop",
    },
    {
      ...solution.cards[2],
      colSpan: "md:col-span-1",
      icon: SOLUTION_ICONS[2],
      layout: "flex-col",
      img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2532&auto=format&fit=crop",
    },
    {
      ...solution.cards[3],
      colSpan: "md:col-span-2",
      icon: SOLUTION_ICONS[3],
      layout: "flex-row",
      img: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=2340&auto=format&fit=crop",
    },
    {
      ...solution.cards[4],
      colSpan: "md:col-span-2",
      icon: SOLUTION_ICONS[4],
      layout: "flex-row",
      img: "https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=2340&auto=format&fit=crop",
    },
    {
      ...solution.cards[5],
      colSpan: "md:col-span-1",
      icon: SOLUTION_ICONS[5],
      layout: "flex-col",
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
    },
  ];

  const CardIllustration = ({ index }: { index: number }) => {
    // Unique illustration logic for each bento card to make it feel premium
    const illustrations = [
      // 0: Websites
      <svg className="w-full h-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="160" height="90" rx="6" fill="white" fillOpacity="0.03" stroke="white" strokeOpacity="0.1" />
        <circle cx="35" cy="32" r="2.5" fill="white" fillOpacity="0.2" />
        <circle cx="45" cy="32" r="2.5" fill="white" fillOpacity="0.2" />
        <circle cx="55" cy="32" r="2.5" fill="white" fillOpacity="0.2" />
        <rect x="30" y="45" width="40" height="40" rx="4" fill="url(#grad0)" fillOpacity="0.3" />
        <rect x="80" y="45" width="90" height="6" rx="3" fill="white" fillOpacity="0.1" />
        <rect x="80" y="58" width="70" height="6" rx="3" fill="white" fillOpacity="0.1" />
        <rect x="80" y="71" width="80" height="6" rx="3" fill="white" fillOpacity="0.1" />
        <defs>
          <linearGradient id="grad0" x1="30" y1="45" x2="70" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#c3a4f6" />
            <stop offset="1" stopColor="#c3a4f6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>,
      // 1: AI
      <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 60C20 60 30 20 60 20C90 20 100 60 100 60C100 60 90 100 60 100C30 100 20 60 20 60Z" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
        <circle cx="60" cy="60" r="15" fill="url(#grad1)" fillOpacity="0.6">
          <animate attributeName="r" values="14;16;14" dur="3s" repeatCount="indefinite" />
        </circle>
        <path d="M40 60H80" stroke="white" strokeOpacity="0.4" strokeWidth="0.5" strokeDasharray="2 2" />
        <path d="M60 40V80" stroke="white" strokeOpacity="0.4" strokeWidth="0.5" strokeDasharray="2 2" />
        <defs>
          <radialGradient id="grad1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 60) rotate(90) scale(15)">
            <stop stopColor="#c3a4f6" />
            <stop offset="1" stopColor="#c3a4f6" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>,
      // 2: Automations
      <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="4" fill="#c3a4f6" />
        <circle cx="30" cy="40" r="3" fill="white" fillOpacity="0.2" />
        <circle cx="90" cy="40" r="3" fill="white" fillOpacity="0.2" />
        <circle cx="30" cy="80" r="3" fill="white" fillOpacity="0.2" />
        <circle cx="90" cy="80" r="3" fill="white" fillOpacity="0.2" />
        <path d="M33 42L57 58" stroke="white" strokeOpacity="0.2" />
        <path d="M87 42L63 58" stroke="white" strokeOpacity="0.2" />
        <path d="M33 78L57 62" stroke="white" strokeOpacity="0.2" />
        <path d="M87 78L63 62" stroke="white" strokeOpacity="0.2" />
      </svg>,
      // 3: UI/UX
      <svg className="w-full h-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="40" y="30" width="80" height="60" rx="8" fill="white" fillOpacity="0.05" stroke="white" strokeOpacity="0.1" />
        <rect x="50" y="40" width="20" height="20" rx="4" fill="#c3a4f6" fillOpacity="0.4" />
        <rect x="75" y="40" width="35" height="4" rx="2" fill="white" fillOpacity="0.2" />
        <rect x="75" y="48" width="25" height="4" rx="2" fill="white" fillOpacity="0.2" />
        <circle cx="130" cy="80" r="25" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
        <circle cx="130" cy="80" r="15" stroke="#c3a4f6" strokeOpacity="0.3" strokeWidth="1" />
      </svg>,
      // 4: CRM
      <svg className="w-full h-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 90L70 40L100 70L130 30L160 60" stroke="#c3a4f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M40 90L70 40L100 70L130 30L160 60V90H40Z" fill="url(#grad4)" fillOpacity="0.1" />
        <circle cx="70" cy="40" r="3" fill="#c3a4f6" />
        <circle cx="130" cy="30" r="3" fill="#c3a4f6" />
        <defs>
          <linearGradient id="grad4" x1="100" y1="30" x2="100" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#c3a4f6" />
            <stop offset="1" stopColor="#c3a4f6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>,
      // 5: SEO
      <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="40" stroke="white" strokeOpacity="0.05" />
        <circle cx="60" cy="60" r="25" stroke="white" strokeOpacity="0.1" />
        <path d="M85 85L100 100" stroke="#c3a4f6" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="60" r="10" fill="#c3a4f6" fillOpacity="0.2" />
        <circle cx="60" cy="60" r="5" fill="#c3a4f6" />
      </svg>,
    ];

    return (
      <div className="relative flex h-full w-full items-center justify-center bg-white/[0.02] group-hover:bg-white/[0.05] transition-all duration-700">
        {/* Subtle Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Gradient Glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gaude-purple/20 blur-[60px] rounded-full" />
        </div>
        
        <div className="relative w-full h-full p-6 transition-transform duration-700 group-hover:scale-105">
          {illustrations[index % illustrations.length]}
        </div>
      </div>
    );
  };

  return (
    <section 
      id={solution.id}
      className="relative z-[50] w-full bg-gaude-black py-16 md:py-24 overflow-hidden"
    >
      {/* Technical Grid Pattern Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.15]" 
          style={{ 
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)'
          }} 
        />
        {/* Intersection Dots */}
        <div 
          className="absolute inset-0 opacity-[0.2]" 
          style={{ 
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)'
          }} 
        />
      </div>

      {/* Noise Background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Subtle Gradient Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gaude-purple/10 to-transparent" />

      <div className="relative mx-auto w-full max-w-[1100px] px-6">
        <div className="mb-12">
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
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {bentoCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-5 md:p-6 transition-all hover:border-white/20 hover:bg-white/[0.06] ${card.colSpan} min-h-[180px] flex flex-col justify-between`}
            >
              {/* Card Grain Overlay */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
              
              <div className={`flex h-full gap-5 ${card.layout === 'flex-row' ? 'flex-col md:flex-row' : 'flex-col'}`}>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-archivo text-lg font-black uppercase leading-none tracking-tighter text-white md:text-xl">
                      {card.title.split(' ').map((word, idx) => (
                        <span key={idx} className="block">{word}</span>
                      ))}
                    </h3>
                    <p className="mt-2 font-inter text-[10px] font-medium leading-relaxed text-white/50 md:text-xs">
                      {card.body}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <a href="#" className="inline-flex items-center gap-1.5 font-archivo text-[9px] font-black uppercase tracking-wider text-gaude-purple hover:brightness-125 hover:underline">
                      View Solution 
                      <Rocket className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>

                <div className={`relative flex-1 ${card.layout === 'flex-row' ? 'h-24 md:h-full' : 'h-24'} overflow-hidden rounded-xl border border-white/10 bg-black/20`}>
                  <CardIllustration index={i} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
