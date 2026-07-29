"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { process as processContent } from "@/content/landing";
import { LineSidebar } from "@/components/motion/LineSidebar";
import { sectionFlowAfter } from "@/lib/stickyStack";

gsap.registerPlugin(ScrollTrigger);

const steps = processContent.steps;
const labels = steps.map((s) => s.title);

export function ProcessSection() {
  const stageRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(false);
  const current = steps[active] ?? steps[0];

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const sticky = stickyRef.current;
    if (!stage || !sticky) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () =>
          `+=${Math.max(
            steps.length *
              window.innerHeight *
              (window.matchMedia("(max-width: 1023px)").matches ? 0.45 : 0.7),
            1
          )}`,
        pin: sticky,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const next = Math.min(
            steps.length - 1,
            Math.floor(self.progress * steps.length)
          );
          setActive((prev) => (prev === next ? prev : next));
        },
      });
    }, stage);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id={processContent.id}
      ref={stageRef}
      className={`relative scroll-mt-24 bg-gaude-black text-white ${sectionFlowAfter}`}
    >
      <div
        ref={stickyRef}
        className="flex min-h-[100svh] flex-col justify-start overflow-x-clip px-4 pt-20 pb-12 sm:px-6 sm:pt-24 sm:pb-16 md:px-10 md:pt-28 md:pb-20"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative mx-auto w-full max-w-6xl">
          <p className="mb-3 font-archivo text-[10px] font-bold uppercase tracking-[0.25em] text-gaude-orange sm:text-xs">
            Our Process
          </p>
          <h2 className="max-w-2xl font-archivo text-[clamp(1.75rem,8vw,3rem)] font-black uppercase tracking-tighter text-white sm:text-5xl">
            Our{" "}
            <span className="italic text-gaude-orange">Execution</span> Process
          </h2>
          <p className="mt-5 max-w-xl font-inter text-base font-medium leading-relaxed text-white/55 md:text-lg">
            A high-performance roadmap engineered to take your business from
            stagnant to scaling.
          </p>

          <div className="mt-10 grid grid-cols-1 items-start gap-8 sm:mt-14 sm:gap-12 lg:grid-cols-[minmax(220px,0.9fr)_1.2fr] lg:gap-16">
            <LineSidebar
              items={labels}
              accentColor="#ff4e00"
              textColor="#9a9a94"
              markerColor="#2a2a2a"
              showIndex
              showMarker={!compact}
              proximityRadius={compact ? 70 : 100}
              maxShift={compact ? 0 : 28}
              falloff="smooth"
              markerLength={compact ? 0 : 56}
              markerGap={compact ? 0 : 8}
              tickScale={0.45}
              scaleTick
              itemGap={compact ? 14 : 28}
              fontSize={compact ? 0.85 : 1.15}
              smoothing={100}
              defaultActive={0}
              activeIndex={active}
              onItemClick={(index) => setActive(index)}
              className="min-w-0 font-archivo font-bold uppercase tracking-tight [&>ul>li>span]:break-words"
            />

            <article
              key={active}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 transition-opacity duration-300 sm:rounded-[1.75rem] sm:p-8 md:rounded-[2rem] md:p-10"
            >
              <p className="font-archivo text-sm font-semibold uppercase tracking-[0.22em] text-gaude-orange">
                Step {String(active + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-archivo text-2xl font-black uppercase tracking-tight text-white sm:mt-4 sm:text-3xl md:text-5xl">
                {current.title}
              </h3>
              <p className="mt-4 max-w-lg font-inter text-sm font-medium leading-relaxed text-white/55 sm:mt-5 sm:text-base md:text-lg">
                {current.body}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
