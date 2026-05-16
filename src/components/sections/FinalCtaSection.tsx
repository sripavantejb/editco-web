"use client";

import { useEffect } from "react";
import { finalCta } from "@/content/landing";
import { sectionFlow } from "@/lib/stickyStack";

export function FinalCtaSection() {
  useEffect(() => {
    // Initialize Cal.com inline embed
    const initCal = () => {
      (window as any).Cal?.ns["15min"]("inline", {
        elementOrSelector: "#cal-inline-embed",
        calLink: "editco-media/15min",
        config: { 
          layout: "month_view",
          theme: "dark"
        }
      });
    };

    if ((window as any).Cal) {
      initCal();
    } else {
      const timer = setInterval(() => {
        if ((window as any).Cal) {
          initCal();
          clearInterval(timer);
        }
      }, 500);
      return () => clearInterval(timer);
    }
  }, []);

  return (
    <section
      id={finalCta.id}
      className={`relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#050505] px-4 py-16 md:px-8 md:py-24 ${sectionFlow}`}
    >
      {/* Premium Background Visuals */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-gaude-orange/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-gaude-purple/5 blur-[150px]" />
        
        {/* Subtle Grid Texture */}
        <div className="absolute inset-0 opacity-[0.02] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gaude-orange/30 bg-gaude-orange/5 px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gaude-orange opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gaude-orange"></span>
            </span>
            <span className="font-archivo text-[10px] font-bold uppercase tracking-[0.2em] text-gaude-orange/90">
              BOOK YOUR STRATEGY CALL
            </span>
          </div>

          <h2 className="font-archivo text-4xl uppercase leading-[0.85] tracking-[-0.04em] text-white md:text-7xl">
            READY TO <span className="text-gaude-orange">SCALE?</span>
          </h2>
        </div>

        {/* Cal.com Inline Embed Container */}
        <div className="relative mx-auto min-h-[600px] md:h-[700px] w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
          <div 
            id="cal-inline-embed" 
            className="h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}
