"use client";

import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import type { BlogFaqItem } from "@/lib/parseBlogFaqs";

type BlogFaqPanelProps = {
  faqs: BlogFaqItem[];
  accent?: string;
};

export function BlogFaqPanel({ faqs, accent = "#ff8c61" }: BlogFaqPanelProps) {
  if (faqs.length === 0) return null;

  return (
    <section className="border-t-4 border-white/10 bg-gaude-black px-6 py-16 md:px-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl"
      >
        <aside
          className="border-4 border-white/25 bg-white/[0.04] p-6 md:p-10"
          style={{ boxShadow: `8px 8px 0 0 ${accent}` }}
          aria-labelledby="blog-faq-heading"
        >
          <div className="mb-8 border-b-2 border-white/10 pb-6">
            <p className="mb-2 font-archivo text-xs font-black uppercase tracking-[0.25em] text-gaude-orange">
              Got questions?
            </p>
            <h2
              id="blog-faq-heading"
              className="font-archivo text-3xl font-black uppercase tracking-tight text-white md:text-4xl"
            >
              Frequently Asked Questions
            </h2>
            <p className="mt-3 font-inter text-sm font-medium leading-relaxed text-white/60 md:text-base">
              Quick answers about this topic — expand any question below.
            </p>
          </div>

          <motion.div className="flex flex-col gap-3" role="list">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group border-4 border-white/20 bg-gaude-black/60 open:border-white/35 open:bg-white/[0.08] transition-colors"
                role="listitem"
              >
                <summary className="cursor-pointer list-none px-5 py-4 font-archivo text-sm font-black uppercase tracking-wide text-white marker:content-none md:text-base [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    <span>{item.q}</span>
                    <Plus
                      className="size-5 shrink-0 text-gaude-orange transition-transform group-open:rotate-45"
                      strokeWidth={3}
                      aria-hidden
                    />
                  </span>
                </summary>
                <div className="border-t-2 border-white/10 px-5 pb-5 pt-3 font-inter text-sm font-medium leading-relaxed text-white/85 md:text-base">
                  {item.a}
                </div>
              </details>
            ))}
          </motion.div>
        </aside>
      </motion.div>
    </section>
  );
}
