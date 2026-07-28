"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Instagram, Mail } from "lucide-react";
import { footer, industriesWorked } from "@/content/landing";
import { site } from "@/content/site";
import { sectionFlowAfter } from "@/lib/stickyStack";
import FallingText from "@/components/motion/FallingText";

const PaperPlaneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-24 w-24 text-black/10">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SupportIcon = () => (
  <svg viewBox="0 0 100 100" className="h-32 w-32 text-black">
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="opacity-20" />
    <path d="M30 50c0-11 9-20 20-20s20 9 20 20v10c0 5.5-4.5 10-10 10h-20c-5.5 0-10-4.5-10-10V50z" fill="none" stroke="currentColor" strokeWidth="4" />
    <circle cx="35" cy="55" r="8" fill="currentColor" />
    <circle cx="65" cy="55" r="8" fill="currentColor" />
    <path d="M40 75c0 3 4 5 10 5s10-2 10-5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a2.7 2.7 0 0 0-2.7-2.7c-1.2 0-2.1.7-2.5 1.5v-1.3H10v7.8h3.3v-4.2c0-.6.4-1.1 1.1-1.1.7 0 1.1.5 1.1 1.1v4.2h3.3M6.7 18.5V10.7H10v7.8H6.7m1.6-9a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4z" />
  </svg>
);

export function FooterSection() {
  return (
    <footer
      id={footer.id}
      className={`relative overflow-hidden bg-black py-4 font-inter md:py-6 ${sectionFlowAfter}`}
    >
      {/* Industry chips fall across the whole footer */}
      <div
        id={industriesWorked.id}
        className="pointer-events-none absolute inset-0 z-30"
        aria-hidden
      >
        <FallingText
          className="!h-full !p-3 md:!p-5"
          text={industriesWorked.items.join(" ")}
          highlightWords={[...industriesWorked.items]}
          wordClassMap={{ ...industriesWorked.chipClassByWord }}
          trigger="scroll"
          gravity={0.85}
          mouseConstraintStiffness={1.2}
          fontSize="clamp(0.9rem, 2.1vw, 1.4rem)"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 md:px-2">
        {/* Top Cards stay clickable above the chip layer */}
        <div className="pointer-events-none relative z-40 grid grid-cols-1 gap-1.5 md:grid-cols-2">
          <div className="pointer-events-auto relative overflow-hidden rounded-[20px] bg-[#FFD600] p-4 md:p-6">
            <div className="relative z-10">
              <h2 className="mb-0.5 max-w-md origin-left font-archivo text-2xl italic leading-[0.85] tracking-[-0.05em] text-black skew-x-[-12deg] sm:text-3xl md:text-5xl">
                YOUR INBOX
                <br />
                JUST GOT BETTER
              </h2>
              <p className="mb-3 max-w-[260px] text-[13px] font-bold leading-tight text-black/90">
                Subscribe to our newsletter for VIP access to news, offers, and insights!
              </p>

              <div className="flex flex-col gap-1.5">
                <div className="flex w-full max-w-sm flex-col gap-2 sm:max-w-xs">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full min-w-0 rounded-full border-none bg-white px-3.5 py-2.5 text-[11px] text-black placeholder-black/40 focus:ring-1 focus:ring-black/10"
                  />
                  <button
                    type="button"
                    className="w-full rounded-full bg-black px-3.5 py-2 text-[9px] font-black text-white transition-transform hover:scale-105 active:scale-95 sm:w-auto"
                  >
                    SUBSCRIBE
                  </button>
                </div>
                <label className="flex items-start gap-1 text-[8px] font-bold leading-none text-black/60">
                  <input
                    type="checkbox"
                    className="h-2.5 w-2.5 shrink-0 rounded border-none bg-black/10 text-black focus:ring-transparent"
                  />
                  <span>I agree to receive communications from {site.name}.</span>
                </label>
              </div>
            </div>

            <div className="absolute top-8 right-3 hidden rotate-[-10deg] opacity-40 md:block">
              <PaperPlaneIcon />
            </div>
          </div>

          <div className="pointer-events-auto relative overflow-hidden rounded-[20px] bg-[#FFD600] p-4 md:p-6">
            <div className="relative z-10">
              <h2 className="mb-0.5 max-w-md origin-left font-archivo text-2xl italic leading-[0.85] tracking-[-0.05em] text-black skew-x-[-12deg] sm:text-3xl md:text-5xl">
                ALWAYS HERE
                <br />
                TO HELP
              </h2>
              <p className="mb-3 max-w-md text-[13px] font-bold leading-tight text-black/90">
                Whether you&apos;re a clinic owner or a startup founder, our support
                team has you covered 24/7.
              </p>

              <div className="flex flex-wrap gap-1.5">
                <a
                  href={site.phoneHref}
                  className="flex items-center gap-1 rounded-full bg-black px-4 py-2 text-[9px] font-black tracking-tighter text-white uppercase transition-transform hover:scale-105 active:scale-95"
                >
                  Get Support <ArrowUpRight className="h-2.5 w-2.5" />
                </a>
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-full bg-black px-4 py-2 text-[9px] font-black tracking-tighter text-white uppercase transition-transform hover:scale-105 active:scale-95"
                >
                  WhatsApp Support <ArrowUpRight className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>

            <div className="absolute top-5 right-3 hidden opacity-60 md:block">
              <SupportIcon />
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="pointer-events-none relative z-0 my-2 overflow-hidden py-1 md:my-3">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="mr-3 flex items-center rounded-lg bg-[#ff8c61] px-5 py-2.5">
                  <span className="font-archivo text-4xl tracking-[-0.05em] text-black md:text-6xl">
                    GET EDITCO
                  </span>
                </div>
                <div className="mr-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#7C3AED] md:h-20 md:w-20">
                  <img
                    src="https://res.cloudinary.com/dxeoibunj/image/upload/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png"
                    alt=""
                    className="h-8 w-8 brightness-0 md:h-10 md:w-10"
                  />
                </div>
                <div className="mr-3 flex items-center rounded-lg bg-[#3B82F6] px-5 py-2.5">
                  <span className="font-archivo text-4xl tracking-[-0.05em] text-black md:text-6xl">
                    GET EDITCO
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="pointer-events-none flex flex-col gap-1.5 md:flex-row">
          <div className="grid grid-cols-2 gap-1.5 md:w-[240px]">
            {[
              { icon: <Mail className="h-6 w-6" />, label: "Email", href: `mailto:${site.email}` },
              { icon: <XIcon />, label: "X", href: "#" },
              { icon: <Instagram className="h-6 w-6" />, label: "Instagram", href: site.instagram },
              { icon: <LinkedInIcon />, label: "LinkedIn", href: site.linkedin },
            ].map((social) => (
              <div
                key={social.label}
                className="pointer-events-auto flex aspect-square items-center justify-center rounded-[12px] bg-white text-black transition-transform hover:scale-105 active:scale-95"
              >
                <Link
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full w-full items-center justify-center"
                >
                  {social.icon}
                </Link>
              </div>
            ))}
          </div>

          <div className="pointer-events-auto relative flex flex-1 flex-col justify-between overflow-hidden rounded-[24px] bg-[#36DF93] p-4 text-black md:p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <h2 className="max-w-[260px] origin-left font-archivo text-2xl italic leading-[0.85] tracking-[-0.05em] skew-x-[-12deg] sm:text-3xl md:text-4xl">
                BUILD WITH EDITCO.
                <br />
                THEN MAKE IT ALL HAPPEN.
              </h2>

              <div className="flex flex-col items-start gap-0.5 text-left md:items-end md:text-right">
                {footer.quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="origin-left font-archivo text-sm leading-none tracking-tight italic skew-x-[-8deg] transition-opacity hover:opacity-70 sm:text-base md:origin-right"
                  >
                    {link.label.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col items-start justify-between gap-2 sm:items-end md:flex-row md:items-end">
              <p className="text-[8px] font-black opacity-60">
                © 2025 {site.name.toUpperCase()}, INC.
              </p>
              <div className="flex flex-col items-start gap-0 text-left sm:items-end sm:text-right">
                <Link href="#" className="text-[8px] font-black tracking-wider uppercase opacity-60 hover:opacity-100">
                  Brand Assets
                </Link>
                <Link href="#" className="text-[8px] font-black tracking-wider uppercase opacity-60 hover:opacity-100">
                  Privacy Notice
                </Link>
                <Link href="#" className="text-[8px] font-black tracking-wider uppercase opacity-60 hover:opacity-100">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
