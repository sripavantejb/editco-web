"use client";

import { motion } from "framer-motion";
import { crew } from "@/content/landing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionFlowAfter } from "@/lib/stickyStack";
import { Linkedin, ArrowUpRight, Globe } from "lucide-react";

const CREW = [
  {
    name: "Sri Pavan Tej",
    role: "CO-FOUNDER — PRODUCT & TECHNOLOGY",
    description:
      "Sees the company as a set of systems that should still make sense later.",
    accent: "bg-gaude-orange",
    rotate: "rotate-[-1deg]",
    linkedin: "https://www.linkedin.com/in/sripavantejbalam/",
  },
  {
    name: "Harsha Polina",
    role: "CO-FOUNDER — STRATEGY & OPERATIONS",
    description:
      "Builds the business together in a way that lets the creative work stay clear and true.",
    accent: "bg-gaude-green",
    rotate: "rotate-[-0.5deg]",
    linkedin: "https://www.linkedin.com/in/harsha-polina/",
  },
  {
    name: "Deepika Mundla",
    role: "CO-FOUNDER — DESIGN & IDENTITY",
    description:
      "Shapes how Editco appears and how every product we make feels to use.",
    accent: "bg-gaude-purple",
    rotate: "rotate-[1deg]",
    linkedin: "https://www.linkedin.com/in/deepika-mundla/",
    portfolio: "https://dpka-s-portfolio.vercel.app/",
  },
] as const;

export function WhySection() {
  return (
    <section
      id={crew.id}
      className={`relative overflow-hidden bg-white px-4 py-16 md:px-8 md:py-24 ${sectionFlowAfter}`}
    >
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
              className={`group relative flex flex-col border-4 border-gaude-black bg-white p-4 shadow-[8px_8px_0_0_#000] transition-all hover:shadow-[12px_12px_0_0_#000] hover:-translate-y-2 md:shadow-[12px_12px_0_0_#000] md:hover:shadow-[16px_16px_0_0_#000] max-md:rotate-0 ${member.rotate}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden border-4 border-gaude-black">
                <div
                  className={`flex h-full w-full items-center justify-center font-archivo text-6xl font-black text-gaude-black/20 ${member.accent} transition-all duration-500 group-hover:scale-105`}
                >
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>

                <div className="absolute bottom-4 right-4 flex gap-2 translate-y-12 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on LinkedIn`}
                    className="flex h-10 w-10 items-center justify-center border-2 border-gaude-black bg-white shadow-[4px_4px_0_0_#000] transition-colors hover:bg-gaude-orange hover:text-white"
                  >
                    <Linkedin size={18} />
                  </a>
                  {"portfolio" in member && member.portfolio ? (
                    <a
                      href={member.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} portfolio`}
                      className="flex h-10 w-10 items-center justify-center border-2 border-gaude-black bg-white shadow-[4px_4px_0_0_#000] transition-colors hover:bg-gaude-orange hover:text-white"
                    >
                      <Globe size={18} />
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center px-2 text-center">
                <h3 className="font-archivo text-2xl font-black uppercase tracking-tighter text-gaude-black">
                  {member.name}
                </h3>
                <p
                  className={`mt-2 inline-block border-2 border-gaude-black px-3 py-1 font-space-grotesk text-xs font-black uppercase tracking-widest text-gaude-black ${member.accent}`}
                >
                  {member.role}
                </p>
                <p className="mt-4 font-inter text-sm font-medium leading-relaxed text-gaude-black/70">
                  {member.description}
                </p>

                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link mt-6 flex w-full cursor-pointer items-center justify-center gap-2 border-t-2 border-gaude-black/10 pt-4"
                >
                  <span className="font-archivo text-[10px] font-black uppercase tracking-[0.2em] text-gaude-black/40 transition-colors group-hover/link:text-gaude-black">
                    View LinkedIn
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="text-gaude-black/40 transition-colors group-hover/link:text-gaude-black"
                  />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
