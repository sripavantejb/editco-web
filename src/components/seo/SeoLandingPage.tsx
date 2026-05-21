"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight, Plus } from "lucide-react";
import type { SeoLandingPageContent } from "@/content/seo-landing-pages";
import { FooterSection } from "@/components/sections/FooterSection";

const accentStyles = {
  orange: {
    badge: "border-gaude-orange/30 bg-gaude-orange/10 text-gaude-orange",
    cta: "bg-gaude-orange",
    dot: "bg-gaude-orange",
  },
  purple: {
    badge: "border-gaude-purple/30 bg-gaude-purple/10 text-gaude-purple",
    cta: "bg-gaude-purple",
    dot: "bg-gaude-purple",
  },
  green: {
    badge: "border-gaude-green/30 bg-gaude-green/10 text-gaude-green",
    cta: "bg-gaude-green text-black",
    dot: "bg-gaude-green",
  },
} as const;

type SeoLandingPageProps = {
  content: SeoLandingPageContent;
};

export function SeoLandingPage({ content }: SeoLandingPageProps) {
  const accent = accentStyles[content.accent];

  const scrollToCta = () => {
    document.getElementById("seo-cta")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main id="main" className="relative w-full overflow-x-clip bg-gaude-black text-white pt-24">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[5%] left-[-10%] h-[500px] w-[500px] rounded-full bg-gaude-orange/10 blur-[130px]" />
        <div className="absolute top-[30%] right-[-10%] h-[600px] w-[600px] rounded-full bg-gaude-purple/8 blur-[150px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-[1200px] px-6 py-12 md:py-20">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2">
          {content.hero.breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-2">
              {i > 0 ? <ChevronRight className="size-3 text-white/30" aria-hidden /> : null}
              <Link
                href={crumb.href}
                className={`font-inter text-xs font-bold uppercase tracking-widest transition-colors ${
                  i === content.hero.breadcrumbs.length - 1
                    ? "text-gaude-orange"
                    : "text-white/45 hover:text-white"
                }`}
              >
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className={`mb-5 inline-flex items-center rounded-full border px-4 py-1.5 ${accent.badge}`}>
            <span className="font-archivo text-[9px] font-bold uppercase tracking-[0.2em] md:text-[10px]">
              {content.hero.eyebrow}
            </span>
          </div>
          <h1 className="font-archivo text-[clamp(1.75rem,4.5vw,3.5rem)] font-black uppercase leading-[1.05] tracking-tighter text-white">
            {content.hero.h1}
          </h1>
          <p className="mt-6 max-w-2xl font-inter text-base font-medium leading-relaxed text-white/75 md:text-lg">
            {content.hero.description}
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={scrollToCta}
              className={`flex h-14 cursor-pointer items-center justify-center rounded-full px-8 font-archivo text-[10px] font-bold uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-105 ${accent.cta}`}
            >
              {content.hero.primaryCta}
            </button>
            <Link
              href={content.hero.secondaryHref}
              className="flex h-14 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 font-archivo text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white/10"
            >
              {content.hero.secondaryCta}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1200px] px-6 py-16 md:py-24">
        <h2 className="font-archivo text-2xl font-black uppercase tracking-tighter text-white md:text-4xl">
          {content.problem.heading}
        </h2>
        <p className="mt-4 max-w-3xl font-inter text-base font-medium leading-relaxed text-white/70 md:text-lg">
          {content.problem.description}
        </p>
        <ul className="mt-8 space-y-4">
          {content.problem.points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-white/80 md:text-base">
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section className="relative z-10 border-y border-white/10 bg-[#050505] py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="font-archivo text-2xl font-black uppercase tracking-tighter text-white md:text-4xl">
            {content.benefits.heading}
          </h2>
          <p className="mt-4 max-w-3xl font-inter text-base text-white/70 md:text-lg">{content.benefits.description}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {content.benefits.items.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
              >
                <h3 className="font-space-grotesk text-lg font-bold uppercase tracking-tight text-white">
                  {item.title}
                </h3>
                <p className="mt-3 font-inter text-sm leading-relaxed text-white/70">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1200px] px-6 py-16 md:py-24">
        <h2 className="font-archivo text-2xl font-black uppercase tracking-tighter text-white md:text-4xl">
          {content.deliverables.heading}
        </h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {content.deliverables.items.map((item) => (
            <li key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <Check className="mt-0.5 size-4 shrink-0 text-gaude-green" aria-hidden />
              <span className="font-inter text-sm font-medium text-white/85">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="faq"
        className="relative z-10 border-t border-white/10 bg-gaude-black px-6 py-16 md:py-24"
        aria-labelledby="seo-faq-heading"
      >
        <div className="mx-auto max-w-3xl">
          <span className="font-archivo text-[10px] font-bold uppercase tracking-[0.2em] text-gaude-orange/90">
            {content.faq.eyebrow}
          </span>
          <h2 id="seo-faq-heading" className="mt-3 font-archivo text-2xl font-black uppercase tracking-tighter text-white md:text-4xl">
            {content.faq.heading}
          </h2>
          <div className="mt-8 flex flex-col gap-4">
            {content.faq.items.map((item) => (
              <details
                key={item.q}
                className="group border-4 border-white/20 bg-white/5 open:bg-white/10 transition-colors"
              >
                <summary className="cursor-pointer list-none px-5 py-4 font-archivo text-sm font-black uppercase tracking-wide text-white marker:content-none md:text-base [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <Plus className="size-5 shrink-0 text-gaude-orange transition-transform group-open:rotate-45" strokeWidth={3} aria-hidden />
                  </span>
                </summary>
                <div className="border-t-2 border-white/10 px-5 pb-5 pt-2 font-inter text-sm font-medium leading-relaxed text-white/85 md:text-base">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="seo-cta" className="relative z-10 border-t border-white/10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-archivo text-2xl font-black uppercase tracking-tighter text-white md:text-5xl">
            {content.finalCta.heading}
          </h2>
          <p className="mt-6 font-inter text-base font-medium text-white/70 md:text-lg">{content.finalCta.description}</p>
          <button
            type="button"
            data-cal-link="editco-media/15min"
            data-cal-namespace="15min"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
            className={`mt-8 inline-flex h-14 cursor-pointer items-center justify-center rounded-full px-10 font-archivo text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-105 ${accent.cta}`}
          >
            {content.finalCta.primaryCta}
          </button>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
