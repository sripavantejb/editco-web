"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { services } from "@/content/landing";
import { sectionFlow } from "@/lib/stickyStack";
import { BrutalistLink } from "@/components/ui/BrutalistLink";
import { site } from "@/content/site";

export function ServicesSection() {
  return (
    <section
      id={services.id}
      className={`relative bg-gaude-black text-white ${sectionFlow}`}
    >
      {/* SECTION 1: Intro */}
      <div className="mx-auto max-w-[1200px] px-6 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-inter text-xs font-black uppercase tracking-[0.2em] text-gaude-orange md:text-sm">
            {services.label}
          </span>
          <h2 className="mt-2 font-archivo text-3xl uppercase leading-[0.95] tracking-tighter text-white md:text-5xl lg:text-6xl">
            GROWTH <br /> SYSTEMS FOR <br /> LEADS & <span className="text-gaude-orange">REVENUE</span>
          </h2>
          <p className="mt-6 max-w-[720px] font-inter text-lg font-medium leading-relaxed text-white/70 md:text-xl">
            {services.subtitle}
          </p>
        </motion.div>
      </div>

      {/* SECTION 2: Before vs After */}
      <div className="mx-auto max-w-[1200px] px-6 pb-[90px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[32px] border-4 border-white/10 bg-white/5 p-8 md:p-12"
        >
          <h3 className="mb-10 text-center font-space-grotesk text-3xl font-black uppercase tracking-tighter text-white">
            {services.comparison.title}
          </h3>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-0 lg:divide-x-4 lg:divide-white/10">
            {/* Before */}
            <div className="lg:pr-12">
              <h4 className="mb-6 font-archivo text-xl uppercase tracking-widest text-white/40">
                {services.comparison.before.title}
              </h4>
              <ul className="space-y-4">
                {services.comparison.before.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 font-inter text-base font-semibold text-white/60 md:text-lg">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <X className="size-3" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="lg:pl-12">
              <div className="mb-6 flex items-center justify-between">
                <h4 className="font-archivo text-xl uppercase tracking-widest text-gaude-orange">
                  {services.comparison.after.title}
                </h4>
                <span className="rounded-full bg-gaude-orange/20 px-3 py-1 font-inter text-[10px] font-black uppercase text-gaude-orange">
                  Outcome Focused
                </span>
              </div>
              <ul className="space-y-4">
                {services.comparison.after.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 font-inter text-base font-black text-white md:text-lg">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gaude-orange">
                      <Check className="size-3 text-white" strokeWidth={4} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SECTION 3: Sticky Growth Systems Layout */}
      <div className="mx-auto max-w-[1200px] px-6 pb-[130px]">
        <div className="grid items-start gap-16 lg:grid-cols-[0.38fr_0.62fr]">
          
          {/* Left Sticky Panel */}
          <div className="lg:sticky lg:top-[60px]">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-[24px] border-4 border-gaude-black bg-white p-8 shadow-[12px_12px_0_0_#ff4e00] md:p-10"
            >
              <span className="font-inter text-xs font-black uppercase tracking-widest text-gaude-orange">
                {services.stickyPanel.label}
              </span>
              <h3 className="mt-4 font-space-grotesk text-3xl font-black leading-tight tracking-tight text-gaude-black">
                {services.stickyPanel.heading}
              </h3>
              <p className="mt-6 font-inter text-base font-medium leading-relaxed text-gaude-black/70">
                {services.stickyPanel.paragraph}
              </p>
              
              <div className="mt-8">
                <BrutalistLink 
                  href={site.primaryCtaHref} 
                  variant="primary" 
                  className="w-full border-4 border-gaude-black bg-gaude-black text-white shadow-none hover:translate-y-0.5"
                >
                  {services.stickyPanel.cta}
                </BrutalistLink>
              </div>

              <div className="mt-8 border-t-2 border-gaude-black/10 pt-6">
                <p className="font-inter text-[10px] font-black uppercase tracking-widest text-gaude-black/40">
                  Includes:
                </p>
                <p className="mt-2 font-syne text-xs font-black uppercase tracking-tight text-gaude-black">
                  {services.stickyPanel.proof}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Side Stacked Cards */}
          <div className="flex flex-col gap-9">
            {services.cards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className={`group relative min-h-[320px] rounded-[24px] border-4 border-gaude-black p-8 shadow-[8px_8px_0_0_#0a0a0a] transition-all md:p-12 ${card.bgColor} text-gaude-black`}
              >
                <div className="flex flex-col gap-6">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-archivo text-4xl font-black opacity-20">
                      {card.number}
                    </span>
                    <span className="rounded-full border-2 border-gaude-black px-3 py-1 font-inter text-[10px] font-black uppercase tracking-widest">
                      {card.systemName}
                    </span>
                  </div>

                  {/* Card Title & Desc */}
                  <div>
                    <h4 className="font-space-grotesk text-3xl font-black uppercase leading-none tracking-tighter md:text-5xl">
                      {card.title}
                    </h4>
                    <p className="mt-6 max-w-xl font-inter text-base font-semibold leading-relaxed opacity-80 md:text-lg">
                      {card.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span key={tag} className="rounded-full border-2 border-gaude-black/10 bg-gaude-black/5 px-3 py-1 font-inter text-[11px] font-bold uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Outcome Box */}
                  <div className="mt-4 flex items-center gap-4 rounded-xl border-2 border-gaude-black/10 bg-gaude-black/5 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gaude-black text-white">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-inter text-[10px] font-black uppercase tracking-widest opacity-40">The Outcome</p>
                      <p className="font-syne text-sm font-black uppercase tracking-tight">{card.outcome}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
