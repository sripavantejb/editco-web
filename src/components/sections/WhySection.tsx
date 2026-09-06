"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Linkedin, ArrowUpRight, Globe } from "lucide-react";
import { crew } from "@/content/landing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionFlowAfter } from "@/lib/stickyStack";
import type { SiteCrewItem } from "@/lib/site-content";
import { cn } from "@/lib/utils";

const ACCENT = {
  orange: {
    bar: "bg-gaude-orange",
    ring: "ring-gaude-orange/35",
    glow: "group-hover:shadow-[6px_6px_0_0_#ff4e00]",
    chip: "bg-gaude-orange",
  },
  green: {
    bar: "bg-gaude-green",
    ring: "ring-gaude-green/40",
    glow: "group-hover:shadow-[6px_6px_0_0_#2fdf92]",
    chip: "bg-gaude-green",
  },
  purple: {
    bar: "bg-gaude-purple",
    ring: "ring-gaude-purple/45",
    glow: "group-hover:shadow-[6px_6px_0_0_#c3a4f6]",
    chip: "bg-gaude-purple",
  },
} as const;

function fallbackCrew(): SiteCrewItem[] {
  return crew.members.map((m) => ({
    slug: m.slug,
    name: m.name,
    role: m.role,
    description: m.description,
    accent: m.accent,
    image: m.image,
    linkedin: m.linkedin,
    portfolio: m.portfolio,
    imageScale: 1,
    imagePosX: 50,
    imagePosY: 18,
  }));
}

export function WhySection({ members: membersProp }: { members?: SiteCrewItem[] }) {
  const members = membersProp?.length ? membersProp : fallbackCrew();

  return (
    <section
      id={crew.id}
      className={`relative overflow-hidden bg-white px-4 py-14 md:px-8 md:py-20 ${sectionFlowAfter}`}
    >
      <div className="pointer-events-none absolute top-10 right-[6%] h-48 w-48 rounded-full bg-gaude-orange/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 left-[6%] h-52 w-52 rounded-full bg-gaude-purple/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 md:mb-10">
          <SectionHeading
            title={
              <>
                THE <span className="text-gaude-orange">CREW</span> BEHIND THE GROWTH
              </>
            }
            description="Founders who design, build, and ship — portfolios open if you want to go deeper."
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:gap-5 lg:gap-6">
          {members.map((member, i) => {
            const accent = ACCENT[member.accent] || ACCENT.orange;
            return (
              <motion.article
                key={member.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-[1.5rem] border-2 border-gaude-black bg-white p-3.5 shadow-[5px_5px_0_0_#0a0a0a] transition-[box-shadow,transform] duration-500 sm:p-4",
                  "hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#0a0a0a]",
                  accent.glow
                )}
              >
                <div className={cn("absolute inset-x-0 top-0 h-1", accent.bar)} />

                <div className="relative mx-auto mt-2 aspect-square w-[min(100%,160px)] sm:w-[min(100%,168px)] md:w-[min(100%,180px)]">
                  <div
                    className={cn(
                      "absolute inset-0 overflow-hidden bg-[#f3f3f3] ring-2 ring-offset-2 ring-offset-white transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      accent.ring,
                      "rounded-full group-hover:rounded-[1.25rem] group-hover:scale-[1.03]"
                    )}
                  >
                    <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="180px"
                        className="object-cover"
                        style={{
                          objectPosition: `${member.imagePosX ?? 50}% ${member.imagePosY ?? 50}%`,
                          transform: `scale(${member.imageScale ?? 1})`,
                        }}
                        unoptimized={member.image.startsWith("/api/")}
                        priority={i === 0}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-1 flex-col text-center">
                  <h3 className="font-archivo text-lg font-black uppercase tracking-tighter text-gaude-black md:text-xl">
                    {member.name}
                  </h3>
                  <p
                    className={cn(
                      "mx-auto mt-2 line-clamp-2 inline-block max-w-full rounded-full border-2 border-gaude-black px-2.5 py-1 font-inter text-[10px] font-bold uppercase leading-snug tracking-wide text-gaude-black",
                      accent.chip
                    )}
                  >
                    {member.role}
                  </p>
                  <p className="mt-2.5 line-clamp-2 flex-1 font-inter text-xs font-medium leading-relaxed text-gaude-black/60 md:text-[13px]">
                    {member.description}
                  </p>

                  <div className="mt-3.5 flex items-center justify-center gap-2">
                    {member.linkedin ? (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-gaude-black bg-white text-gaude-black transition hover:bg-gaude-orange hover:text-white"
                      >
                        <Linkedin size={15} />
                      </a>
                    ) : null}
                    {member.portfolio ? (
                      <a
                        href={member.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} portfolio`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-gaude-black bg-gaude-black px-3 font-archivo text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:border-gaude-orange hover:bg-gaude-orange"
                      >
                        <Globe size={12} />
                        Portfolio
                        <ArrowUpRight size={12} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
