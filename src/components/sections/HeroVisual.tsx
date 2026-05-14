"use client";

import { motion } from "framer-motion";

export function HeroVisual() {
  return (
    <div className="relative flex min-h-[480px] w-full items-center justify-center md:min-h-[560px]">
      {/* Soft radial glow behind */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gaude-black/20 blur-[100px]" />

      {/* Main Board Container */}
      <motion.div
        initial={{ opacity: 0, x: 20, rotate: 1 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[500px] rounded-[28px] border-[3px] border-gaude-black bg-white p-6 shadow-[12px_12px_0_0_#0a0a0a] md:p-8"
      >
        <div className="flex flex-col gap-5">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between border-b-2 border-gaude-black/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gaude-orange" />
              <span className="font-archivo text-xs uppercase tracking-widest text-gaude-black">
                Growth Dashboard
              </span>
            </div>
            <span className="rounded-full bg-gaude-green/20 px-3 py-1 font-inter text-[10px] font-bold text-gaude-black/60 uppercase tracking-wider">
              Live Systems
            </span>
          </div>

          {/* Card 1: New Website Lead */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border-2 border-gaude-black bg-gaude-orange/5 p-4 shadow-[4px_4px_0_0_#0a0a0a]"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-gaude-black/50">
                  New Website Lead
                </p>
                <h4 className="font-syne text-lg font-black text-gaude-black">
                  Rahul Sharma
                </h4>
              </div>
              <span className="h-fit rounded-lg border-2 border-gaude-black bg-white px-2 py-1 font-inter text-[10px] font-black uppercase">
                Captured
              </span>
            </div>
            <p className="mt-2 font-inter text-xs font-semibold text-gaude-black/70">
              Service: Clinic Growth System
            </p>
          </motion.div>

          {/* Connector Arrow */}
          <div className="flex justify-center -my-2 opacity-40">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gaude-black">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>

          {/* Card 2: AI Agent */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border-2 border-gaude-black bg-gaude-purple/10 p-4 shadow-[4px_4px_0_0_#0a0a0a]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gaude-black bg-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gaude-purple">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                </div>
                <div>
                  <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-gaude-black/50">
                    AI Agent Calling...
                  </p>
                  <p className="font-syne text-sm font-black text-gaude-black">
                    Interested Lead
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="rounded bg-gaude-orange px-2 py-0.5 font-inter text-[8px] font-black text-white uppercase">
                  High Intent
                </span>
              </div>
            </div>
          </motion.div>

          {/* Connector Arrow */}
          <div className="flex justify-center -my-2 opacity-40">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gaude-black">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>

          {/* Card 3: CRM / Pipeline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-xl border-2 border-gaude-black bg-white p-4 shadow-[4px_4px_0_0_#0a0a0a]"
          >
             <p className="mb-3 font-inter text-[10px] font-bold uppercase tracking-wider text-gaude-black/50">
               CRM Pipeline
             </p>
             <div className="flex items-center gap-1 overflow-hidden">
               {["New", "Follow", "Book", "Close"].map((stage, i) => (
                 <div key={stage} className="flex items-center flex-1">
                   <div className={`flex-1 rounded-md border-2 border-gaude-black py-1.5 text-center font-inter text-[9px] font-black uppercase ${i === 2 ? 'bg-gaude-green text-white' : 'bg-white text-gaude-black/40'}`}>
                     {stage}
                   </div>
                   {i < 3 && <span className="mx-0.5 text-gaude-black/20">→</span>}
                 </div>
               ))}
             </div>
          </motion.div>

          {/* Floating Final Tag */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-6 bottom-12 rounded-xl border-2 border-gaude-black bg-white px-4 py-3 shadow-[8px_8px_0_0_#0a0a0a]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gaude-green/20 text-gaude-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="font-inter text-[10px] font-bold text-gaude-black/50 uppercase">WhatsApp Sent</p>
                <p className="font-syne text-xs font-black text-gaude-black">Demo Booked</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Background shapes */}
      <div className="absolute top-0 right-0 h-24 w-24 rounded-full border-4 border-gaude-black bg-gaude-orange/20" />
      <div className="absolute bottom-12 left-0 h-16 w-16 rounded-full border-4 border-gaude-black bg-gaude-purple/20" />
    </div>
  );
}
