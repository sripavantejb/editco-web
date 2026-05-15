"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionFlow } from "@/lib/stickyStack";
import { Instagram, Linkedin, Twitter, ArrowUpRight } from "lucide-react";

const CREW = [
  {
    name: "Sri Pavan Tej B",
    role: "Creative Director & Co-founder",
    description: "Leading our creative vision with 8+ years in digital design and branding.",
    accent: "bg-gaude-orange",
    rotate: "rotate-[-1deg]",
  },
  {
    name: "Deepika M",
    role: "UX Designer & Backend Developer",
    description: "Crafting user experiences that delight and convert with data-driven design.",
    accent: "bg-gaude-purple",
    rotate: "rotate-[1deg]",
  },
  {
    name: "Harsha P",
    role: "Developer & Operations Manager",
    description: "Building scalable solutions with modern technologies and clean code.",
    accent: "bg-gaude-green",
    rotate: "rotate-[-0.5deg]",
  }
];

export function WhySection() {
  return (
    <section
      id="crew"
      className={`relative overflow-hidden bg-white px-4 py-16 md:px-8 md:py-24 ${sectionFlow}`}
    >
      {/* Neo-Brutalist Background Elements */}
      <div className="absolute top-20 right-[5%] h-64 w-64 rounded-full border-4 border-gaude-black bg-gaude-orange/10 blur-3xl" />
      <div className="absolute bottom-20 left-[5%] h-80 w-80 rounded-full border-4 border-gaude-black bg-gaude-purple/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-16">
          <SectionHeading 
            title={
              <>
                THE <span className="text-gaude-orange">CREW</span> BEHIND THE GROWTH
              </>
            } 
            description="A collective of designers, developers, and strategists obsessed with building high-performance digital systems."
          />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {CREW.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group relative flex flex-col border-4 border-gaude-black bg-white p-4 shadow-[12px_12px_0_0_#000] transition-all hover:shadow-[16px_16px_0_0_#000] hover:-translate-y-2 ${member.rotate}`}
            >
              {/* Initial-based Placeholder Container */}
              <div className="relative aspect-[4/5] overflow-hidden border-4 border-gaude-black">
                <div className={`flex h-full w-full items-center justify-center font-archivo text-6xl font-black text-gaude-black/20 ${member.accent} transition-all duration-500 group-hover:scale-105`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                
                {/* Social Floating Badge */}
                <div className="absolute bottom-4 right-4 flex gap-2 translate-y-12 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="flex h-10 w-10 items-center justify-center border-2 border-gaude-black bg-white shadow-[4px_4px_0_0_#000] hover:bg-gaude-orange hover:text-white transition-colors cursor-pointer">
                    <Linkedin size={18} />
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center border-2 border-gaude-black bg-white shadow-[4px_4px_0_0_#000] hover:bg-gaude-orange hover:text-white transition-colors cursor-pointer">
                    <Instagram size={18} />
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="mt-6 flex flex-col items-center text-center px-2">
                <h3 className="font-archivo text-2xl font-black uppercase tracking-tighter text-gaude-black">
                  {member.name}
                </h3>
                <p className={`mt-2 inline-block px-3 py-1 font-space-grotesk text-xs font-black uppercase tracking-widest text-gaude-black ${member.accent} border-2 border-gaude-black`}>
                  {member.role}
                </p>
                <p className="mt-4 font-inter text-sm font-medium leading-relaxed text-gaude-black/70">
                  {member.description}
                </p>
                
                <div className="mt-6 flex w-full items-center justify-center gap-2 border-t-2 border-gaude-black/10 pt-4 cursor-pointer group/link">
                  <span className="font-archivo text-[10px] font-black uppercase tracking-[0.2em] text-gaude-black/40 group-hover/link:text-gaude-black transition-colors">
                    Click for details
                  </span>
                  <ArrowUpRight size={14} className="text-gaude-black/40 group-hover/link:text-gaude-black transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
