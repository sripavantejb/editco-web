"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getPost } from "@/content/blog";
import { BlogFaqPanel } from "@/components/blog/BlogFaqPanel";
import { MagneticNav } from "@/components/motion/MagneticNav";
import { FloatingBottomNav } from "@/components/motion/FloatingBottomNav";

const accentBg: Record<string, string> = {
  "#ff4e00": "bg-gaude-orange",
  "#c3a4f6": "bg-gaude-purple",
  "#2fdf92": "bg-gaude-green",
  "#fca5cc": "bg-gaude-pink",
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = getPost(slug);

  if (!post) {
    return notFound();
  }

  const bgClass = accentBg[post.accent] ?? "bg-gaude-orange";

  return (
    <div className="min-h-screen bg-gaude-black text-white">
      <MagneticNav />
      <FloatingBottomNav />

      {/* HEADER */}
      <section className="relative overflow-hidden border-b-4 border-white/10 px-6 pb-16 pt-32 md:px-12 md:pt-40">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        
        <div className="relative mx-auto max-w-4xl">
          <Link href="/blog" className="mb-8 inline-flex items-center gap-2 font-inter text-xs font-black uppercase tracking-widest text-white/50 transition-colors hover:text-gaude-orange">
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <span className={`inline-block border-2 border-gaude-black px-4 py-1 font-inter text-[10px] font-black uppercase tracking-widest text-gaude-black ${bgClass}`}>
                {post.category}
              </span>
              <span className="font-inter text-xs font-bold text-white/40">{post.date}</span>
              <span className="font-inter text-xs font-bold text-white/40">·</span>
              <span className="font-inter text-xs font-bold text-white/40">{post.readTime} read</span>
            </div>

            <h1 className="font-archivo text-3xl font-black uppercase leading-[0.95] tracking-tighter text-white sm:text-4xl md:text-6xl lg:text-7xl">
              {post.title}
            </h1>
            
            <p className="mt-8 border-l-4 border-gaude-orange pl-6 font-inter text-lg font-medium leading-relaxed text-white/70 md:text-xl">
              {post.excerpt}
            </p>
          </motion.div>
        </div>
      </section>

      {/* CONTENT */}
      <section
        className={`px-6 py-16 md:px-12 md:py-24 ${post.faqs?.length ? "border-b-4 border-white/10" : ""}`}
      >
        <div className="mx-auto max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="prose prose-invert prose-base sm:prose-lg max-w-none break-words font-inter [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
          >
            {post.content ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <p className="text-center text-gray-400 italic">This article is being prepared. Stay tuned for updates.</p>
            )}
          </motion.div>
        </div>
      </section>

      {post.faqs && post.faqs.length > 0 ? (
        <BlogFaqPanel faqs={post.faqs} accent={post.accent} />
      ) : null}

      {/* CTA */}
      <section className="border-t-4 border-white/10 bg-gaude-black px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl">
          <div className={`border-4 border-white p-8 shadow-[8px_8px_0_0_${post.accent}] md:p-12 ${bgClass} text-gaude-black`}>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-archivo text-3xl font-black uppercase tracking-tight md:text-4xl">
                  Ready to build something<br />that actually works?
                </h2>
              </div>
              <Link
                href="/#cta"
                className="inline-flex shrink-0 items-center gap-2 border-4 border-gaude-black bg-white px-8 py-4 font-archivo text-sm font-black uppercase tracking-wide text-gaude-black shadow-[4px_4px_0_0_#0a0a0a] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#0a0a0a]"
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
