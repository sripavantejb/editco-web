"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { caseStudy, works as staticWorks } from "@/content/landing";
import { sectionFlow } from "@/lib/stickyStack";
import { HoverExpand } from "@/components/motion/HoverExpand";
import type { SiteWorkItem } from "@/lib/site-content";

export function CaseStudySection({ works: worksProp }: { works?: SiteWorkItem[] }) {
  const works = worksProp?.length
    ? worksProp
    : staticWorks.map((w) => ({
        id: w.id,
        title: w.title,
        location: w.location,
        category: w.category,
        image: w.image,
        fullWidth: w.fullWidth,
        problem: w.problem,
        approach: w.approach,
        outcome: w.outcome,
        focus: [...w.focus],
      }));

  const galleryImages = works.map((work) => ({
    src: work.image,
    alt: work.title,
    code: work.category,
  }));

  return (
    <section
      id={caseStudy.id}
      className={`relative flex min-h-[85svh] flex-col justify-center bg-gaude-black py-24 md:min-h-[90svh] md:py-28 ${sectionFlow}`}
    >
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
        <div className="mb-10 flex items-center justify-between gap-4 md:mb-14">
          <h2 className="font-archivo text-[clamp(1.75rem,6vw,3.75rem)] uppercase leading-none tracking-tighter text-white md:text-5xl lg:text-6xl">
            Selected{" "}
            <span className="text-gaude-orange">Works</span>
          </h2>

          <Link
            href="/work"
            aria-label="Know more about our work"
            title="Know more"
            className="group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white transition-all hover:border-gaude-orange hover:bg-gaude-orange md:h-12 md:w-12"
          >
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:h-[18px] md:w-[18px]" />
            <span className="sr-only">Know more</span>
          </Link>
        </div>

        <HoverExpand images={galleryImages} />
      </div>
    </section>
  );
}
