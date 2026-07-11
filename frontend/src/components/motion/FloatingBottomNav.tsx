"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { MessageSquare, Phone, Calendar, ArrowUpRight, Instagram, Linkedin } from "lucide-react";
import { site } from "@/content/site";

export function FloatingBottomNav() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the hero section (roughly 90% of screen height)
      setIsVisible(window.scrollY > window.innerHeight * 0.9);
    };
    
    // Check initial scroll position
    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { 
      icon: MessageSquare, 
      label: "WhatsApp", 
      href: site.whatsapp,
      color: "hover:text-[#25D366]"
    },
    { 
      icon: Instagram, 
      label: "Instagram", 
      href: site.instagram,
      color: "hover:text-[#E4405F]"
    },
    { 
      icon: Linkedin, 
      label: "LinkedIn", 
      href: site.linkedin,
      color: "hover:text-[#0A66C2]"
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 100, opacity: 0, x: "-50%" }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-4 left-1/2 z-[200] w-[calc(100%-2rem)] max-w-fit px-0 pointer-events-none sm:bottom-8 sm:w-full sm:px-6"
        >
          <div className="pointer-events-auto mx-auto flex w-full max-w-fit items-center gap-1 rounded-full border border-white/10 bg-gaude-black/60 p-1.5 shadow-2xl backdrop-blur-xl">
            {/* Social/Action Buttons */}
            <div className="flex items-center gap-0.5">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-white/50 transition-all hover:bg-white/10 ${item.color}`}
                  title={item.label}
                >
                  <item.icon size={16} className="sm:hidden" />
                  <item.icon size={18} className="hidden sm:block" />
                </a>
              ))}
            </div>

            <div className="mx-1 hidden h-4 w-[1px] bg-white/10 sm:mx-2 md:block" />

            {/* Main "Let's Talk" Button */}
            <button
              data-cal-link="editco-media/15min"
              data-cal-namespace="15min"
              data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-full bg-gaude-orange px-4 font-archivo text-[9px] font-bold uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:h-10 sm:flex-none sm:px-6 sm:text-[10px]"
            >
              Let's Talk
              <ArrowUpRight size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
