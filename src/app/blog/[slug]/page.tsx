"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getPost } from "@/content/blog";
import { BlogFaqPanel } from "@/components/blog/BlogFaqPanel";
import { MagneticNav } from "@/components/motion/MagneticNav";
import { FloatingBottomNav } from "@/components/motion/FloatingBottomNav";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = getPost(slug);

  if (!post) return notFound();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <MagneticNav />
      <FloatingBottomNav />

      <article className="mx-auto max-w-3xl px-5 pb-28 pt-28 sm:px-8 md:px-6 md:pb-36 md:pt-36">
        <Link
          href="/blog"
          className="mb-10 inline-flex items-center gap-2 font-archivo text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-gaude-orange"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Blog
        </Link>

        <header className="mb-12 border-b border-white/10 pb-10 md:mb-16 md:pb-12">
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-archivo text-[10px] font-bold uppercase tracking-[0.18em] text-gaude-orange">
              {post.category}
            </span>
            <span className="font-inter text-[11px] text-white/30">
              {formatDate(post.date)} · {post.readTime} read
            </span>
          </div>
          <h1 className="font-archivo text-3xl font-black uppercase leading-[1.05] tracking-tighter text-white sm:text-4xl md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 max-w-2xl font-inter text-base font-medium leading-relaxed text-white/50 md:text-lg">
            {post.excerpt}
          </p>
        </header>

        <div className="prose prose-invert prose-base max-w-none break-words font-inter text-white/70 prose-headings:font-archivo prose-headings:uppercase prose-headings:tracking-tight prose-a:text-gaude-orange prose-strong:text-white sm:prose-lg [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto">
          {post.content ? (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <p className="italic text-white/40">
              This article is being prepared. Stay tuned.
            </p>
          )}
        </div>

        {!!post.faqs?.length && (
          <div className="mt-16 border-t border-white/10 pt-10">
            <BlogFaqPanel faqs={post.faqs} />
          </div>
        )}

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-archivo text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All articles
          </Link>
          <Link
            href="/#cta"
            className="inline-flex items-center gap-2 font-archivo text-[10px] font-bold uppercase tracking-[0.2em] text-gaude-orange transition-colors hover:text-white"
          >
            Book a call
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    </div>
  );
}
