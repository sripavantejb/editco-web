"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/content/nav";
import { EDITCO_LOGO } from "@/content/images";
import { site } from "@/content/site";
import { motion, AnimatePresence } from "framer-motion";

export function MagneticNav() {
  const pathname = usePathname();
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
    { label: "SERVICES", href: "/services" },
    { label: "PROCESS", href: "#process" },
    { label: "CASE STUDY", href: "#case-study" },
    { label: "FAQ", href: "#faq" },
    { label: "CONTACT", href: "#contact" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      const id = href.replace("#", "");
      if (pathname === "/") {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
      closeMenu();
    } else {
      closeMenu();
    }
  };

  const getActiveHref = (href: string) => {
    if (href.startsWith("#") && pathname !== "/") {
      return `/${href}`;
    }
    return href;
  };

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
              <Link
                href="/"
                aria-label="Editco Media home"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-inner overflow-hidden transition-colors hover:border-white/25 hover:bg-white/10"
              >
                <Image
                  src={EDITCO_LOGO.src.nav}
                  alt={EDITCO_LOGO.altPrimary}
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                  loading="lazy"
                />
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden items-center gap-1 md:flex">
                {slushNavLinks.map((link) => (
                  <a
                    key={link.label}
                    href={getActiveHref(link.href)}
                    onClick={(e) => handleNavClick(e, link.href)}
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
                className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:border-gaude-orange/50 hover:bg-gaude-orange/10"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="transition-transform group-hover:rotate-90">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Floating Plus Icon - Appears at top right on scroll */}
      <div className="fixed top-4 right-4 md:top-8 md:right-8 z-[200] pointer-events-none">
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
              className="pointer-events-auto group flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white shadow-2xl backdrop-blur-xl transition-all hover:border-gaude-orange/50 hover:bg-gaude-orange/10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="h-6 w-6 md:h-7 md:w-7 transition-transform group-hover:rotate-90">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Floating Logo - Appears at top left on scroll to balance the plus button */}
      <div className="fixed top-4 left-4 md:top-8 md:left-8 z-[200] pointer-events-none">
        <AnimatePresence mode="wait">
          {isScrolled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -20, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.8, x: -20, filter: "blur(10px)" }}
              transition={smoothSpring}
              className="pointer-events-auto"
            >
              <Link
                href="/"
                aria-label="Editco Media home"
                className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center transition-opacity hover:opacity-80"
              >
                <Image
                  src={EDITCO_LOGO.src.navFloating}
                  alt={EDITCO_LOGO.altPrimary}
                  width={48}
                  height={48}
                  className="h-8 w-8 object-contain md:h-12 md:w-12"
                  loading="lazy"
                />
              </Link>
            </motion.div>
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
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="flex w-fit items-center gap-3 transition-opacity hover:opacity-70"
                  aria-label="Editco Media home"
                >
                  <Image
                    src={EDITCO_LOGO.src.menu}
                    alt=""
                    width={48}
                    height={48}
                    className="h-10 w-auto brightness-0 md:h-12"
                    aria-hidden
                  />
                  <span className="font-inter text-2xl font-semibold tracking-tighter uppercase text-black">
                    {site.name}
                  </span>
                </Link>
              </div>

              {/* Column 2: Main Links (Center-Right) */}
              <div className="md:col-span-6 lg:col-span-5 flex justify-end">
                <nav className="flex flex-col gap-0">
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={link.href}
                      href={getActiveHref(link.href)}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.05, duration: 0.4 }}
                      onClick={(e) => handleNavClick(e, link.href)}
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
