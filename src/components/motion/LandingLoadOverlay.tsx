"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function LandingLoadOverlay() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setIsLoaded(true), 100);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div 
      className={`pointer-events-none fixed inset-0 z-[999999] flex items-center justify-center bg-gaude-black transition-transform duration-[1500ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${isLoaded ? "-translate-y-[120%]" : "translate-y-0"}`}
    >
      <div className="font-archivo text-[10vw] font-black uppercase tracking-tighter text-white opacity-10 blur-sm">
        EDITCO MEDIA
      </div>
    </div>
  );
}
