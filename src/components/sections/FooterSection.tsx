"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Instagram, Youtube, Mail } from "lucide-react";
import { footer } from "@/content/landing";
import { site } from "@/content/site";
import { sectionFlow } from "@/lib/stickyStack";

// Custom Exact SVG Icons
const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.252-.192.37-.29a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .077.01c.118.098.245.196.37.29a.077.077 0 0 1-.006.127 12.29 12.29 0 0 1-1.872.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a2.7 2.7 0 0 0-2.7-2.7c-1.2 0-2.1.7-2.5 1.5v-1.3H10v7.8h3.3v-4.2c0-.6.4-1.1 1.1-1.1.7 0 1.1.5 1.1 1.1v4.2h3.3M6.7 18.5V10.7H10v7.8H6.7m1.6-9a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4z" />
  </svg>
);

const PaperPlaneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-24 h-24 text-black/10">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SupportIcon = () => (
  <svg viewBox="0 0 100 100" className="w-32 h-32 text-black">
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="opacity-20" />
    <path d="M30 50c0-11 9-20 20-20s20 9 20 20v10c0 5.5-4.5 10-10 10h-20c-5.5 0-10-4.5-10-10V50z" fill="none" stroke="currentColor" strokeWidth="4" />
    <circle cx="35" cy="55" r="8" fill="currentColor" />
    <circle cx="65" cy="55" r="8" fill="currentColor" />
    <path d="M40 75c0 3 4 5 10 5s10-2 10-5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export function FooterSection() {
  return (
    <footer
      id={footer.id}
      className={`relative overflow-hidden bg-black py-4 md:py-6 font-inter ${sectionFlow}`}
    >
      <div className="mx-auto max-w-[1400px] px-1 md:px-2">
        {/* Top Cards Section */}
        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
          {/* Newsletter Card */}
          <div className="relative overflow-hidden rounded-[20px] bg-[#FFD600] p-4 md:p-6">
            <div className="relative z-10">
              <h2 className="mb-0.5 max-w-md font-archivo text-3xl italic leading-[0.8] tracking-[-0.05em] text-black md:text-5xl skew-x-[-12deg] origin-left">
                YOUR INBOX<br />JUST GOT BETTER
              </h2>
              <p className="mb-3 max-w-[260px] text-[13px] font-bold leading-tight text-black/90">
                Subscribe to our newsletter for VIP access to news, offers, and insights!
              </p>
              
              <div className="flex flex-col gap-1.5">
                <div className="relative flex max-w-xs items-center">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full rounded-full border-none bg-white px-3.5 py-2 text-[11px] text-black placeholder-black/40 focus:ring-1 focus:ring-black/10"
                  />
                  <button className="absolute right-1 rounded-full bg-black px-3.5 py-1 text-[9px] font-black text-white transition-transform hover:scale-105 active:scale-95">
                    SUBSCRIBE
                  </button>
                </div>
                <label className="flex items-start gap-1 text-[8px] font-bold text-black/60 leading-none">
                  <input type="checkbox" className="h-2.5 w-2.5 rounded border-none bg-black/10 text-black focus:ring-transparent" />
                  <span>I agree to receive communications from {site.name}.</span>
                </label>
              </div>
            </div>
            
            {/* Paper Plane Icon */}
            <div className="absolute right-3 top-8 hidden rotate-[-10deg] md:block opacity-40">
              <PaperPlaneIcon />
            </div>
          </div>

          {/* Support Card */}
          <div className="relative overflow-hidden rounded-[20px] bg-[#FFD600] p-4 md:p-6">
            <div className="relative z-10">
              <h2 className="mb-0.5 max-w-md font-archivo text-3xl italic leading-[0.8] tracking-[-0.05em] text-black md:text-5xl skew-x-[-12deg] origin-left">
                ALWAYS HERE<br />TO HELP
              </h2>
              <p className="mb-3 max-w-md text-[13px] font-bold leading-tight text-black/90">
                Whether you're a clinic owner or a startup founder, our support team has you covered 24/7.
              </p>
              
              <div className="flex flex-wrap gap-1.5">
                <button className="flex items-center gap-1 rounded-full bg-black px-4 py-2 text-[9px] font-black text-white transition-transform hover:scale-105 active:scale-95 uppercase tracking-tighter">
                  Get Support <ArrowUpRight className="h-2.5 w-2.5" />
                </button>
                <button className="flex items-center gap-1 rounded-full bg-black px-4 py-2 text-[9px] font-black text-white transition-transform hover:scale-105 active:scale-95 uppercase tracking-tighter">
                  WhatsApp Support <ArrowUpRight className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>
            
            {/* Support Illustration */}
            <div className="absolute right-3 top-5 hidden md:block opacity-60">
              <SupportIcon />
            </div>
          </div>
        </div>

        {/* Marquee Section */}
        <div className="my-2 overflow-hidden py-1 md:my-3">
          <motion.div 
            className="flex whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="mr-3 flex items-center rounded-lg bg-[#FF4E00] px-5 py-2.5">
                  <span className="font-archivo text-4xl tracking-[-0.05em] text-black md:text-6xl">GET EDITCO</span>
                </div>
                <div className="mr-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#7C3AED] md:h-20 md:w-20">
                  <img 
                    src="https://res.cloudinary.com/dxeoibunj/image/upload/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png" 
                    alt="Logo" 
                    className="h-8 w-8 md:h-10 md:w-10 brightness-0"
                  />
                </div>
                <div className="mr-3 flex items-center rounded-lg bg-[#3B82F6] px-5 py-2.5">
                  <span className="font-archivo text-4xl tracking-[-0.05em] text-black md:text-6xl">GET EDITCO</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-1.5 md:flex-row">
          {/* Socials Grid */}
          <div className="grid grid-cols-2 gap-1.5 md:w-[240px]">
            {[
              { icon: <Mail className="h-6 w-6" />, label: "Email", href: `mailto:${site.email}` },
              { icon: <XIcon />, label: "X", href: "#" },
              { icon: <Instagram className="h-6 w-6" />, label: "Instagram", href: site.instagram },
              { icon: <LinkedInIcon />, label: "LinkedIn", href: site.linkedin },
            ].map((social) => (
              <div
                key={social.label}
                className="flex aspect-square items-center justify-center rounded-[12px] bg-white text-black transition-transform hover:scale-105 active:scale-95"
              >
                {typeof social.icon === "string" ? social.icon : (
                  <Link 
                    href={social.href} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full w-full items-center justify-center"
                  >
                    {social.icon}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Large Green Card */}
          <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-[24px] bg-[#36DF93] p-4 md:p-6 text-black">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              {/* Left Headline */}
              <h2 className="max-w-[260px] font-archivo text-3xl italic leading-[0.8] tracking-[-0.05em] md:text-4xl skew-x-[-12deg] origin-left">
                BUILD WITH EDITCO.<br />THEN MAKE IT ALL HAPPEN.
              </h2>

              {/* Right Nav Links */}
              <div className="flex flex-col items-end gap-0.5 text-right">
                {footer.quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="font-archivo text-base italic tracking-tight hover:opacity-70 transition-opacity skew-x-[-8deg] leading-none origin-right"
                  >
                    {link.label.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col items-end justify-between gap-2 md:flex-row">
              {/* Bottom Left Copyright */}
              <p className="text-[8px] font-black opacity-60">
                © 2025 {site.name.toUpperCase()}, INC.
              </p>

              {/* Bottom Right Legal Links */}
              <div className="flex flex-col items-end gap-0 text-right">
                <Link href="#" className="text-[8px] font-black opacity-60 hover:opacity-100 uppercase tracking-wider">Brand Assets</Link>
                <Link href="#" className="text-[8px] font-black opacity-60 hover:opacity-100 uppercase tracking-wider">Privacy Notice</Link>
                <Link href="#" className="text-[8px] font-black opacity-60 hover:opacity-100 uppercase tracking-wider">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

