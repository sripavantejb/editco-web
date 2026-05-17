"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { blogPosts, categoryColors } from "@/content/blog";
import { MagneticNav } from "@/components/motion/MagneticNav";
import { FloatingBottomNav } from "@/components/motion/FloatingBottomNav";

const CATEGORIES = ["All", "AI Agents", "Automation", "Websites", "RAG", "SaaS", "Content", "Branding", "SEO/AEO"];

const accentBg: Record<string, string> = {
  "#ff4e00": "bg-gaude-orange",
  "#c3a4f6": "bg-gaude-purple",
  "#2fdf92": "bg-gaude-green",
  "#fca5cc": "bg-gaude-pink",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gaude-black text-white">
      <MagneticNav />
      <FloatingBottomNav />

      {/* HERO */}
      <section className="relative overflow-hidden border-b-4 border-white/10 px-6 pb-16 pt-32 md:px-12 md:pt-40">
        {/* Background grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block border-2 border-gaude-orange bg-gaude-orange px-4 py-1 font-inter text-xs font-black uppercase tracking-widest text-white">
              Editco Media — The Blog
            </span>
            <h1 className="mt-6 font-archivo text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-8xl">
              INSIGHTS ON<br />
              <span className="text-gaude-orange">AI · AUTOMATION</span><br />
              & GROWTH
            </h1>
            <p className="mt-6 max-w-xl font-inter text-base font-medium leading-relaxed text-white/60 md:text-lg">
              20 deep-dive guides on AI agents, automation, websites, RAG, SaaS, content, branding, and SEO/AEO — written for business owners who want real answers.
            </p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-6 border-t-2 border-white/10 pt-8"
          >
            {[["20", "Articles"], ["8", "Topics"], ["2026", "Published"]].map(([num, label]) => (
              <div key={label}>
                <p className="font-archivo text-4xl font-black text-gaude-orange">{num}</p>
                <p className="font-inter text-xs font-black uppercase tracking-widest text-white/40">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURED POST */}
      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 font-inter text-xs font-black uppercase tracking-widest text-white/30">Featured Post</p>
          <Link href={`/blog/${blogPosts[0].slug}`} className="group block">
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="relative overflow-hidden border-4 border-white bg-white text-gaude-black shadow-[8px_8px_0_0_#ff4e00] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_0_#ff4e00]"
            >
              <div className="grid md:grid-cols-[1fr_auto]">
                <div className="p-8 md:p-12">
                  <span className="inline-block border-2 border-gaude-black bg-gaude-orange px-3 py-1 font-inter text-[10px] font-black uppercase tracking-widest text-white">
                    {blogPosts[0].category}
                  </span>
                  <h2 className="mt-4 font-archivo text-3xl font-black uppercase leading-tight tracking-tight text-gaude-black md:text-5xl">
                    {blogPosts[0].title}
                  </h2>
                  <p className="mt-4 max-w-2xl font-inter text-base font-medium leading-relaxed text-gaude-black/70">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="mt-8 flex items-center gap-6">
                    <span className="flex items-center gap-2 font-archivo text-sm font-black uppercase tracking-wide text-gaude-black group-hover:text-gaude-orange transition-colors">
                      Read Article <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </span>
                    <span className="font-inter text-xs text-gaude-black/40">{blogPosts[0].readTime} read · {blogPosts[0].date}</span>
                  </div>
                </div>
                <div className="hidden items-center justify-center border-l-4 border-gaude-black bg-gaude-orange p-12 md:flex">
                  <span className="font-archivo text-8xl font-black text-white/30">01</span>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* ALL POSTS GRID */}
      <section className="px-6 pb-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-center justify-between">
            <p className="font-inter text-xs font-black uppercase tracking-widest text-white/30">All Posts</p>
            <p className="font-inter text-xs font-black text-white/30">{blogPosts.length} articles</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.slice(1).map((post, i) => {
              const bgClass = accentBg[post.accent] ?? "bg-gaude-orange";
              const rotations = ["rotate-[-0.5deg]", "rotate-[0.5deg]", "rotate-[-0.3deg]", "rotate-[0.3deg]"];
              const rot = rotations[i % rotations.length];
              return (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: (i % 3) * 0.08 }}
                >
                  <Link href={`/blog/${post.slug}`} className="group block h-full">
                    <div className={`flex h-full flex-col border-4 border-white bg-white text-gaude-black shadow-[6px_6px_0_0_#ffffff30] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_${post.accent}] ${rot}`}>
                      {/* Color header */}
                      <div className={`flex items-center justify-between border-b-4 border-gaude-black p-4 ${bgClass}`}>
                        <span className="font-inter text-[9px] font-black uppercase tracking-widest text-gaude-black">
                          {post.category}
                        </span>
                        <span className="font-archivo text-2xl font-black text-gaude-black/20">
                          {String(i + 2).padStart(2, "0")}
                        </span>
                      </div>
                      {/* Content */}
                      <div className="flex flex-1 flex-col p-6">
                        <h2 className="font-archivo text-lg font-black uppercase leading-tight tracking-tight text-gaude-black line-clamp-3">
                          {post.title}
                        </h2>
                        <p className="mt-3 flex-1 font-inter text-sm font-medium leading-relaxed text-gaude-black/60 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="mt-6 flex items-center justify-between border-t-2 border-gaude-black/10 pt-4">
                          <span className="font-inter text-[10px] font-black uppercase tracking-widest text-gaude-black/40">
                            {post.readTime} read
                          </span>
                          <ArrowUpRight size={16} className="text-gaude-black/30 transition-all group-hover:text-gaude-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t-4 border-white/10 bg-gaude-black px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="border-4 border-white bg-white p-8 shadow-[8px_8px_0_0_#ff4e00] md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-archivo text-3xl font-black uppercase tracking-tight text-gaude-black md:text-4xl">
                  Ready to build something<br /><span className="text-gaude-orange">that actually works?</span>
                </h2>
                <p className="mt-3 font-inter text-sm text-gaude-black/60">Ping us — we'll answer honestly.</p>
              </div>
              <Link
                href="/#cta"
                className="inline-flex items-center gap-2 border-4 border-gaude-black bg-gaude-orange px-8 py-4 font-archivo text-sm font-black uppercase tracking-wide text-white shadow-[4px_4px_0_0_#0a0a0a] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#0a0a0a]"
              >
                Book a Free Call <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
