"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  Zap,
  Palette,
  Users,
  Search,
  BarChart3,
  ShieldCheck,
  Rocket,
} from "lucide-react";
import { solution } from "@/content/landing";
import { SectionHeading } from "@/components/ui/SectionHeading";

const SOLUTION_ICONS = [
  Zap,
  Palette,
  Users,
  Search,
  BarChart3,
  ShieldCheck,
];

const cardColors = [
  "#D4FF3F", // Lime/Yellow
  "#C3A4F6", // Lavender
  "#FF8A5C", // Vibrant Orange
  "#36DF93", // Mint Green
  "#FF7EB6", // Pink
  "#88E0EF", // Cyan/Sky
];

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function SolutionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const total = solution.cards.length;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setIsDesktop(mq.matches);
    const updateMotion = () => setReduceMotion(motionMq.matches);
    update();
    updateMotion();
    mq.addEventListener("change", update);
    motionMq.addEventListener("change", updateMotion);
    return () => {
      mq.removeEventListener("change", update);
      motionMq.removeEventListener("change", updateMotion);
    };
  }, []);

  // Desktop: sticky stack focus from scroll progress
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (!isDesktop) return;
    const next = Math.min(total - 1, Math.max(0, Math.floor(progress * total)));
    setActiveIndex((prev) => (prev === next ? prev : next));
  });

  // Mobile: most-visible card via IntersectionObserver
  useEffect(() => {
    if (isDesktop) return;
    const ratios = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.cardIndex);
          if (Number.isNaN(idx)) continue;
          ratios.set(idx, entry.intersectionRatio);
        }
        let best = 0;
        let bestRatio = -1;
        for (const [idx, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = idx;
          }
        }
        if (bestRatio >= 0.2) {
          setActiveIndex((prev) => (prev === best ? prev : best));
        }
      },
      { threshold: [0.25, 0.4, 0.55, 0.7, 0.85], rootMargin: "-10% 0px -25% 0px" }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isDesktop, total]);

  const focusColor = cardColors[activeIndex % cardColors.length];
  const morphTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section
      id={solution.id}
      ref={containerRef}
      className="relative z-[50] w-full overflow-hidden bg-gaude-black py-16 md:pt-24 md:pb-48"
    >
      {/* Liquid glass backdrop — tints to focused card color */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gaude-black" />

        <motion.div
          className="absolute -left-[20%] top-[-10%] h-[70%] w-[70%] rounded-full"
          animate={{
            background: `radial-gradient(circle at center, ${hexToRgba(focusColor, 0.55)} 0%, transparent 68%)`,
          }}
          transition={morphTransition}
          style={{ filter: "blur(100px)" }}
        />
        <motion.div
          className="absolute -right-[15%] bottom-[-5%] h-[65%] w-[60%] rounded-full"
          animate={{
            background: `radial-gradient(circle at center, ${hexToRgba(focusColor, 0.4)} 0%, transparent 70%)`,
          }}
          transition={morphTransition}
          style={{ filter: "blur(110px)" }}
        />
        <motion.div
          className="absolute left-[30%] top-[35%] h-[40%] w-[45%] rounded-full"
          animate={{
            background: `radial-gradient(circle at center, ${hexToRgba(focusColor, 0.28)} 0%, transparent 65%)`,
          }}
          transition={morphTransition}
          style={{ filter: "blur(80px)" }}
        />

        {/* Frosted glass sheet */}
        <div className="solution-liquid-glass absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1100px] px-6">
        <div className="mb-12 md:mb-16">
          <SectionHeading
            title={
              <>
                Editco Media Builds Complete{" "}
                <span className="text-gaude-purple">Digital Growth Systems.</span>
              </>
            }
            description={solution.description}
            light
          />
        </div>

        <div className="relative flex flex-col gap-6 md:gap-[5vh]">
          {solution.cards.map((card, i) => (
            <Card
              key={card.title}
              card={card}
              index={i}
              total={total}
              scrollYProgress={scrollYProgress}
              isDesktop={isDesktop}
              cardRef={(el) => {
                cardRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type CardProps = {
  card: (typeof solution.cards)[number];
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  isDesktop: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
};

function Card({
  card,
  index,
  total,
  scrollYProgress,
  isDesktop,
  cardRef,
}: CardProps) {
  const Icon = SOLUTION_ICONS[index % SOLUTION_ICONS.length];
  const bgColor = cardColors[index % cardColors.length];

  const targetScale = 1 - (total - index) * 0.05;
  const scale = useTransform(
    scrollYProgress,
    [index / total, 1],
    [1, targetScale]
  );

  const topOffset = 60 + index * 20;

  return (
    <div
      ref={cardRef}
      data-card-index={index}
      className="relative flex items-stretch py-2 md:sticky md:top-0 md:h-[80vh] md:items-center md:py-0"
    >
      <motion.div
        style={{
          scale: isDesktop ? scale : 1,
          top: isDesktop ? topOffset : undefined,
          backgroundColor: bgColor,
        }}
        className="relative min-h-0 w-full overflow-visible rounded-[24px] border-4 border-black p-5 shadow-[8px_8px_0_0_#000] transition-shadow hover:shadow-[12px_12px_0_0_#000] sm:min-h-[420px] sm:overflow-hidden sm:rounded-[28px] sm:p-8 md:h-[500px] md:rounded-[32px] md:p-12"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, black 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex h-full flex-col justify-between md:flex-row md:items-center">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
                <Icon size={24} />
              </div>
              <span className="font-archivo text-xs font-black uppercase tracking-[0.2em] text-black/40">
                System 0{index + 1}
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="break-words font-archivo text-xl font-black uppercase leading-[1.05] tracking-tighter text-black sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl">
                {card.title}
              </h3>
              <p className="max-w-md font-inter text-sm font-medium leading-relaxed text-black/70 md:text-lg">
                {card.body}
              </p>
            </div>

            <div className="pt-4">
              <a
                href="#cta"
                className="group inline-flex items-center gap-3 rounded-full border-2 border-black bg-black px-6 py-3 font-archivo text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-transparent hover:text-black"
              >
                Get Started
                <Rocket
                  className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                  size={16}
                />
              </a>
            </div>
          </div>

          <div className="hidden flex-1 items-center justify-end md:flex">
            <div className="relative h-64 w-64 overflow-hidden rounded-2xl border-2 border-black/10 bg-black/[0.03] md:h-80 md:w-80">
              <CardIllustration index={index} />
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 hidden md:block">
          <p className="font-archivo text-[10px] font-black uppercase tracking-widest text-black/20">
            Editco Growth Engine v2.0 // Stacked Layer 0{index + 1}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function CardIllustration({ index }: { index: number }) {
  const illustrations = [
    <svg key="0" className="h-full w-full p-12" viewBox="0 0 200 120" fill="none">
      <rect x="20" y="20" width="160" height="90" rx="6" stroke="black" strokeWidth="2" />
      <rect x="30" y="45" width="40" height="40" rx="4" fill="black" fillOpacity="0.1" />
      <rect x="80" y="45" width="90" height="4" rx="2" fill="black" fillOpacity="0.2" />
      <rect x="80" y="55" width="70" height="4" rx="2" fill="black" fillOpacity="0.2" />
    </svg>,
    <svg key="1" className="h-full w-full p-12" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="40" stroke="black" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="60" cy="60" r="20" fill="black" fillOpacity="0.1" />
      <path d="M40 60H80" stroke="black" strokeWidth="2" />
      <path d="M60 40V80" stroke="black" strokeWidth="2" />
    </svg>,
    <svg key="2" className="h-full w-full p-12" viewBox="0 0 120 120" fill="none">
      <rect x="20" y="20" width="30" height="30" rx="4" stroke="black" strokeWidth="2" />
      <rect x="70" y="70" width="30" height="30" rx="4" stroke="black" strokeWidth="2" />
      <path d="M50 35H85V70" stroke="black" strokeWidth="2" strokeDasharray="4 2" />
    </svg>,
    <svg key="3" className="h-full w-full p-12" viewBox="0 0 120 120" fill="none">
      <path d="M20 20L100 100M20 100L100 20" stroke="black" strokeOpacity="0.1" strokeWidth="1" />
      <circle cx="60" cy="60" r="30" stroke="black" strokeWidth="2" />
      <rect x="45" y="45" width="30" height="30" fill="black" fillOpacity="0.1" />
    </svg>,
    <svg key="4" className="h-full w-full p-12" viewBox="0 0 200 120" fill="none">
      <path d="M20 100 L60 40 L100 80 L140 20 L180 60" stroke="black" strokeWidth="3" />
      <circle cx="140" cy="20" r="6" fill="black" />
    </svg>,
    <svg key="5" className="h-full w-full p-12" viewBox="0 0 120 120" fill="none">
      <circle cx="50" cy="50" r="30" stroke="black" strokeWidth="2" />
      <path d="M72 72L100 100" stroke="black" strokeWidth="4" strokeLinecap="round" />
    </svg>,
  ];

  return illustrations[index % illustrations.length];
}
