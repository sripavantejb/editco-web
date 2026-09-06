import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getSiteWork } from "@/lib/site-content";
import { MagneticNav } from "@/components/motion/MagneticNav";
import { FloatingBottomNav } from "@/components/motion/FloatingBottomNav";

export const dynamic = "force-dynamic";

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await getSiteWork(slug);

  if (!work) notFound();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <MagneticNav />
      <FloatingBottomNav />

      <article className="mx-auto max-w-3xl px-5 pb-28 pt-28 sm:px-8 md:px-6 md:pb-36 md:pt-36">
        <Link
          href="/work"
          className="mb-10 inline-flex items-center gap-2 font-archivo text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-gaude-orange"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Work
        </Link>

        <header className="mb-12 border-b border-white/10 pb-10 md:mb-16 md:pb-12">
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-archivo text-[10px] font-bold uppercase tracking-[0.18em] text-gaude-orange">
              {work.category}
            </span>
            <span className="font-inter text-[11px] text-white/30">
              {work.location}
            </span>
          </div>
          <h1 className="font-archivo text-3xl font-black uppercase leading-[1.05] tracking-tighter text-white sm:text-4xl md:text-5xl">
            {work.title}
          </h1>
          <p className="mt-5 max-w-2xl font-inter text-base font-medium leading-relaxed text-white/50 md:text-lg">
            {work.problem}
          </p>
        </header>

        <div className="space-y-12 font-inter text-base leading-relaxed text-white/70 sm:text-lg sm:leading-[1.7]">
          <section>
            <h2 className="mb-3 font-archivo text-xs font-bold uppercase tracking-[0.2em] text-white/35">
              The problem
            </h2>
            <p>{work.problem}</p>
          </section>

          <section>
            <h2 className="mb-3 font-archivo text-xs font-bold uppercase tracking-[0.2em] text-white/35">
              What we built
            </h2>
            <p>{work.approach}</p>
          </section>

          <section>
            <h2 className="mb-3 font-archivo text-xs font-bold uppercase tracking-[0.2em] text-white/35">
              The result
            </h2>
            <p>{work.outcome}</p>
          </section>

          <section>
            <h2 className="mb-4 font-archivo text-xs font-bold uppercase tracking-[0.2em] text-white/35">
              Focus
            </h2>
            <ul className="space-y-2">
              {work.focus.map((item) => (
                <li
                  key={item}
                  className="border-b border-white/10 pb-2 text-white/60"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 font-archivo text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All work
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
