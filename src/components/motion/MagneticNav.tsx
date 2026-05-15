"use client";

import { useCallback, useEffect, useState } from "react";
import { navLinks } from "@/content/nav";
import { site } from "@/content/site";
import { motion, AnimatePresence } from "framer-motion";

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export function MagneticNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const slushNavLinks = [
    { label: "SERVICES", href: "#services" },
    { label: "PROCESS", href: "#process" },
    { label: "CASE STUDY", href: "#case-study" },
    { label: "FAQ", href: "#faq" },
    { label: "CONTACT", href: "#contact" },
  ];

  const smoothSpring = {
    type: "spring",
    stiffness: 260,
    damping: 32,
    mass: 1
  } as const;

  return (
    <>
      {/* 1. Main Centered Pill - Hides on scroll */}
      <div className="fixed inset-x-0 top-8 z-[200] flex justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {!isScrolled && (
            <motion.div 
              layout
              key="centered-nav"
              initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)", scale: 0.95 }}
              transition={smoothSpring}
              className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1.5 shadow-2xl backdrop-blur-xl"
            >
              {/* Logo Image */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-inner overflow-hidden">
                <img 
                  src="https://res.cloudinary.com/dxeoibunj/image/upload/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png" 
                  alt="Editco Logo" 
                  className="h-7 w-7 object-contain"
                />
              </div>

              {/* Desktop Nav Links */}
              <div className="hidden items-center gap-1 md:flex">
                {slushNavLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href.replace("#", ""))}
                    className="rounded-full px-4 py-2 font-archivo text-[10px] font-bold uppercase tracking-widest text-white/70 transition-all hover:bg-white/10 hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              
              <div className="mx-2 hidden h-4 w-[1px] bg-white/10 md:block" />

              {/* Plus Trigger (Un-scrolled state) */}
              <motion.button
                layoutId="plus-trigger"
                onClick={toggleMenu}
                transition={smoothSpring}
                className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:border-gaude-orange/50 hover:bg-gaude-orange/10"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="transition-transform group-hover:rotate-90">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Floating Plus Icon - Appears at top right on scroll */}
      <div className="fixed top-8 right-8 z-[200] pointer-events-none">
        <AnimatePresence mode="wait">
          {isScrolled && (
            <motion.button
              layoutId="plus-trigger"
              key="floating-plus"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              onClick={toggleMenu}
              transition={smoothSpring}
              className="pointer-events-auto group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white shadow-2xl backdrop-blur-xl transition-all hover:border-gaude-orange/50 hover:bg-gaude-orange/10"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="transition-transform group-hover:rotate-90">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ 
              clipPath: "polygon(100% 0, 100% 0, 100% 0, 100% 0)",
            }}
            animate={{ 
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            }}
            exit={{ 
              clipPath: "polygon(100% 0, 100% 0, 100% 0, 100% 0)",
            }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[250] bg-white p-8 md:p-16 text-black"
          >
            <div className="grid h-full grid-cols-1 md:grid-cols-12 gap-8">
              {/* Column 1: Logo (Left) */}
              <div className="md:col-span-3 lg:col-span-4">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://res.cloudinary.com/dxeoibunj/image/upload/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png" 
                    alt="Editco Logo" 
                    className="h-10 w-auto brightness-0 md:h-12"
                  />
                  <span className="font-inter text-2xl font-semibold tracking-tighter uppercase text-black">
                    {site.name}
                  </span>
                </div>
              </div>

              {/* Column 2: Main Links (Center-Right) */}
              <div className="md:col-span-6 lg:col-span-5 flex justify-end">
                <nav className="flex flex-col gap-0">
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.05, duration: 0.4 }}
                      onClick={(e) => {
                        scrollToSection(e, link.href.replace("#", ""));
                        closeMenu();
                      }}
                      className="group relative flex w-fit items-center font-inter text-[clamp(1.8rem,4.5vw,3rem)] font-medium leading-[1.0] tracking-tight text-black transition-opacity hover:opacity-50"
                    >
                      <span className="flex items-center">
                        {link.label}
                        {link.label === "Solution" && (
                          <span className="ml-3 rounded-[4px] bg-[#D4FF3F] px-1.5 py-0.5 font-inter text-[9px] font-black uppercase tracking-widest text-black">
                            New
                          </span>
                        )}
                      </span>
                    </motion.a>
                  ))}
                </nav>
              </div>

              {/* Column 3: Close + Socials (Far Right) */}
              <div className="md:col-span-3 lg:col-span-3 flex flex-col items-end gap-12">
                <button 
                  onClick={closeMenu}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-110 active:scale-95"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                <div className="flex flex-col items-end gap-2 text-right">
                  <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="font-inter text-lg font-medium text-black hover:opacity-50 transition-opacity">Instagram</a>
                  <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="font-inter text-lg font-medium text-black hover:opacity-50 transition-opacity">LinkedIn</a>
                  <a href={`mailto:${site.email}`} className="font-inter text-lg font-medium text-black hover:opacity-50 transition-opacity">Email</a>
                </div>

                <div className="mt-auto hidden text-right text-[10px] font-bold uppercase tracking-widest text-black/40 md:block">
                  <p>© 2026 {site.name.toUpperCase()}</p>
                  <p>HYDERABAD, INDIA</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
