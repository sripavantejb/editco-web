"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { caseStudy, works } from "@/content/landing";
import { sectionFlow } from "@/lib/stickyStack";
import MagicBento, { type MagicBentoCard } from "@/components/motion/MagicBento";

const bentoCards: MagicBentoCard[] = works.map((work) => ({
  id: work.id,
  title: work.title,
  description: work.location,
  label: work.category,
  image: work.image,
  wide: work.fullWidth,
  color: "#0a0a0a",
}));

export function CaseStudySection() {
  return (
    <section
      id={caseStudy.id}
      className={`relative min-h-screen bg-gaude-black py-24 ${sectionFlow}`}
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="mb-10 md:mb-16">
          <h2 className="font-archivo text-[clamp(1.75rem,8vw,3.75rem)] uppercase leading-[0.95] tracking-tighter text-white md:text-5xl lg:text-6xl">
            SELECTED <br /> WORKS
          </h2>
        </div>

        <MagicBento
          cards={bentoCards}
          textAutoHide={true}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={300}
          particleCount={12}
          glowColor="255, 78, 0"
        />

        <div className="mt-12 flex justify-center md:mt-16">
          <Link
            href="/work"
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.03] px-7 py-3.5 font-archivo text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-all hover:border-gaude-orange hover:bg-gaude-orange"
          >
            Know more
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
