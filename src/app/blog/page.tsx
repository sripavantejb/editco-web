"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { blogPosts } from "@/content/blog";
import { MagneticNav } from "@/components/motion/MagneticNav";
import { FloatingBottomNav } from "@/components/motion/FloatingBottomNav";

const CATEGORIES = [
  "All",
  ...Array.from(new Set(blogPosts.map((p) => p.category))),
];

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function BlogPage() {
  const [active, setActive] = useState("All");

  const filtered = useMemo(() => {
    if (active === "All") return blogPosts;
    return blogPosts.filter((p) => p.category === active);
  }, [active]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <MagneticNav />
      <FloatingBottomNav />

      <main className="mx-auto max-w-3xl px-5 pb-28 pt-28 sm:px-8 md:px-6 md:pb-36 md:pt-36">
        {/* Hero — quiet */}
        <header className="mb-14 md:mb-20">
          <p className="mb-3 font-archivo text-[10px] font-bold uppercase tracking-[0.28em] text-gaude-orange">
            Journal
          </p>
          <h1 className="font-archivo text-4xl font-black uppercase tracking-tighter text-white sm:text-5xl md:text-6xl">
            Blog
          </h1>
          <p className="mt-4 max-w-md font-inter text-base font-medium leading-relaxed text-white/50">
            Clear writing on AI, automation, and growth systems.
          </p>
        </header>

        {/* Filters — text only */}
        <div className="mb-10 flex flex-wrap gap-x-5 gap-y-2 border-b border-white/10 pb-5 md:mb-12">
          {CATEGORIES.map((cat) => {
            const isOn = active === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={`font-archivo text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                  isOn
                    ? "text-gaude-orange"
                    : "text-white/35 hover:text-white/70"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* List */}
        <ul className="divide-y divide-white/10">
          {filtered.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-3 py-7 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-10 sm:py-8"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-archivo text-[10px] font-bold uppercase tracking-[0.18em] text-gaude-orange/90">
                      {post.category}
                    </span>
                    <span className="font-inter text-[11px] text-white/30">
                      {formatDate(post.date)} · {post.readTime}
                    </span>
                  </div>
                  <h2 className="font-archivo text-xl font-black uppercase leading-[1.15] tracking-tight text-white transition-colors group-hover:text-gaude-orange sm:text-2xl">
                    {post.title}
                  </h2>
                  <p className="mt-2 max-w-xl font-inter text-sm leading-relaxed text-white/40 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gaude-orange sm:mt-0" />
              </Link>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="py-16 text-center font-inter text-sm text-white/40">
            No articles in this topic yet.
          </p>
        )}

        {/* Quiet CTA */}
        <div className="mt-20 border-t border-white/10 pt-10 md:mt-28 md:pt-12">
          <p className="font-archivo text-lg font-black uppercase tracking-tight text-white md:text-xl">
            Want systems, not more reading?
          </p>
          <Link
            href="/#cta"
            className="mt-5 inline-flex items-center gap-2 font-archivo text-xs font-bold uppercase tracking-[0.2em] text-gaude-orange transition-colors hover:text-white"
          >
            Book a call
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
